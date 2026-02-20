class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.text :content
      t.string :slug
      t.boolean :published, default: false
      t.datetime :published_at
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :posts, :slug, unique: true
    add_index :posts, :published
  end
end
