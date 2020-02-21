module Project
  class NotesController < ApplicationController
    def update
      note_id = params[:topic_id]
      note = {
        'id' => note_id,
        'begin' => params[:note][:begin],
        'end' => params[:note][:end],
        'duration' => params[:note][:duration],
        'locked' => params[:note][:locked],
        'depon' => params[:note][:depon],
        'depby' => params[:note][:depby]
      }
       @projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first
       #UPDATE
       puts "huhunach first"
       if @projects_task
        # @projects_task.update(task_params)
        handle_locked()
        handle_deps()
        puts @projects_task.inspect
         puts "update",note_id, note

         render json: { note: note }
        else

          @topic = Topic.find(params[:topic_id])
          @projects_task = @topic.create_projects_task(task_params)
          handle_locked()
          handle_deps()
            puts "creation",note_id, note
            render json: { note: note }
        end
#TODOrename params to fit model
#find topic find task
#task exists > update; else > create task
    end
    private
      def handle_deps
#todo handle self dep
#todo handle circular dep

        @projects_task.dependees=ProjectsTask.where(topic_id: params[:note][:depon])

       if params[:note][:depby]
         params[:note][:depby].each { |depby|
           depby_task = ProjectsTask.where(["topic_id = ?",depby]).first

             @projects_task.depended_on_by.create(depender_id: depby_task)
          }
      end
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
        params.require(:note).permit( :begin,:end,:duration,:locked)
      end
  end
end
