class CreateProjectsDependencies < ActiveRecord::Migration[5.2]
  def change
    create_table :projects_dependencies do |t|
      t.references :depender
      t.references :dependee

      t.timestamps
    end
  end
end
