class NotesController < ApplicationController
  def update
    Rails.logger.info 'Called NotesController#update'

    note_id = params[:note_id]
    note = {
      'id' => note_id,
      'date' => params[:note][:date]
    }

    puts note_id, note

    render json: { note: note }
  end
end
