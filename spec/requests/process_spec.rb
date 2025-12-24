require 'rails_helper'

RSpec.describe "Processes", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/process/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      get "/process/show"
      expect(response).to have_http_status(:success)
    end
  end

end
