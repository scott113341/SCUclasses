Coursemaster::Application.routes.draw do
  match 'sections' => 'sections#sections'
  match 'export' => 'sections#export'

  root :to => 'home#index'
end
