class PostSerializer < ActiveModel::Serializer
  attributes :id, :title, :content, :slug, :published, :published_at, :created_at, :updated_at
  
  belongs_to :user
  
  attribute :tags do
    object.tag_list
  end
end
