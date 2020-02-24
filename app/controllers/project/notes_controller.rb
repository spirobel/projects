module Project
  class NotesController < ApplicationController
    def update
       @projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first
       #UPDATE
       ActiveRecord::Base.transaction do
        if @projects_task
          # @projects_task.update(task_params)
          #handle_locked()
          handle_modified()
          handle_deps(params[:note][:dry])
        else
          @topic = Topic.find(params[:topic_id])
          @projects_task = @topic.create_projects_task(task_params)
          handle_locked()
          handle_deps(params[:note][:dry])
        end
        raise ActiveRecord::Rollback if params[:note][:dry] == "true"
        end
      render json: { note: return_note }


#TODOrename params to fit model
#find topic find task
#task exists > update; else > create task
    end
    private
      def return_note
        #@projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first
        #todo feed modifed and derived from back into projects_task this means delete the above statement
        note = {
          'id' => @projects_task.topic_id,
          'begin' => @projects_task.begin,
          'end' => @projects_task.end,
          'duration' => @projects_task.duration,
          'locked' => @projects_task.locked,
          'depon' => @projects_task.depon,
          'depby' => @projects_task.depby
        }
        return note
      end
      def handle_deps(dry)
        #byebug
#todo handle self dep
#WARN if :
#todo handle circular dep
#todo check if dependees finish before task begin date)
#todo check if dependers start after task end date)
#do dry runs and feed notes data back into composer
        ActiveRecord::Base.transaction(requires_new: true) do
          @projects_task.dependees=ProjectsTask.where(topic_id: params[:note][:depon])
          @projects_task.dependers=ProjectsTask.where(topic_id: params[:note][:depby])
          raise ActiveRecord::Rollback if dry == "true"
        end
      end
      def handle_modified
        @projects_task.assign_attributes(task_params)
        messages = []
         if params[:note][:modified] == 'begin'
           #TODO deduplicate errors
           messages += @projects_task.set_end(params[:note][:end],false)
           messages += @projects_task.set_duration(params[:note][:duration])
           messages += @projects_task.set_begin(params[:note][:begin],false)
         elsif  params[:note][:modified] == 'duration'
           messages += @projects_task.set_end(params[:note][:end],false)
           messages += @projects_task.set_begin(params[:note][:begin],false)
           messages += @projects_task.set_duration(params[:note][:duration])
         elsif  params[:note][:modified] == 'end'
           messages += @projects_task.set_duration(params[:note][:duration])
           messages += @projects_task.set_begin(params[:note][:begin],false)
           messages += @projects_task.set_end(params[:note][:end],false)
         else #dependencies
           messages += @projects_task.set_end(params[:note][:end],false)
           messages += @projects_task.set_duration(params[:note][:duration])
           messages += @projects_task.set_begin(params[:note][:begin],false)
         end
         puts messages
         @projects_task.save
      end
      def handle_locked
        @projects_task.assign_attributes(task_params)
        #1case duration locked and begin modified
        if @projects_task.locked == "duration" && params[:note][:modified] == 'begin' && @projects_task.duration
          puts "1case duration locked and begin modified"
          @projects_task.end = @projects_task.begin + @projects_task.duration
        #2case duration locked and end modified
        elsif @projects_task.locked == "duration" && params[:note][:modified] == 'end' && @projects_task.duration
          puts "2case duration locked and end modified"
          @projects_task.begin = @projects_task.end - @projects_task.duration
        #3case duration locked and duration not set
        elsif @projects_task.locked == "duration" && !(params[:note][:modified] == 'duration') && !@projects_task.duration
          puts "3case duration locked and duration not set"
          @projects_task.duration = @projects_task.end - @projects_task.begin if @projects_task.end && @projects_task.begin
        #4case begin locked and duration modified
        elsif @projects_task.locked == "begin" && params[:note][:modified] == 'duration' && @projects_task.begin
          puts "4case begin locked and duration modified"
          @projects_task.end = @projects_task.begin + @projects_task.duration
        elsif @projects_task.locked == "begin" and params[:note][:modified] == 'begin'
        #5case begin locked and end modified
        elsif @projects_task.locked == "begin" && params[:note][:modified] == 'end' && @projects_task.begin
          puts "5case begin locked and end modified"
          @projects_task.duration = @projects_task.end - @projects_task.begin
        #6case begin locked and begin not set
        elsif @projects_task.locked == "begin" && !(params[:note][:modified] == 'begin') && !@projects_task.begin
          puts "6case begin locked and begin not set"
          @projects_task.begin = @projects_task.end - @projects_task.duration if @projects_task.end && @projects_task.duration
        #7case end locked and begin modified
        elsif @projects_task.locked == "end" && params[:note][:modified] == 'begin' && @projects_task.end
          @projects_task.duration = @projects_task.end - @projects_task.begin
          puts "7case end locked and begin modified"
        elsif @projects_task.locked == "end" and params[:note][:modified] == 'begin'
        #8case end locked and duration modified
        elsif @projects_task.locked == "end" && params[:note][:modified] == 'end' && @projects_task.end
          puts "8case end locked and duration modified"
          @projects_task.begin = @projects_task.end - @projects_task.duration
        #9case end locked and end not set
        elsif @projects_task.locked == "end" && !(params[:note][:modified] == 'end') && !@projects_task.end
          puts "9case end locked and end not set"
          @projects_task.end = @projects_task.begin + @projects_task.duration if @projects_task.begin && @projects_task.duration
        end
        @projects_task.save
      end
      def task_params
        params.require(:note).permit( :begin,:end,:duration,:locked,:disallow)
      end
  end
end
