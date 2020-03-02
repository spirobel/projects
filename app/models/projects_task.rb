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

    def all_dependers(count)
      count += 1
      raise  if count > 200
      deps =[]
      self.dependers.each{|d|
        deps += d.all_dependers(count)
      }
      return deps << self.topic_id
    end
    def all_dependees(count)
      count += 1
      return [] if count > 200
      deps =[]
      self.dependees.each{|d|
        deps += d.all_dependees(count)
      }
      return deps << self.topic_id
    end

    def handle_deps(dry, depon, depby)
      ActiveRecord::Base.transaction(requires_new: true) do
        self.dependees=ProjectsTask.where(topic_id: depon).where.not(topic_id: nil, id: self.id)
        self.dependers=ProjectsTask.where(topic_id: depby).where.not(topic_id: nil, id: self.id)
        self.check_sub_circdep
        raise ActiveRecord::Rollback if dry == "true"
      end
    end

    def sync_dependers
      if self.messages.none? {|m| m.has_key? :sdc}
      self.dependers.each{|d|
          if(d.locked == "begin" || d.disallow) && d.begin && self.end && !(d.begin > self.end)
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
          if(d.locked == "end" || d.disallow) && d.end && self.begin && !(d.end < self.begin)
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
          return replace_with_js_locked
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
          return replace_with_js_locked
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
          return replace_with_js_locked
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
        return {url: "#", title: "drycreate"}
      end
    end

    def check_sub_circdep
      #has to run in any case and sync deps should not be run if there is an error
      sdc_errors = []
      tarjan = Tarjan.new
      self.messages << {message_type:"error",sdc: true, url:"#", title:"tarjan",
              message: tarjan.sccs} unless tarjan.sccs.nil?
      return unless tarjan.sccs.nil?
      #check subdependees
      dependee_list = self.all_dependees(0)
      dependee_list.select!{|d|d != self.topic_id}
      dee_dups = dependee_list.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      dee_dups += self.depon
      sub_dee_dups = dee_dups.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      #check subdependers
      depender_list = self.all_dependers(0)
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
      #circular dependencies
      depender_list.uniq!
      dependee_list.uniq!
      dependee_list += depender_list
      puts "both list: ", dependee_list

      circ_dups = dependee_list.group_by{ |e| e }.select { |k, v| v.size > 1 }.map(&:first)
      circ_dups.each{|d|
        t = Topic.find(d)
        sdc_errors << {message_type:"error",sdc: true, url:t.url, title: t.title, begin: t.projects_task.begin,
        end: t.projects_task.end, duration: t.projects_task.duration,
                message: I18n.t("pt_errors.circ_dep")}
      }
      self.messages += sdc_errors
      #check self dependency (included in circular dependency check)
      #check circular dependency(uniq! the lists before comparing)
        #write a list with all dependees of all dependees
        #write a list with all dependers of all dependers
        #check if two lists together are uniq
      #check for subdependencies
           #write a list with all dependers of all dependers
           #find all the der_dups
           #check if the dups are contained in depby
           #write a list with all dependees of all dependees
           #find all the dee_dups
           #check if the dups are contained in depon
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

    def replace_with_js_locked
      m = message_base()
      m.merge!({message_type: "error", message: I18n.t("pt_errors.x_locked",x: locked)+"REPLACE lock in js"})
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
