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
    #attribute :test this adds it to serializers
    attr_writer :messages

    def messages
      @messages ||= []
    end

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

    def all_dependers
      deps =[]
      self.dependers.each{|d|
        deps += d.all_dependers
      }
      return deps << self.topic_id
    end
    def all_dependees
      deps =[]
      self.dependees.each{|d|
        deps += d.all_dependees
      }
      return deps << self.topic_id
    end

    def handle_deps(dry, depon, depby, catid)
      catid = Topic.find(topic_id).category_id  if catid.blank?
      ActiveRecord::Base.transaction(requires_new: true) do
        self.dependees=ProjectsTask.where(topic_id: depon).where.not(topic_id: nil, id: self.id)
        self.dependers=ProjectsTask.where(topic_id: depby).where.not(topic_id: nil, id: self.id)
        self.check_sub_circdep(catid)
        raise ActiveRecord::Rollback if dry == "true"
      end
    end

    def sync_dependers
      if self.messages.none? {|m| m.has_key? :sdc}
      self.dependers.each{|d|
          if(d.locked == "begin" || d.disallow) && d.begin && self.end && !(d.begin >= self.end)
            return self.messages += d.begin_locked_and_early
          end
          self.messages += d.set_begin(self.end,true)
         }
      end
      return self.messages
    end
    def sync_dependees
      if self.messages.none? {|m| m.has_key? :sdc}
      self.dependees.each{|d|
          if(d.locked == "end" || d.disallow) && d.end && self.begin && !(d.end <= self.begin)
            return self.messages += d.end_locked_and_late
          end
          self.messages += d.set_end(self.begin,true)
         }
      end
      return self.messages
    end

    def set_begin(new_begin, autoset)
      puts "set_begin on #{topic_id} with #{autoset}"
      return self.x_is_locked("warning") if autoset && locked == "begin"
      self.begin = new_begin
      if new_begin == ""
        #we have to call sync_dependers on the latest ending dependee after setting dependee.messages = self.messages
        latest_ending_dependee = self.dependees.sort_by{|x| x.end }.reverse[0]
        self.set_begin(latest_ending_dependee.end,true) unless latest_ending_dependee.nil?
        self.save
        return self.messages
      end
      if duration && !self.end
        #handle self.dependers
        self.end = self.begin + duration
        self.messages += self.sync_dependers
      elsif !duration && self.end
        self.duration = self.end - self.begin
        return self.error_duration_bz if duration < 0
      elsif duration && self.end
        if locked == "end"
          self.duration = self.end - self.begin
          return self.error_duration_bz if duration < 0
        elsif locked == "begin"
          return []
        else #duration locked
          self.end = self.begin + duration
          self.messages += self.sync_dependers
        end
      end
      self.save
      return self.messages
    end

    def set_end(new_end, autoset)
      puts "set_end on #{topic_id}with #{autoset}"
      return self.x_is_locked("warning") if autoset && locked == "end"
      self.end = new_end
      if new_end == ""
        #we have to call sync_dependees on the earliest starting depender after setting depender.messages = self.messages
        earliest_starting_depender = self.dependers.sort_by{|x| x.begin }[0]
        self.set_end(earliest_starting_depender.begin,true) unless earliest_starting_depender.nil?
        self.save
        return self.messages
      end
      if duration && !self.begin
        self.begin = self.end - duration
        self.messages += self.sync_dependees
      elsif !duration && self.begin
        self.duration = self.end - self.begin
        return self.error_duration_bz if duration < 0
      elsif duration && self.begin
        if locked == "begin"
          self.duration = self.end - self.begin
          return self.error_duration_bz if duration < 0
        elsif locked == "end"
          return []
        else #duration locked
          self.begin = self.end - duration
          self.messages += self.sync_dependees
        end
      end
      self.save
      return self.messages
    end

    def set_duration(new_duration)
      self.duration = new_duration
      if new_duration == ""
        self.save
        return self.messages
      end
      if self.begin && !self.end
        self.messages += self.set_end(self.begin + self.duration, false)
      elsif !self.begin && self.end
        self.messages += self.set_begin(self.end - self.duration, false)
      elsif self.begin && self.end
        if locked == "begin"
          self.messages += self.set_end(self.begin + self.duration, false)
        elsif locked == "duration"
          return []
        else #end locked
          self.messages += self.set_begin(self.end - self.duration, false)
        end
      end
      self.save
      return self.messages
    end

    def message_base
      unless self.topic_id == "drycreate"
        t = Topic.find(topic_id)
        return {url:t.url, title: t.title, begin: self.begin, end: self.end, duration: self.duration}

      else
        return {url: "#", title: "the topic you are editing right now"}
      end
    end

    def check_sub_circdep(catid)
      #has to run in any case and sync deps should not be run if there is an error
      sdc_errors = []

      #circular dependencies
      tarjan = Tarjan.new(catid)
      circ_deps = tarjan.sccs.select { |v| v.size > 1 }.flatten
      unless circ_deps.empty?
        tasks = ProjectsTask.find(circ_deps)
        tasks.each{|c|
        unless c.topic_id.nil?
          t = Topic.find(c.topic_id)
          url = t.url
          title = t.title
        else
          url = "#"
          title = "the topic you are editing right now"
        end
        sdc_errors << {message_type:"error",sdc: true, url:url, title: title, begin: c.begin,
                        end: c.end, duration: c.duration,
                        message: I18n.t("pt_errors.circ_dep")}
        }
        self.messages += sdc_errors
        return
      end

      #check subdependees
      dependee_list = self.all_dependees
      dependee_list.select!{|d|d != self.topic_id}
      dee_dups = dependee_list.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      dee_dups += self.depon
      sub_dee_dups = dee_dups.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      #check subdependers
      depender_list = self.all_dependers
      dependee_list.select!{|d|d != self.topic_id}
      der_dups = depender_list.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      der_dups += self.depby
      sub_der_dups = der_dups.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)

      sub_dee_dups += sub_der_dups
      sub_dee_dups.each{|d|
        t = Topic.find(d)
        sdc_errors << {message_type:"error",sdc: true, url:t.url, title: t.title, begin: t.projects_task.begin,
        end: t.projects_task.end, duration: t.projects_task.duration,
                message: I18n.t("pt_errors.sub_dep")}
      }
      self.messages += sdc_errors
    end



    def error_duration_bz
      m = message_base()
      m.merge!({message_type:"error", message: I18n.t("pt_errors.duration_below_zero")})
      return [m]
    end

    def x_is_locked(m_type)
      m = message_base()
      m.merge!({message_type: m_type, message: I18n.t("pt_errors.x_locked",x: locked)})
      return [m]
    end

    def end_locked_and_late
      m = message_base()
      m.merge!({message_type: "error", message: I18n.t("pt_errors.locked_late")})
      return [m]
    end
    def begin_locked_and_early
      m = message_base()
      m.merge!({message_type: "error", message: I18n.t("pt_errors.locked_early")})
      return [m]
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
