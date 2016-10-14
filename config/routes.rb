Scuclasses::Application.routes.draw do
  match 'search' => 'home#search'
  match 'advanced_search' => 'home#advanced_search'
  match 'rt_search' => 'home#rt_search'
  match 'sections' => 'home#sections'

  root :to => 'home#index'
end
