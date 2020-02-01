class ProjectsAddIndexToProjectsDependencies < ActiveRecord::Migration[6.0]
  def change
    add_index :projects_dependencies, [:depender_id, :dependee_id], unique: true
  end
end
