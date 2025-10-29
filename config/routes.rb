Rails.application.routes.draw do
  devise_for :users

  # index
  root "pages#index"

  # pages
  get "about", to: "pages#about"

  # healthcheck
  get "up" => "rails/health#show", as: :rails_health_check
end

