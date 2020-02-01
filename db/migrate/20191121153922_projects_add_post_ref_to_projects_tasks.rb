class ProjectsAddPostRefToProjectsTasks < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects_tasks, :topic, index: { unique: true }, foreign_key: true
  end
end
