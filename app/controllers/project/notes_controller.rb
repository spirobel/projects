module Project
  class NotesController < ApplicationController
    def update
      @projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first unless params[:topic_id] == "drycreate"
      ActiveRecord::Base.transaction do
        if !@projects_task
          @projects_task = ProjectsTask.create(task_params)
          @projects_task.topic = Topic.find(params[:topic_id]) unless params[:topic_id] == "drycreate"
        end
        unless params[:topic_id] == "drycreate"
          @old_begin = @projects_task.begin
          @old_duration = @projects_task.duration
          @old_end = @projects_task.end
        end
        guardian = Guardian.new(current_user)
        guardian.ensure_can_edit_topic!(@projects_task.topic) unless params[:topic_id] == "drycreate"
        @projects_task.update(task_params)
        @projects_task.handle_deps(params[:note][:dry],
          params[:note][:depon],
          params[:note][:depby],
          params[:note][:categoryId])
        handle_modified()
        raise ActiveRecord::Rollback if params[:note][:dry] == "true"
      end
      @projects_task.recalc_longest_duration unless params[:note][:dry] == "true"
      render json: { note: return_note }
    end

    private


      def return_note
        note = {
          'id' => @projects_task.topic_id,
          'begin' => @projects_task.begin,
          'end' => @projects_task.end,
          'duration' => @projects_task.duration,
          'locked' => @projects_task.locked,
          'modified' => params[:note][:modified],
          'depon' => @projects_task.depon,
          'depby' => @projects_task.depby,
          'disallow' => @projects_task.disallow,
          'messages' => @messages,
          'categoryId' => params[:note][:categoryId]
        }
        note["id"] = "drycreate" unless @projects_task.topic_id
        return note
      end

      def handle_modified
        messages = []
         if params[:note][:modified] == "begin"
           messages += @projects_task.set_begin(params[:note][:begin],false)
         elsif  params[:note][:modified] == "duration"
           messages += @projects_task.set_duration(params[:note][:duration])
         elsif params[:note][:modified] == "end"
           messages += @projects_task.set_end(params[:note][:end],false)
         end
         unless !@projects_task.begin
           messages += @projects_task.sync_dependees
         else
           #we have to call sync_dependers on the latest ending dependee
           latest_ending_dependee = @projects_task.dependees.select{ |x| !x.end.nil?}.sort_by{|x| x.end }.reverse[0]
           @projects_task.set_begin(latest_ending_dependee.end,true) unless latest_ending_dependee.nil?
           @projects_task.save
         end
         unless !@projects_task.end
           messages += @projects_task.sync_dependers
         else
           #we have to call sync_dependees on the earliest starting depender
           earliest_starting_depender = @projects_task.dependers.select{ |x| !x.begin.nil?}.sort_by{|x| x.begin }[0]
           @projects_task.set_end(earliest_starting_depender.begin,true) unless earliest_starting_depender.nil?
           @projects_task.save
         end
         messages += @projects_task.change_messages(@old_begin,@old_duration,@old_end) unless params[:topic_id] == "drycreate"
         @messages = {}
         messages.each{ |m|
           unless m[:url].nil?
             @messages[m[:url]] = [] if @messages[m[:url]].nil?
             @messages[m[:url]] << m
           end
         }
         @messages.each{|k,t|
           t.uniq! {|m| m[:message]}
         }
         puts @messages.inspect
         raise ActiveRecord::Rollback unless messages.select { |k| k[:message_type] == "error" }.empty?
      end
      def task_params
        params.require(:note).permit( :begin,:end,:duration,:locked,:disallow)
      end
  end
end
