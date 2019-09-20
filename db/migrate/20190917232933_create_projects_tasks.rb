class CreateProjectsTasks < ActiveRecord::Migration[5.2]
  def change
    create_table :projects_tasks do |t|
      t.datetime :begin
      t.datetime :end
      t.integer  :duration
      t.integer  :locked, default: 0

      t.timestamps
    end
  end
end
