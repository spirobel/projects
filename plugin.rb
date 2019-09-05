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
end
