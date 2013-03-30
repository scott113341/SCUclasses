Scuclasses::Application.routes.draw do
  match 'search' => 'home#search'
  match 'export' => 'home#export'
  match 'scubooks' => 'home#scubooks'

  root :to => 'home#index'
end
