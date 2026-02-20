module Api
  module V1
    class BaseController < ApplicationController
      protect_from_forgery with: :null_session
      before_action :authenticate_api_v1_user!, except: [:index, :show]
      
      respond_to :json
      
      private
      
      def authenticate_api_v1_user!
        unless current_api_v1_user
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end
      
      # Devise добавляет метод current_user, но для API нужно использовать пространство имен
      alias_method :current_user, :current_api_v1_user
    end
  end
end
