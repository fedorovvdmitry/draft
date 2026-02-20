require 'rails_helper'

RSpec.describe "Audits", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/audits/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      get "/audits/show"
      expect(response).to have_http_status(:success)
    end
  end

end
