Scuclasses::Application.routes.draw do
  match 'sections' => 'sections#sections'
  match 'export' => 'sections#export'
  match 'scubooks' => 'sections#scubooks'

  root :to => 'home#index'
end
