class ProjectConstraint
  def matches?(request)
    SiteSetting.projects_enabled
  end
end
