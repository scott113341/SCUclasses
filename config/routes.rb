Coursemaster::Application.routes.draw do
  get "admin/index"
  get "admin/courses"
  match "admin/course/:name" => "admin#course"

  root :to => 'home#index'
  get 'home/index'
end
