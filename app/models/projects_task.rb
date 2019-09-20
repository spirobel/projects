class ProjectsTask < ApplicationRecord
    enum locked: [ :duration, :begin, :end ]
end
