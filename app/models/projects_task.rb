class ProjectsTask < ActiveRecord::Base
    enum locked: [ :duration, :begin, :end ]
    belongs_to :topic
    has_many :depends_on, -> { includes :dependee }, class_name: "ProjectsDependency", :foreign_key => "depender_id",inverse_of: "depender", autosave: true, dependent: :destroy
    has_many :depended_on_by, -> { includes :depender}, class_name: "ProjectsDependency", :foreign_key => "dependee_id",inverse_of: "dependee", autosave: true, dependent: :destroy
    has_many :dependees, through: :depends_on
    has_many :dependers, through: :depended_on_by

    attribute :depon
    attribute :depon_topics
    attribute :depby
    attribute :depby_topics
    def depon
      deps = []
      dependees.each{|d| deps.push(d.topic_id)}
      return deps
    end
    def depon_topics
      Topic.find(depon)
    end
    def depby
      deps = []
      dependers.each{|d| deps.push(d.topic_id)}
      return deps
    end
    def depby_topics
      Topic.find(depby)
    end
end
