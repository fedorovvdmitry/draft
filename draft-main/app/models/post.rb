class Post < ApplicationRecord
  belongs_to :user
  
  # Tagging
  acts_as_taggable_on :tags
  
  # Validations
  validates :title, presence: true
  validates :slug, uniqueness: true, allow_blank: true
  
  # Callbacks
  before_validation :generate_slug, on: :create
  
  # Scopes
  scope :published, -> { where(published: true) }
  scope :recent, -> { order(created_at: :desc) }
  
  # Methods
  def publish!
    update(published: true, published_at: Time.current)
  end
  
  def unpublish!
    update(published: false, published_at: nil)
  end
  
  private
  
  def generate_slug
    return if slug.present?
    
    base_slug = title.parameterize
    slug_candidate = base_slug
    counter = 1
    
    while Post.exists?(slug: slug_candidate)
      slug_candidate = "#{base_slug}-#{counter}"
      counter += 1
    end
    
    self.slug = slug_candidate
  end
end
