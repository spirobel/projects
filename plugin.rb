# name: Projects
# about: managing dependencies between tasks with discourse
# version: 0.1
# authors: spirobel
# url: https://github.com/spirobel

register_asset "stylesheets/common/projects.scss"
register_asset "stylesheets/desktop/projects.scss"
register_asset "stylesheets/mobile/projects.scss"

enabled_site_setting :projects_enabled

PLUGIN_NAME ||= "Project".freeze

load File.expand_path('../lib/projects/engine.rb', __FILE__)

after_initialize do
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


  Post.class_eval do
    has_one :projects_task, dependent: :destroy
    after_save do
      puts "test"
      #byebug
    end
  end
end
