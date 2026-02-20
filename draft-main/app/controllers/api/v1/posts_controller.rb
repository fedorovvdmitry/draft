module Api
  module V1
    class PostsController < BaseController
      before_action :set_post, only: [:show, :update, :destroy, :publish, :unpublish]
      before_action :authorize_post, only: [:update, :destroy, :publish, :unpublish]
      
      # GET /api/v1/posts
      def index
        @posts = Post.includes(:user, :tags)
        @posts = @posts.published unless current_user
        @posts = @posts.recent
        
        # Фильтрация по тегам
        if params[:tags].present?
          @posts = @posts.tagged_with(params[:tags].split(','))
        end
        
        # Пагинация
        page = params[:page] || 1
        per_page = params[:per_page] || 20
        @posts = @posts.page(page).per(per_page)
        
        render json: @posts, each_serializer: PostSerializer
      end
      
      # GET /api/v1/posts/:id
      def show
        unless @post.published? || @post.user == current_user
          return render json: { error: 'Post not found' }, status: :not_found
        end
        
        render json: @post, serializer: PostSerializer
      end
      
      # POST /api/v1/posts
      def create
        @post = current_user.posts.build(post_params)
        
        if @post.save
          render json: @post, serializer: PostSerializer, status: :created
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # PATCH/PUT /api/v1/posts/:id
      def update
        if @post.update(post_params)
          render json: @post, serializer: PostSerializer
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # DELETE /api/v1/posts/:id
      def destroy
        @post.destroy
        head :no_content
      end
      
      # POST /api/v1/posts/:id/publish
      def publish
        if @post.publish!
          render json: @post, serializer: PostSerializer
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # POST /api/v1/posts/:id/unpublish
      def unpublish
        if @post.unpublish!
          render json: @post, serializer: PostSerializer
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_post
        @post = Post.find_by(id: params[:id]) || Post.find_by(slug: params[:id])
        render json: { error: 'Post not found' }, status: :not_found unless @post
      end
      
      def authorize_post
        unless @post.user == current_user
          render json: { error: 'Forbidden' }, status: :forbidden
        end
      end
      
      def post_params
        params.require(:post).permit(:title, :content, :slug, :published, :tag_list)
      end
    end
  end
end
