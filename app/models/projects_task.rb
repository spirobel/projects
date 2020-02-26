class ProjectsTask < ActiveRecord::Base
    enum locked: [ :duration, :begin, :end]
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

    def sync_dependers
      messages = []
      self.dependers.each{|d|
          if(d.locked == "begin" || d.disallow) && !(d.begin > self.end)
            return messages << {message_type:"error", message: "begin of the projects_task with topic_id:#{d.topic_id} is locked and #{d.begin} (too early) we are trying to change topic_id:#{self.topic_id} end to #{self.end}"}
          end
          messages += d.set_begin(self.end,true)
         }
      return messages
    end
    def sync_dependees
      messages = []
      self.dependees.each{|d|
         puts"whe are here::#{d.topic_id} #{self.dependees.inspect} "
          if(d.locked == "end" || d.disallow) && !(d.end < self.begin)
            return messages << {message_type:"error", message: "end of the projects_task with topic_id:#{d.topic_id} is locked and #{d.end} (too late)we are trying to change topic_id:#{self.topic_id} begin to #{self.begin}"}
          end
          messages += d.set_end(self.begin,true)
          puts"after call set_end in #{d.topic_id}"
         }
      return messages
    end

    def set_begin(new_begin, autoset)
      messages = []
      return [{message_type:"error", message: "begin of the projects_task with topic_id:#{topic_id} is locked"}] if autoset&&locked == "begin"
      self.begin = new_begin
      if new_begin == ""
        self.save
        return messages
      end
      if duration && !self.end
        #handle self.dependers
        self.end = self.begin + duration
        self.sync_dependers
      elsif !duration && self.end
        self.duration = self.end - self.begin
        return [{message_type:"error", message: "duration of the projects_task with topic_id:#{topic_id} below 0"}] if duration < 0
      elsif duration && self.end
        return [{message_type:"error", message: "begin of the projects_task with topic_id:#{topic_id} is locked (this request should never be sent)"}] if locked == "begin"
        if locked == "end"
          self.duration = self.end - self.begin
          return [{message_type:"error", message: "duration of the projects_task with topic_id:#{topic_id} below 0"}] if duration < 0
        else #duration locked
          self.end = self.begin + duration
          self.sync_dependers
        end
      end
      unless autoset
        self.sync_dependees
      end
      self.save
      return messages
    end

    def set_end(new_end, autoset)
      messages = []
      return [{message_type:"error", message: "end of the projects_task with topic_id:#{topic_id} is locked"}] if autoset&&locked == "end"
      self.end = new_end
      if new_end == ""
        self.save
        return messages
      end
      if duration && !self.begin
        self.begin = self.end - duration
        self.sync_dependees
      elsif !duration && self.begin
        self.duration = self.end - self.begin
        return [{message_type:"error", message: "duration of the projects_task with topic_id:#{topic_id} below 0"}] if duration < 0
      elsif duration && self.begin
        return [{message_type:"error", message: "end of the projects_task with topic_id:#{topic_id} is locked (this request should never be sent)"}] if locked == "end"
        if locked == "begin"
          self.duration = self.end - self.begin
          return [{message_type:"error", message: "duration of the projects_task with topic_id:#{topic_id} below 0"}] if duration < 0
        else #duration locked
          self.begin = self.end - duration
          self.sync_dependees
        end
      end
      unless autoset
        self.sync_dependers
      end
      self.save
      return messages
    end

    def set_duration(new_duration)
      messages = []
      self.duration = new_duration
      if new_duration == ""
        self.save
        return messages
      end
      if self.begin && !self.end
        messages += self.set_end(self.begin + self.duration, false)
      elsif !self.begin && self.end
        messages += self.set_begin(self.end - self.duration, false)
      elsif self.begin && self.end
        return [{message_type:"error", message: "duration of the projects_task with topic_id:#{topic_id} is locked (this request should never be sent)"}] if locked == "duration"
        if locked == "begin"
          messages += self.set_end(self.begin + self.duration, false)
        else #end locked
          messages += self.set_begin(self.end - self.duration, false)
        end
      end
      self.save
      return messages
    end
end
#todo create change messages if change really happend
#discourse_development=# select * from projects_tasks;
# id |        begin        | end | duration | locked |
#----+---------------------+-----+----------+--------
#  2 |                     |     |          |      0 |
#           created_at         |         updated_at         | topic_id | disallow
#+----------------------------+----------------------------+----------+--
#|2020-02-22 19:34:50.261326 | 2020-02-22 19:34:50.261326 |       11 | f
