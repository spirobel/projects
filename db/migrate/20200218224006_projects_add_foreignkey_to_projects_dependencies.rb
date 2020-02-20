class ProjectsAddForeignkeyToProjectsDependencies < ActiveRecord::Migration[6.0]
  def change
    add_foreign_key :projects_dependencies, :projects_tasks, column: :depender_id
    add_foreign_key :projects_dependencies, :projects_tasks, column: :dependee_id
  end
end
