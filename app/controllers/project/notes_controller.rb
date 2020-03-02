module Project
  class NotesController < ApplicationController
    def update
      @projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first unless params[:topic_id] == "drycreate"
      ActiveRecord::Base.transaction do
        if !@projects_task
          @projects_task = ProjectsTask.create(task_params)
          @projects_task.topic = Topic.find(params[:topic_id]) unless params[:topic_id] == "drycreate"
        end
        @projects_task.update(task_params)
        @projects_task.handle_deps(params[:note][:dry],
          params[:note][:depon],
          params[:note][:depby],
          params[:note][:categoryId])
        handle_modified()
        raise ActiveRecord::Rollback if params[:note][:dry] == "true"
      end
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
           puts "begin"
           messages += @projects_task.set_begin(params[:note][:begin],false)
         elsif  params[:note][:modified] == "duration"
           puts "duration"
           messages += @projects_task.set_duration(params[:note][:duration])
         elsif params[:note][:modified] == "end"
           puts "end"
           messages += @projects_task.set_end(params[:note][:end],false)
         end
         unless !@projects_task.begin
           puts "syncing dependees"
           messages += @projects_task.sync_dependees
         end
         unless !@projects_task.end
           puts "syncing dependers"
           messages += @projects_task.sync_dependers
         end
         puts messages
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
         raise ActiveRecord::Rollback unless messages.select { |k| k[:message_type] == "error" }.empty?
      end
      def task_params
        params.require(:note).permit( :begin,:end,:duration,:locked,:disallow)
      end
  end
end
