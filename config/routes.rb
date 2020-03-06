require_dependency "projects_constraint"

Project::Engine.routes.draw do
  put "/notes/:topic_id" => "notes#update"
end
