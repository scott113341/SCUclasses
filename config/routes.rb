Coursemaster::Application.routes.draw do
  match 'sections' => 'sections#sections'

  root :to => 'home#index'
  get 'home/index'
end
