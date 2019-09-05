module Project
  class ProjectController < ::ApplicationController
    requires_plugin Project

    before_action :ensure_logged_in

    def index
    end
  end
end
