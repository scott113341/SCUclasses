Scuclasses::Application.routes.draw do
  match 'search' => 'home#search'
  match 'advanced_search' => 'home#advanced_search'
  match 'rt_search' => 'home#rt_search'
  match 'export' => 'home#export'
  match 'scubooks' => 'home#scubooks'

  root :to => 'home#index'
end
