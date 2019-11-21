class ProjectsAddPostRefToProjectsTasks < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects_tasks, :post, index: true, foreign_key: true
  end
end
