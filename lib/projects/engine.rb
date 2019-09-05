module Project
  class Engine < ::Rails::Engine
    engine_name "Project".freeze
    isolate_namespace Project

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::Project::Engine, at: "/projects"
      end
    end
  end
end
