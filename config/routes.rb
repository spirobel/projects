require_dependency "projects_constraint"

Project::Engine.routes.draw do
  get "/" => "projects#index", constraints: ProjectConstraint.new
  get "/actions" => "actions#index", constraints: ProjectConstraint.new
  get "/actions/:id" => "actions#show", constraints: ProjectConstraint.new
  put "/notes/:note_id" => "notes#update"
end
