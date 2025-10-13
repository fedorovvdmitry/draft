require 'faker'

10.times do
  User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email,
    role: %w[user admin manager].sample,
    password_digest: BCrypt::Password.create("password")
  )
end

5.times do
  Category.create!(
    name: Faker::Book.genre
  )
end

20.times do
  Article.create!(
    title: Faker::Book.title,
    body: Faker::Lorem.paragraphs(number: 3).join("\n"),
    category_id: Category.pluck(:id).sample,
    user_id: User.pluck(:id).sample,
    published_at: rand(1..30).days.ago
  )
end

15.times do
  Case.create!(
    title: Faker::Company.catch_phrase,
    description: Faker::Lorem.sentence(word_count: 20),
    industry: Faker::Company.industry,
    client_name: Faker::Company.name,
    country: Faker::Address.country,
    result: Faker::Lorem.sentence,
    user_id: User.pluck(:id).sample
  )
end

10.times do
  Tag.create!(name: Faker::Lorem.unique.word)
end

Case.all.each do |case_record|
  case_record.tags << Tag.order("RANDOM()").limit(2)
end

30.times do
  Comment.create!(
    body: Faker::Lorem.sentence(word_count: 10),
    user_id: User.pluck(:id).sample,
    commentable: [Article.all.sample, Case.all.sample].sample
  )
end

5.times do
  ServicePackage.create!(
    name: Faker::Company.bs.titleize,
    description: Faker::Lorem.sentence,
    price_range: "$#{rand(100..1000)}",
    features: Faker::Lorem.words(number: 5).join(", ")
  )
end

20.times do
  Order.create!(
    user_id: User.pluck(:id).sample,
    service_package_id: ServicePackage.pluck(:id).sample,
    status: %w[pending active completed canceled].sample
  )
end

10.times do
  AuditRequest.create!(
    user_id: User.pluck(:id).sample,
    url: Faker::Internet.url,
    status: %w[pending done failed].sample,
    result: Faker::Lorem.sentence
  )
end

10.times do
  ContactMessage.create!(
    name: Faker::Name.name,
    email: Faker::Internet.email,
    message: Faker::Lorem.paragraph,
    status: %w[new read archived].sample
  )
end
