class ProjectsAddDisallowToProjectsTask < ActiveRecord::Migration[6.0]
  def change
    add_column :projects_tasks, :disallow, :boolean, default: false
  end
end
