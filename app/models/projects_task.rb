class ProjectsTask < ApplicationRecord
    enum locked: [ :duration, :begin, :end ]
    belongs_to :topic
    has_many :depends_on, :class_name => 'ProjectsDependency', :foreign_key => 'depender_id'
    has_many :depended_on_by, :class_name => 'ProjectsDependency', :foreign_key => 'dependee_id'
end
