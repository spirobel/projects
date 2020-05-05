# name: Projects
# about: managing dependencies between tasks with discourse
# version: 0.1
# authors: spirobel
# url: https://github.com/spirobel

register_asset "stylesheets/common/projects.scss"
register_asset "stylesheets/desktop/projects.scss", :desktop
register_asset "stylesheets/mobile/projects.scss", :mobile
register_svg_icon "hourglass" if respond_to?(:register_svg_icon)
enabled_site_setting :projects_enabled

PLUGIN_NAME ||= "Project".freeze

load File.expand_path('../lib/projects/engine.rb', __FILE__)
load File.expand_path('../lib/tarjan.rb', __FILE__)
after_initialize do
  add_to_serializer :topic_view, :projects_task do
    object.topic.projects_task
  end
  add_to_serializer :topic_list_item, :projects_task do
    object.projects_task
  end
  add_to_serializer :post, :projects_task do
    object.projects_task
  end
  # https://github.com/discourse/discourse/blob/master/lib/plugin/instance.rb
  Category.register_custom_field_type('projects_enabled', :boolean)
  [
    "projects_enabled",
    "earliest_begin",
    "latest_end",
    "longest_duration"
  ].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.send(key) }
  end
  class ::Category
    attribute :earliest_begin
    attribute :latest_end
    attribute :longest_duration
    def projects_enabled
      if self.custom_fields['projects_enabled'] != nil
        self.custom_fields['projects_enabled']
      else
        false
      end
    end

    def earliest_begin
      e_begin = ProjectsTask.joins(:topic).where('topics.category_id' => self.id).where.not(begin:nil).order(:begin).first
      e_begin.begin unless e_begin.nil?
    end
    def latest_end
      l_end =ProjectsTask.joins(:topic).where('topics.category_id' => self.id).where.not(end:nil).order(end: :desc).first
      l_end.end unless l_end.nil?
    end
    def longest_duration
      store = PluginStore.new(PLUGIN_NAME)
      store.get(self.id)
    end
  end
  class ::TopicQuery
    def list_topics_array()
      create_list(:topics)
    end
  end
  class ::ListController
    def topics_array
      list_opts = build_topic_list_options
      list = TopicQuery.new(current_user, list_opts).send("list_topics_array")
      respond_with_list(list)
    end
  end
  Discourse::Application.routes.prepend do
     scope "/topics" do
  get "topics_array" => "list#topics_array",as: "topics_array",  defaults: { format: :json }
end
end
#    DiscourseEvent.trigger(:topic_recovered, self)
DiscourseEvent.on(:topic_recovered) do |topic|

  store = PluginStore.new("Project")
  pt = store.get(topic.id)
  t = ProjectsTask.where(["topic_id = ?",topic.id]).first
    if !t
      t = ProjectsTask.create({topic_id: topic.id})
    end
  t.update({
                                       begin: pt[:begin],
                                       end: pt[:end],
                                       duration: pt[:duration],
                                       locked: pt[:locked],
                                       disallow: pt[:disallow]})
  t.handle_deps(false,pt[:depon],pt[:depby],topic.category_id)
  t.save
  t.recalc_longest_duration(topic.category_id)

end

 DiscourseEvent.on(:topic_destroyed) do |topic, user|
   pt = ProjectsTask.where(["topic_id = ?",topic.id]).first
   unless pt.nil?
     pt.save_for_deletion
     pt.destroy
     pt.recalc_longest_duration(topic.category_id)
   end
 end
Rails.logger.level = 0
  Topic.class_eval do
    has_one :projects_task, dependent: :delete, :inverse_of => :topic
  end
  Post.class_eval do
    has_one :projects_task, through: :topic, dependent: :delete
  end
end
