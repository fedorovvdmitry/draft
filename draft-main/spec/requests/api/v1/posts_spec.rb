require 'rails_helper'

RSpec.describe "Api::V1::Posts", type: :request do
  let(:user) { User.create!(email: 'test@example.com', password: 'password123') }
  let(:other_user) { User.create!(email: 'other@example.com', password: 'password123') }
  let(:headers) { { 'Content-Type' => 'application/json' } }
  
  describe "GET /api/v1/posts" do
    let!(:published_post) { user.posts.create!(title: 'Published Post', content: 'Content', published: true) }
    let!(:draft_post) { user.posts.create!(title: 'Draft Post', content: 'Content', published: false) }
    
    it "returns only published posts for unauthenticated users" do
      get '/api/v1/posts', headers: headers
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first['title']).to eq('Published Post')
    end
    
    it "filters posts by tags" do
      published_post.tag_list.add('design', 'ux')
      published_post.save!
      
      get '/api/v1/posts?tags=design', headers: headers
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first['tags']).to include('design', 'ux')
    end
  end
  
  describe "POST /api/v1/posts" do
    context "with authentication" do
      let(:auth_headers) do
        post '/api/v1/login', 
             params: { user: { email: user.email, password: 'password123' } }.to_json,
             headers: headers
        
        token = response.headers['Authorization']
        headers.merge('Authorization' => token)
      end
      
      it "creates a new post" do
        post_params = {
          post: {
            title: 'New Post',
            content: 'New content',
            tag_list: 'design, ux'
          }
        }
        
        expect {
          post '/api/v1/posts', params: post_params.to_json, headers: auth_headers
        }.to change(Post, :count).by(1)
        
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['title']).to eq('New Post')
        expect(json['tags']).to include('design', 'ux')
      end
      
      it "returns errors for invalid post" do
        post_params = { post: { title: '', content: 'Content' } }
        
        post '/api/v1/posts', params: post_params.to_json, headers: auth_headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
    
    context "without authentication" do
      it "returns unauthorized" do
        post_params = { post: { title: 'New Post', content: 'Content' } }
        
        post '/api/v1/posts', params: post_params.to_json, headers: headers
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
  
  describe "PATCH /api/v1/posts/:id" do
    let(:post_record) { user.posts.create!(title: 'Original Title', content: 'Content') }
    
    context "as owner" do
      let(:auth_headers) do
        post '/api/v1/login',
             params: { user: { email: user.email, password: 'password123' } }.to_json,
             headers: headers
        
        token = response.headers['Authorization']
        headers.merge('Authorization' => token)
      end
      
      it "updates the post" do
        patch "/api/v1/posts/#{post_record.id}",
              params: { post: { title: 'Updated Title' } }.to_json,
              headers: auth_headers
        
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['title']).to eq('Updated Title')
        expect(post_record.reload.title).to eq('Updated Title')
      end
    end
    
    context "as non-owner" do
      let(:auth_headers) do
        post '/api/v1/login',
             params: { user: { email: other_user.email, password: 'password123' } }.to_json,
             headers: headers
        
        token = response.headers['Authorization']
        headers.merge('Authorization' => token)
      end
      
      it "returns forbidden" do
        patch "/api/v1/posts/#{post_record.id}",
              params: { post: { title: 'Updated Title' } }.to_json,
              headers: auth_headers
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
  
  describe "POST /api/v1/posts/:id/publish" do
    let(:post_record) { user.posts.create!(title: 'Title', content: 'Content', published: false) }
    let(:auth_headers) do
      post '/api/v1/login',
           params: { user: { email: user.email, password: 'password123' } }.to_json,
           headers: headers
      
      token = response.headers['Authorization']
      headers.merge('Authorization' => token)
    end
    
    it "publishes the post" do
      post "/api/v1/posts/#{post_record.id}/publish", headers: auth_headers
      
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['published']).to be true
      expect(json['published_at']).to be_present
      expect(post_record.reload.published).to be true
    end
  end
  
  describe "DELETE /api/v1/posts/:id" do
    let(:post_record) { user.posts.create!(title: 'Title', content: 'Content') }
    let(:auth_headers) do
      post '/api/v1/login',
           params: { user: { email: user.email, password: 'password123' } }.to_json,
           headers: headers
      
      token = response.headers['Authorization']
      headers.merge('Authorization' => token)
    end
    
    it "deletes the post" do
      post_id = post_record.id
      
      expect {
        delete "/api/v1/posts/#{post_id}", headers: auth_headers
      }.to change(Post, :count).by(-1)
      
      expect(response).to have_http_status(:no_content)
      expect(Post.find_by(id: post_id)).to be_nil
    end
  end
end
