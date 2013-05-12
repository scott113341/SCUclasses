Scuclasses::Application.routes.draw do
  match 'search' => 'home#search'
  match 'search2' => 'home#search2'
  match 'export' => 'home#export'
  match 'scubooks' => 'home#scubooks'

  root :to => 'home#index'
end
