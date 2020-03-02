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
  PostRevisor.track_topic_field(:projects_task_attributes) { |tc| puts "Hello world!" }
  add_permitted_post_create_param({:projects_task_attributes => [:duration]},:hash)
  # https://github.com/discourse/discourse/blob/master/lib/plugin/instance.rb
  Category.register_custom_field_type('projects_enabled', :boolean)
  [
    "projects_enabled"
  ].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.send(key) }
  end
  class ::Category
    def projects_enabled
      if self.custom_fields['projects_enabled'] != nil
        self.custom_fields['projects_enabled']
      else
        false
      end
    end
  end
  class ::TopicQuery
    def list_topics_array()
      create_list(:topics)
    end
  end
  class ::ListController
    before_action :ensure_logged_in, except: [:topics_array]
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

Rails.logger.level = 0
  Topic.class_eval do
    has_one :projects_task, dependent: :destroy, :inverse_of => :topic

    after_save do
      puts 'topic saved'
      #byebug
    end
  end
  Post.class_eval do
    has_one :projects_task, through: :topic
  end
end
