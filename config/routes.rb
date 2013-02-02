Coursemaster::Application.routes.draw do
  match 'courses' => 'courses#courses'

  root :to => 'home#index'
  get 'home/index'
end
