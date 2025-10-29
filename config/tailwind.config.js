module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: { extend: {} },
  plugins: [],

  input: './app/assets/stylesheets/application.tailwind.css',
  output: './app/assets/builds/application.css'
}
