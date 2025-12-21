class Tg::Api::CardsController < ApplicationController
  protect_from_forgery with: :null_session

  def index
    render json: {
      ok: true,
      cards: [
        {
          id: 1,
          title: "Неоморфизм в продуктах",
          refs: 15,
          views: 3240,
          likes: 187,
          tags: ["сайт", "промо"],

          about_title: "О подборке",
          about: "Мягкие тени и объём создают ощущение тактильности. Подходит для интерфейсов, где важно подчеркнуть аккуратность, технологичность и спокойную уверенность: финтех, сервисы, продукты с высокой ценой ошибки.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Время взаимодействия", value: "+52%" },
            { label: "Эмоциональная связь", value: "+68%" },
            { label: "Запоминаемость", value: "+41%" }
          ],

          references: [
            { title: "Apple Music", desc: "Карточки с мягкими тенями и крупными состояниями", tag: "Премиальность", url: "https://example.com/apple-music-neumorphism" },
            { title: "Skeuomorphism 2.0", desc: "Объёмные элементы управления и «материальные» поверхности", tag: "Интуитивность", url: "https://example.com/skeuo-2" },
            { title: "Tesla App", desc: "Градиенты и свечение в контролах, «живые» панели", tag: "Футуризм", url: "https://example.com/tesla-app-ui" }
          ],

          download_url: "https://example.com/download/neumorphism-pack",
          share_url: "https://example.com/share/neumorphism"
        },

        {
          id: 2,
          title: "Брутализм с функцией",
          refs: 12,
          views: 2890,
          likes: 156,
          tags: ["сайт", "бренд"],

          about_title: "О подборке",
          about: "Контраст, прямые формы, честная сетка, крупная типографика. Работает там, где важны характер и позиция бренда: технологические компании, студии, продукты с сильным месседжем и коротким путём к действию.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Читаемость ключевых блоков", value: "+35%" },
            { label: "Кликабельность CTA", value: "+18%" },
            { label: "Запоминаемость бренда", value: "+44%" }
          ],

          references: [
            { title: "Brutalist Landing", desc: "Крупные заголовки, минимум декора, максимум смысла", tag: "Фокус", url: "https://example.com/brutalist-landing" },
            { title: "Studio Portfolio", desc: "Сетка, чёрно-белая база и акценты цветом", tag: "Характер", url: "https://example.com/studio-portfolio" },
            { title: "E-commerce Brutal", desc: "Каталог с честной типографикой и быстрым выбором", tag: "Скорость", url: "https://example.com/brutal-ecom" }
          ],

          download_url: "https://example.com/download/brutal-pack",
          share_url: "https://example.com/share/brutal"
        },

        {
          id: 3,
          title: "Глассморфизм про доверие",
          refs: 20,
          views: 4567,
          likes: 312,
          tags: ["сайт", "соцсети", "промо"],

          about_title: "О подборке",
          about: "Стеклянные панели, размытие, глубина и свет. Дает ощущение «чистого» продукта и аккуратной технологичности. Хорошо подходит для витрин сервисов, презентаций функций и промо-страниц, где важно визуально «облегчить» сложный продукт.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Доверие к продукту", value: "+27%" },
            { label: "Вовлечённость в просмотр", value: "+33%" },
            { label: "Сохранения/шеры", value: "+21%" }
          ],

          references: [
            { title: "Fintech Glass UI", desc: "Карточки с размытием и мягкими границами", tag: "Надёжность", url: "https://example.com/fintech-glass" },
            { title: "Promo Gradient + Blur", desc: "Световые пятна и многослойность на промо", tag: "Вау-эффект", url: "https://example.com/promo-glass" },
            { title: "Dashboard Glass Panels", desc: "Информационные панели, где важна лёгкость", tag: "Понятность", url: "https://example.com/dashboard-glass" }
          ],

          download_url: "https://example.com/download/glass-pack",
          share_url: "https://example.com/share/glass"
        },

        {
          id: 4,
          title: "Кинетическая типографика",
          refs: 18,
          views: 5234,
          likes: 421,
          tags: ["соцсети", "промо"],

          about_title: "О подборке",
          about: "Анимация текста как основной носитель смысла. Подходит для коротких роликов, сторис, промо-объявлений, где нужно удержать внимание и донести мысль за несколько секунд.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Досмотры", value: "+29%" },
            { label: "Переходы по ссылке", value: "+16%" },
            { label: "Запоминаемость оффера", value: "+38%" }
          ],

          references: [
            { title: "Story Kinetic Pack", desc: "Сторис-форматы с быстрым ритмом и паузами", tag: "Удержание", url: "https://example.com/kinetic-stories" },
            { title: "Promo Typography Reel", desc: "Оффер раскрывается по шагам, без перегруза", tag: "Конверсия", url: "https://example.com/kinetic-reel" },
            { title: "Event Teaser Type", desc: "Тизер мероприятия через типографику и темп", tag: "Энергия", url: "https://example.com/event-type" }
          ],

          download_url: "https://example.com/download/kinetic-pack",
          share_url: "https://example.com/share/kinetic"
        },

        {
          id: 5,
          title: "Клейморфизм: объём нового уровня",
          refs: 14,
          views: 3456,
          likes: 234,
          tags: ["сайт", "бренд"],

          about_title: "О подборке",
          about: "Мягкие «пластичные» формы, объёмные кнопки, ощущение дружелюбия и предметности. Хорошо работает для продуктов, где важно снизить тревожность и сделать интерфейс «приятным на ощупь»: сервисы, подписки, onboarding.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Понимание интерфейса", value: "+22%" },
            { label: "Завершение первого шага", value: "+19%" },
            { label: "Лояльность к визуалу", value: "+31%" }
          ],

          references: [
            { title: "Clay Buttons UI", desc: "Кнопки и контролы с мягкой пластикой", tag: "Дружелюбие", url: "https://example.com/clay-buttons" },
            { title: "Subscription Onboarding", desc: "Приветственные экраны с объёмными иллюстрациями", tag: "Онбординг", url: "https://example.com/clay-onboarding" },
            { title: "Brand Clay System", desc: "Айдентика на основе форм и «материальности»", tag: "Узнаваемость", url: "https://example.com/clay-brand" }
          ],

          download_url: "https://example.com/download/clay-pack",
          share_url: "https://example.com/share/clay"
        },

        {
          id: 6,
          title: "Антидизайн для смелых",
          refs: 16,
          views: 4123,
          likes: 298,
          tags: ["соцсети", "бренд", "промо"],

          about_title: "О подборке",
          about: "Нарушение привычных правил как инструмент внимания: неожиданные размеры, резкие контрасты, «шероховатость» и намеренная дерзость. Подходит брендам с сильной позицией и аудитории, которая любит провокацию.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Остановки скролла", value: "+34%" },
            { label: "Комментарии/обсуждения", value: "+26%" },
            { label: "Рост узнаваемости", value: "+19%" }
          ],

          references: [
            { title: "Anti Design Poster", desc: "Плакаты с намеренной «ломаной» композицией", tag: "Внимание", url: "https://example.com/anti-poster" },
            { title: "Noisy Social Pack", desc: "Шум, коллаж, крупные слова и резкие акценты", tag: "Вирусность", url: "https://example.com/noisy-social" },
            { title: "Brand Provocation UI", desc: "Смелая типографика и «неудобные» решения", tag: "Позиция", url: "https://example.com/provocation-ui" }
          ],

          download_url: "https://example.com/download/anti-pack",
          share_url: "https://example.com/share/anti"
        },

        {
          id: 7,
          title: "Параметрический дизайн",
          refs: 11,
          views: 2678,
          likes: 267,
          tags: ["сайт", "бренд"],

          about_title: "О подборке",
          about: "Генеративные формы, повторяющиеся паттерны и «умная» геометрия. Создаёт ощущение системности и высокого уровня производства. Подходит для брендов, которые хотят показать технологичность, масштаб и точность.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Восприятие технологичности", value: "+28%" },
            { label: "Узнаваемость паттерна", value: "+23%" },
            { label: "Вовлечённость в просмотр", value: "+17%" }
          ],

          references: [
            { title: "Parametric Pattern Brand", desc: "Айдентика на основе генеративных сеток", tag: "Система", url: "https://example.com/parametric-brand" },
            { title: "Parametric Web Hero", desc: "Хедер сайта с глубиной и геометрией", tag: "Технологии", url: "https://example.com/parametric-hero" },
            { title: "3D Parametric Forms", desc: "Объекты, где форма работает как знак", tag: "Статус", url: "https://example.com/parametric-3d" }
          ],

          download_url: "https://example.com/download/parametric-pack",
          share_url: "https://example.com/share/parametric"
        },

        {
          id: 8,
          title: "Эко-минимализм с посылом",
          refs: 13,
          views: 3890,
          likes: 189,
          tags: ["сайт", "соцсети", "брендинг"],

          about_title: "О подборке",
          about: "Спокойная типографика, натуральная палитра, воздух и честные материалы в визуале. Подходит брендам, которые продают качество, заботу и долгий срок службы. Работает в презентациях продукта, упаковке, лендингах и контенте.",

          impact_title: "Влияние на бизнес",
          impact: [
            { label: "Доверие к бренду", value: "+24%" },
            { label: "Сохранения контента", value: "+18%" },
            { label: "Возвраты на страницу", value: "+12%" }
          ],

          references: [
            { title: "Eco Product Landing", desc: "Акценты на фактурах, воздуха больше, текст чище", tag: "Доверие", url: "https://example.com/eco-landing" },
            { title: "Natural Branding Kit", desc: "Шрифты + палитра + спокойные носители", tag: "Брендинг", url: "https://example.com/natural-branding" },
            { title: "Social Minimal Series", desc: "Серии постов с короткими тезисами и паузами", tag: "Контент", url: "https://example.com/min-social" }
          ],

          download_url: "https://example.com/download/eco-min-pack",
          share_url: "https://example.com/share/eco-min"
        }
      ]
    }
  end
end
