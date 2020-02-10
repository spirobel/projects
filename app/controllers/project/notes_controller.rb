module Project
  class NotesController < ApplicationController
    def update
      puts params[:topic_id]
       @projects_task = ProjectsTask.where(["topic_id = ?",params[:topic_id]]).first
       #UPDATE
       puts "huhunach first"
       if @projects_task
         @projects_task.update(task_params)
         note_id = params[:topic_id]
         note = {
           'id' => note_id,
           'begin' => params[:note][:begin],
           'end' => params[:note][:end],
           'duration' => params[:note][:duration],
           'locked' => params[:note][:locked]


         }
         puts @projects_task
         puts "update",note_id, note

         render json: { note: note }
        else

          @topic = Topic.find(params[:topic_id])
          @projects_task = @topic.create_projects_task(task_params)
          note_id = params[:topic_id]
          note = {
            'id' => note_id,
            'begin' => params[:note][:begin],
            'end' => params[:note][:end],
            'duration' => params[:note][:duration],
            'locked' => params[:note][:locked]



          }
            puts "creation",note_id, note
            render json: { note: note }
        end
#TODOrename params to fit model
#find topic find task
#task exists > update; else > create task
    end
    private
      def handle_locked(params)
        @projects_task.assign_attributes(task_params)
        if @projects_task.locked == :duration and params[:note][:modified] == 'begin' and @projects_task.duration
          @projects_task.end = @projects_task.begin + @projects_task.duration
        elsif @projects_task.locked == :duration and params[:note][:modified] == 'begin'
          @projects_task.duration = @projects_task.end - @projects_task.begin if @projects_task.end
        elsif @projects_task.locked == :duration and params[:note][:modified] == 'end' and @projects_task.duration
          @projects_task.begin = @projects_task.end - @projects_task.duration
        elsif @projects_task.locked == :duration and params[:note][:modified] == 'end'
        elsif @projects_task.locked == :begin and params[:note][:modified] == 'begin' and @projects_task.begin
        elsif @projects_task.locked == :begin and params[:note][:modified] == 'begin'
        elsif @projects_task.locked == :begin and params[:note][:modified] == 'end' and @projects_task.begin
        elsif @projects_task.locked == :begin and params[:note][:modified] == 'end'
        elsif @projects_task.locked == :end and params[:note][:modified] == 'begin' and @projects_task.end
        elsif @projects_task.locked == :end and params[:note][:modified] == 'begin'
        elsif @projects_task.locked == :end and params[:note][:modified] == 'end' and @projects_task.end
        elsif @projects_task.locked == :end and params[:note][:modified] == 'end'

          #case 1:  modified == begin
          if params[:note][:modified] == 'begin'
            @projects_task.end = params[:note][:begin]
          #case 2: modified == end
          else
            @projects_task.begin = params[:note][:begin]

          end
        elsif @projects_task.locked == :begin
        else #:end
        end


      end
      def task_params
        params.require(:note).permit( :begin,:end,:duration,:locked)
      end
  end
end
