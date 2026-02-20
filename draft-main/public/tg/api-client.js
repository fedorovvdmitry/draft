// API Client для работы с backend

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('jwt_token');
  }

  // Сохранение токена
  setToken(token) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  // Удаление токена
  clearToken() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  // Получение заголовков для запроса
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Сохранение нового токена из заголовка ответа
      const authHeader = response.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        this.setToken(token);
      }

      // Обработка успешных ответов без тела
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // === АУТЕНТИФИКАЦИЯ ===

  async signup(email, password, passwordConfirmation) {
    return this.request('/api/v1/signup', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        user: {
          email,
          password,
          password_confirmation: passwordConfirmation
        }
      })
    });
  }

  async login(email, password) {
    return this.request('/api/v1/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        user: { email, password }
      })
    });
  }

  async logout() {
    const result = await this.request('/api/v1/logout', {
      method: 'DELETE'
    });
    this.clearToken();
    return result;
  }

  // === ПОСТЫ ===

  // Получить список постов
  async getPosts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.tags) queryParams.append('tags', params.tags);

    const query = queryParams.toString();
    const endpoint = `/api/v1/posts${query ? '?' + query : ''}`;

    return this.request(endpoint, { auth: false });
  }

  // Получить один пост
  async getPost(id) {
    return this.request(`/api/v1/posts/${id}`, { auth: false });
  }

  // Создать пост
  async createPost(postData) {
    return this.request('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({ post: postData })
    });
  }

  // Обновить пост
  async updatePost(id, postData) {
    return this.request(`/api/v1/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ post: postData })
    });
  }

  // Удалить пост
  async deletePost(id) {
    return this.request(`/api/v1/posts/${id}`, {
      method: 'DELETE'
    });
  }

  // Опубликовать пост
  async publishPost(id) {
    return this.request(`/api/v1/posts/${id}/publish`, {
      method: 'POST'
    });
  }

  // Снять с публикации
  async unpublishPost(id) {
    return this.request(`/api/v1/posts/${id}/unpublish`, {
      method: 'POST'
    });
  }
}

// Создание глобального экземпляра
const api = new APIClient();

// Примеры использования:

// === РЕГИСТРАЦИЯ И ВХОД ===
async function exampleAuth() {
  try {
    // Регистрация
    const signupResponse = await api.signup(
      'user@example.com',
      'password123',
      'password123'
    );
    console.log('Registered:', signupResponse);

    // Вход
    const loginResponse = await api.login('user@example.com', 'password123');
    console.log('Logged in:', loginResponse);

    // Выход
    await api.logout();
    console.log('Logged out');
  } catch (error) {
    console.error('Auth error:', error);
  }
}

// === РАБОТА С ПОСТАМИ ===
async function examplePosts() {
  try {
    // Получить все посты
    const posts = await api.getPosts();
    console.log('All posts:', posts);

    // Получить посты с фильтром по тегам
    const designPosts = await api.getPosts({ tags: 'design,ux' });
    console.log('Design posts:', designPosts);

    // Получить пост по ID
    const post = await api.getPost(1);
    console.log('Single post:', post);

    // Создать новый пост (требует аутентификации)
    const newPost = await api.createPost({
      title: 'Новый пост',
      content: 'Содержание поста',
      tag_list: 'дизайн, ux, брендинг'
    });
    console.log('Created post:', newPost);

    // Обновить пост
    const updatedPost = await api.updatePost(newPost.id, {
      title: 'Обновленный заголовок'
    });
    console.log('Updated post:', updatedPost);

    // Опубликовать пост
    const publishedPost = await api.publishPost(newPost.id);
    console.log('Published post:', publishedPost);

    // Снять с публикации
    const unpublishedPost = await api.unpublishPost(newPost.id);
    console.log('Unpublished post:', unpublishedPost);

    // Удалить пост
    await api.deletePost(newPost.id);
    console.log('Post deleted');
  } catch (error) {
    console.error('Posts error:', error);
  }
}

// === ИНТЕГРАЦИЯ С UI ===

// Пример: загрузка и отображение постов
async function loadAndDisplayPosts() {
  try {
    const posts = await api.getPosts({ per_page: 10 });
    
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = posts.map(post => `
      <div class="post-card">
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <div class="tags">
          ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <small>By ${post.user.email} on ${new Date(post.created_at).toLocaleDateString()}</small>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load posts:', error);
  }
}

// Пример: форма создания поста
async function handlePostForm(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const postData = {
    title: formData.get('title'),
    content: formData.get('content'),
    tag_list: formData.get('tags')
  };

  try {
    const newPost = await api.createPost(postData);
    console.log('Post created:', newPost);
    
    // Перезагрузить список постов
    await loadAndDisplayPosts();
    
    // Очистить форму
    event.target.reset();
  } catch (error) {
    alert('Ошибка при создании поста: ' + error.message);
  }
}

// Проверка авторизации при загрузке страницы
function checkAuth() {
  return api.token !== null;
}

// Пример использования в Telegram Mini App
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  
  // Можно использовать данные пользователя Telegram для автоматической авторизации
  // или предложить пользователю войти через форму
}
