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
           'end' => params[:note][:end]
         }

         puts "update",note_id, note

         render json: { note: note }
        else

          @topic = Topic.find(params[:topic_id])
          @projects_task = @topic.create_projects_task(task_params)
          note_id = params[:topic_id]
          note = {
            'id' => note_id,
            'begin' => params[:note][:begin],
            'end' => params[:note][:end]

          }
            puts "creation",note_id, note
            render json: { note: note }
        end
#TODOrename params to fit model
#find topic find task
#task exists > update; else > create task
    end
    private
      def task_params
        params.require(:note).permit( :begin,:end)
      end
  end
end
