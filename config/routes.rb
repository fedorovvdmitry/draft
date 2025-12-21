Rails.application.routes.draw do
  devise_for :users

  # index
  root "pages#index"

  # pages
  get "about", to: "pages#about"

  # healthcheck
  get "up" => "rails/health#show", as: :rails_health_check

  # telegram mini app api
  namespace :tg do
    namespace :api do
      get "cards", to: "cards#index"
      get "glossary", to: "glossary#index"
      get "orders", to: "orders#index"
      post "orders", to: "orders#create"
    end
  end
end
