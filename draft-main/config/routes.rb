Rails.application.routes.draw do
  get 'process/index'
  get 'process/show'
  get 'audits/index'
  get 'audits/show'
  get 'videos/index'
  get 'videos/show'
  get 'cases/index'
  get 'cases/show'
  
  # Devise for web
  devise_for :users

  # index
  root "pages#index"

  # pages
  get "about",    to: "pages#about"
  get "contacts", to: "pages#contacts"
  get "privacy",  to: "pages#privacy"
  get "terms",    to: "pages#terms"

  # Статьи
  resources :articles, only: [:index, :show]

  # Кейсы
  resources :cases, only: [:index, :show]

  # Видео
  resources :videos, only: [:index, :show]

  # Аудиты 
  resources :audits, only: [:index, :show, :create]

  # Процессы / баттлы
  get "process", to: "process#index"
  get "process/:id", to: "process#show", as: :process_item

  # Healthcheck
  get "up" => "rails/health#show", as: :rails_health_check

  # Telegram API
  namespace :tg do
    namespace :api do
      get  "cards",    to: "cards#index"
      get  "glossary", to: "glossary#index"
      get  "orders",   to: "orders#index"
      post "orders",   to: "orders#create"
    end
  end
  
  # API v1
  namespace :api do
    namespace :v1 do
      # Devise JWT authentication
      devise_for :users, path: '', path_names: {
        sign_in: 'login',
        sign_out: 'logout',
        registration: 'signup'
      }, controllers: {
        sessions: 'api/v1/sessions',
        registrations: 'api/v1/registrations'
      }
      
      # Posts (записи)
      resources :posts do
        member do
          post :publish
          post :unpublish
        end
      end
    end
  end
end