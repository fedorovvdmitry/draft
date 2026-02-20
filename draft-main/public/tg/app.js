(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) tg.ready();

  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = tg ? "Открыто в Telegram" : "Открыто в браузере";

  const grid = document.getElementById("grid");
  const glossaryEl = document.getElementById("glossary");
  const ordersEl = document.getElementById("orders");

  if (!grid || !glossaryEl || !ordersEl) {
    console.error("Нужны контейнеры: #grid, #glossary, #orders");
    return;
  }

  // tabs
  const tabs = document.getElementById("tabs");
  let currentTab = "moodboard";

  const state = {
    moodboardLoaded: false,
    glossaryLoaded: false,
    ordersLoaded: false
  };

  const cache = { orders: [], moodboard: [], glossary: []  };

  showTab("moodboard");

  if (tabs) {
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab[data-tab]");
      if (!btn) return;
      showTab(btn.dataset.tab);
    });
  }

  const leadBtn = document.getElementById("leadBtn");
  if (leadBtn) {
    leadBtn.addEventListener("click", () => {
      if (tg) {
        tg.showPopup({
          title: "Заявка",
          message: "Форма будет следующим шагом.",
          buttons: [{ type: "ok" }]
        });
      } else {
        alert("Форма будет следующим шагом.");
      }
    });
  }

  function showTab(tab) {
    currentTab = tab;

    document.querySelectorAll(".tab[data-tab]").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });

    grid.classList.toggle("is-hidden", tab !== "moodboard");
    glossaryEl.classList.toggle("is-hidden", tab !== "glossary");
    ordersEl.classList.toggle("is-hidden", tab !== "orders");

    if (tab === "moodboard" && !state.moodboardLoaded) loadMoodboard();
    if (tab === "glossary" && !state.glossaryLoaded) loadGlossary();
    if (tab === "orders" && !state.ordersLoaded) loadOrders();
  }

  function loadMoodboard() {
    state.moodboardLoaded = true;

    fetch("/tg/api/cards")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload || payload.ok !== true) throw new Error("API error");
        const cards = Array.isArray(payload.cards) ? payload.cards : [];
        cache.moodboard = cards;
        grid.innerHTML = cards.map(renderMoodCard).join("");
bindCardClicks(grid);

      })
      .catch((err) => {
        grid.innerHTML = `<div style="color:#999;padding:12px">Ошибка загрузки данных: ${escapeHtml(String(err))}</div>`;
      });
  }

  function renderMoodCard(item) {
    const id = item.id ?? "";
    const title = escapeHtml(item.title ?? "");
    const refs = Number(item.refs ?? 0);
    const views = Number(item.views ?? 0);
    const likes = Number(item.likes ?? 0);

    const tagsHtml = (Array.isArray(item.tags) ? item.tags : [])
      .slice(0, 3)
      .map((t) => `<li class="mcard__tag">${escapeHtml(t)}</li>`)
      .join("");

    return `
      <article class="mcard" data-id="${escapeAttr(id)}" role="button" tabindex="0">
        <div class="mcard__top">
          <ul class="mcard__tags" aria-label="Теги">${tagsHtml}</ul>

          <div class="mcard__stats" aria-label="Статистика">
            <span class="mcard__stat" aria-label="Просмотры">${iconEye()} ${views}</span>
            <span class="mcard__stat" aria-label="Лайки">${iconHeart()} ${likes}</span>
          </div>
        </div>

        <div class="mcard__bottom">
          <h3 class="mcard__title">${title}</h3>
          <p class="mcard__sub">${refs} референсов</p>
        </div>
      </article>
    `;
  }

  function bindCardClicks(root) {
    root.addEventListener("click", (e) => {
      const card = e.target.closest(".mcard");
      if (!card) return;
      openCard(card.getAttribute("data-id"));
    });

    root.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".mcard");
      if (!card) return;
      e.preventDefault();
      openCard(card.getAttribute("data-id"));
    });
  }

  function openCard(id) {
  openMood(id);
}

function openMood(id) {
  if (!id) return;

  const item = cache.moodboard.find((x) => String(x.id) === String(id));
  if (!item) return;

  document.querySelector(".app")?.classList.add("is-mood-detail");

  const detail = document.getElementById("moodDetail");
  if (!detail) return;

  detail.classList.remove("is-hidden");
  detail.innerHTML = renderMoodDetail(item);

  detail.querySelector("[data-back]")?.addEventListener("click", closeMoodDetail);

  // share
  detail.querySelector("[data-share]")?.addEventListener("click", () => {
    const url = item.share_url || item.url || "";
    if (tg && url) tg.openLink(url);
    else if (url) window.open(url, "_blank");
    else if (tg) tg.showPopup({ title: "Ссылка", message: "Пока нет share_url для этой подборки.", buttons: [{ type: "ok" }] });
  });

  // bookmark (пока заглушка)
  detail.querySelector("[data-bookmark]")?.addEventListener("click", () => {
    if (tg) tg.showPopup({ title: "Закладки", message: "Добавление в закладки — следующий шаг.", buttons: [{ type: "ok" }] });
  });

  // download (пока заглушка / ссылка)
  detail.querySelector("[data-download]")?.addEventListener("click", () => {
    const url = item.download_url || "";
    if (tg && url) tg.openLink(url);
    else if (url) window.open(url, "_blank");
    else if (tg) tg.showPopup({ title: "Скачать подборку", message: "Пока нет download_url для этой подборки.", buttons: [{ type: "ok" }] });
  });

  // open reference links
  detail.querySelectorAll("[data-ref-url]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-ref-url") || "";
      if (!url) return;
      if (tg) tg.openLink(url);
      else window.open(url, "_blank");
    });
  });
}

function closeMoodDetail() {
  document.querySelector(".app")?.classList.remove("is-mood-detail");

  const detail = document.getElementById("moodDetail");
  detail?.classList.add("is-hidden");
  if (detail) detail.innerHTML = "";
}

function renderMoodDetail(item) {
  const title = escapeHtml(item.title ?? "");
  const views = Number(item.views ?? 0);
  const likes = Number(item.likes ?? 0);

  const aboutTitle = escapeHtml(item.about_title ?? "О подборке");
  const aboutText = escapeHtml(item.about ?? item.desc ?? "—");

  const impactTitle = escapeHtml(item.impact_title ?? "Влияние на бизнес");
  const impacts = Array.isArray(item.impact) ? item.impact : [];
  const impactHtml = impacts.length
    ? impacts
        .map((x) => {
          const label = escapeHtml(x.label ?? "");
          const value = escapeHtml(x.value ?? "");
          return `
            <div class="mimpact__item">
              <div>
                <p class="mimpact__label">${label}</p>
              </div>
              <p class="mimpact__value">${value}</p>
            </div>
          `;
        })
        .join("")
    : `<p class="mblock__text">—</p>`;

  const refsTitle = `Референсы (${Array.isArray(item.references) ? item.references.length : (item.refs ?? 0)})`;
  const refs = Array.isArray(item.references) ? item.references : [];
  const refsHtml = refs.length
    ? refs
        .map((r) => {
          const rTitle = escapeHtml(r.title ?? "");
          const rDesc = escapeHtml(r.desc ?? "");
          const rTag = escapeHtml(r.tag ?? "");
          const rUrl = String(r.url ?? "");
          return `
            <div class="mref">
              <div class="mref__main">
                <div class="mref__title">${rTitle}</div>
                <div class="mref__desc">${rDesc}</div>
                ${rTag ? `<span class="mref__tag">→ ${rTag}</span>` : ``}
              </div>

              ${rUrl ? `
                <button class="mref__open" type="button" data-ref-url="${escapeAttr(rUrl)}" aria-label="Открыть">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3h7v7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 14v7h-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 10V3h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              ` : ``}
            </div>
          `;
        })
        .join("")
    : `<p class="mblock__text">—</p>`;

  return `
    <div class="mdetail__top">
      <div class="mdetail__topbar">
        <button class="mdetail__back" type="button" data-back>← Назад</button>

        <div class="mdetail__actions">
          <button class="mdetail__iconbtn" type="button" data-share aria-label="Поделиться">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 6l-4-4-4 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 2v14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="mdetail__iconbtn" type="button" data-bookmark aria-label="В закладки">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <h1 class="mdetail__title">${title}</h1>

      <div class="mdetail__stats">
        <span class="mdetail__stat">${iconEye()} ${views}</span>
        <span class="mdetail__stat">${iconHeart()} ${likes}</span>
      </div>
    </div>

    <div class="mdetail__content">
      <div class="mblock">
        <h3 class="mblock__title">${aboutTitle}</h3>
        <p class="mblock__text">${aboutText}</p>
      </div>

      <div class="mblock">
        <h3 class="mblock__title">${impactTitle}</h3>
        <div class="mimpact">${impactHtml}</div>
      </div>

      <div class="mblock">
        <h3 class="mblock__title">${escapeHtml(refsTitle)}</h3>
        <div class="mrefs">${refsHtml}</div>
      </div>
    </div>

    <button class="mdetail__download" type="button" data-download>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 10l5 5 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 21h14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Скачать подборку
    </button>
  `;
}


function loadGlossary() {
  state.glossaryLoaded = true;

  fetch("/tg/api/glossary")
    .then((r) => r.json())
    .then((payload) => {
      if (!payload || payload.ok !== true) throw new Error("API error");
      const items = Array.isArray(payload.items) ? payload.items : [];

      cache.glossary = items; // <<< важно

      // рендерим список карточек
      const listHtml = items.map(renderGlossaryCard).join("");

      // detail контейнер уже есть в HTML, но он может быть пустым
      const detailEl = document.getElementById("glossaryDetail");
      glossaryEl.innerHTML = listHtml + (detailEl ? detailEl.outerHTML : `<section class="gdetail is-hidden" id="glossaryDetail"></section>`);

      const listRoot = glossaryEl; 
      bindGlossaryCardClicks(listRoot);
    })
    .catch((err) => {
      glossaryEl.innerHTML = `<div style="color:#999;padding:12px">Ошибка загрузки данных: ${escapeHtml(String(err))}</div>`;
    });
}


  function renderGlossaryCard(item) {
  const id = item.id ?? "";
  const term = escapeHtml(item.term ?? "");
  const desc = escapeHtml(item.desc ?? "");

  return `
    <article class="tcard" data-id="${escapeAttr(id)}" role="button" tabindex="0">
      <div class="tcard__main">
        <h3 class="tcard__title">${term}</h3>
        <p class="tcard__desc">${desc}</p>
      </div>

      <span class="tcard__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>
          <path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </article>
  `;
}

function bindGlossaryCardClicks(root) {
  root.addEventListener("click", (e) => {
    const card = e.target.closest(".tcard");
    if (!card) return;
    openGlossary(card.getAttribute("data-id"));
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".tcard");
    if (!card) return;
    e.preventDefault();
    openGlossary(card.getAttribute("data-id"));
  });
}

function openGlossary(id) {
  if (!id) return;

  const item = cache.glossary.find((x) => String(x.id) === String(id));
  if (!item) return;

  document.querySelector(".app")?.classList.add("is-gdetail");

  // прячем список (все tcard)
  glossaryEl.querySelectorAll(".tcard").forEach((el) => el.classList.add("is-hidden"));

  const detail = document.getElementById("glossaryDetail");
  if (!detail) return;

  detail.classList.remove("is-hidden");
  detail.innerHTML = renderGlossaryDetail(item);

  detail.querySelector("[data-back]")?.addEventListener("click", closeGlossaryDetail);

  // если в похожих терминах есть data-open
  detail.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openGlossary(btn.getAttribute("data-open")));
  });
}

function closeGlossaryDetail() {
  document.querySelector(".app")?.classList.remove("is-gdetail");

  const detail = document.getElementById("glossaryDetail");
  if (detail) {
    detail.classList.add("is-hidden");
    detail.innerHTML = "";
  }

  // возвращаем список
  glossaryEl.querySelectorAll(".tcard").forEach((el) => el.classList.remove("is-hidden"));
}

function renderGlossaryDetail(item) {
  const title = escapeHtml(item.term ?? item.title ?? "");
  const chain = escapeHtml(item.chain ?? item.path ?? ""); // "Структура → Доверие через порядок и предсказуемость"
  const what = escapeHtml(item.what ?? item.desc ?? "");
  const how = escapeHtml(item.how ?? "");
  const notes = escapeHtml(item.notes ?? "");

  const metrics = Array.isArray(item.metrics) ? item.metrics : [];
  const cases = Array.isArray(item.cases) ? item.cases : [];
  const mistakes = Array.isArray(item.mistakes) ? item.mistakes : [];
  const similar = Array.isArray(item.similar) ? item.similar : [];

  const metricsHtml = metrics
    .map((m) => `
      <div class="gmetric">
        <div class="gmetric__left">
          <div class="gmetric__title">${escapeHtml(m.title ?? "")}</div>
          <div class="gmetric__desc">${escapeHtml(m.desc ?? "")}</div>
        </div>
        <div class="gmetric__val">${escapeHtml(m.value ?? "")}</div>
      </div>
    `)
    .join("");

  const casesHtml = cases
    .map((c) => `
      <div class="gcase">
        <div class="gcase__top">
          <div class="gcase__brand">${escapeHtml(c.brand ?? "")}</div>
        </div>
        <div class="gcase__row"><span class="gcase__label">Подход:</span> <span class="gcase__text">${escapeHtml(c.approach ?? "")}</span></div>
        ${c.tag ? `<div class="gcase__tag">✓ ${escapeHtml(c.tag)}</div>` : ``}
      </div>
    `)
    .join("");

  const mistakesHtml = mistakes
    .map((t) => `
      <div class="gmistake">
        <div class="gmistake__x">×</div>
        <div class="gmistake__txt">${escapeHtml(t)}</div>
      </div>
    `)
    .join("");

  const similarHtml = similar
    .map((s) => {
      const sid = typeof s === "object" ? s.id : "";
      const stitle = escapeHtml(typeof s === "object" ? (s.title ?? "") : String(s));
      return sid
        ? `<button class="similar__item" type="button" data-open="${escapeAttr(sid)}">${stitle}</button>`
        : `<div class="similar__item">${stitle}</div>`;
    })
    .join("");

  return `
    <button class="gdetail__back" type="button" data-back>← Назад к словарю</button>

    <div class="gdetail__hero">
      <h1 class="gdetail__title">${title}</h1>
      ${chain ? `<div class="gdetail__chain">${chain}</div>` : ``}
    </div>

    <div class="gblock">
      <h3 class="gblock__title">Что это такое?</h3>
      <p class="gblock__text">${what}</p>
    </div>

    <div class="gblock">
      <h3 class="gblock__title">Влияние на метрики</h3>
      <div class="gmetrics">${metricsHtml || `<p class="gblock__text">—</p>`}</div>
    </div>

    <div class="gblock">
      <h3 class="gblock__title">Кейсы из практики</h3>
      <div class="gcases">${casesHtml || `<p class="gblock__text">—</p>`}</div>
    </div>

    <div class="gblock gblock--hint">
      <div class="gblock__head">
        <span class="gblock__spark" aria-hidden="true">✨</span>
        <h3 class="gblock__title">Как использовать</h3>
      </div>
      <p class="gblock__text">${how || notes || "—"}</p>
    </div>

    <div class="gblock">
      <h3 class="gblock__title">Частые ошибки</h3>
      <div class="gmistakes">${mistakesHtml || `<p class="gblock__text">—</p>`}</div>
    </div>

    ${similar.length ? `
      <div class="gblock">
        <h3 class="gblock__title">Похожие термины</h3>
        <div class="similar">${similarHtml}</div>
      </div>
    ` : ``}
  `;
}


function loadOrders() {
  state.ordersLoaded = true;

  ordersEl.innerHTML = `
    <div class="oform">
      <h3 class="oform__title">Живой стол заказчика</h3>
      <p class="oform__sub">Задай вопрос — получи взгляд опытного заказчика</p>

      <div class="oform__row">
        <input class="oform__input" id="orderInput" type="text" placeholder="Твой вопрос или боль..." />
        <button class="oform__send" id="orderSend" type="button" aria-label="Отправить">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22 2L11 13" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="olist__list" id="ordersList"></div>
    <section class="odetail is-hidden" id="orderDetail"></section>
  `;

  const listEl = document.getElementById("ordersList");
  const inputEl = document.getElementById("orderInput");
  const sendEl = document.getElementById("orderSend");

  fetch("/tg/api/orders")
    .then((r) => r.json())
    .then((payload) => {
      if (!payload || payload.ok !== true) throw new Error("API error");

      const items = Array.isArray(payload.questions) ? payload.questions : [];
      cache.orders = items; // <<< ОБЯЗАТЕЛЬНО

      listEl.innerHTML = items.map(renderOrderCard).join("");
      bindOrderCardClicks(listEl);
    })
    .catch((err) => {
      listEl.innerHTML = `<div style="color:#999;padding:12px">Ошибка загрузки: ${escapeHtml(String(err))}</div>`;
    });

  function submit() {
    const q = (inputEl?.value || "").trim();
    if (!q) return;

    sendEl.disabled = true;

    fetch("/tg/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ question: q })
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (!ok || !json || json.ok !== true) throw new Error(json?.error || "send_error");

        if (tg) tg.showPopup({ title: "Готово", message: "Вопрос отправлен.", buttons: [{ type: "ok" }] });
        else alert("Вопрос отправлен.");

        inputEl.value = "";
      })
      .catch((e) => {
        const msg = String(e);
        if (tg) tg.showPopup({ title: "Ошибка", message: msg, buttons: [{ type: "ok" }] });
        else alert(msg);
      })
      .finally(() => {
        sendEl.disabled = false;
      });
  }

  sendEl?.addEventListener("click", submit);
  inputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
}

function renderOrderCard(item) {
  const id = item.id ?? "";
  const title = escapeHtml(item.title ?? "");
  const level = escapeHtml(item.level ?? "");
  const answer = escapeHtml(item.answer ?? "");

  return `
    <article class="qcard" data-id="${escapeAttr(id)}" role="button" tabindex="0">
      <div class="qcard__top">
        <div class="qcard__left">
          <span class="qcard__bubble" aria-hidden="true">💬</span>
          <div class="qcard__text">
            <h3 class="qcard__title">${title}</h3>
            <p class="qcard__level">${level}</p>
          </div>
        </div>

        <span class="qcard__arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>
            <path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>

      <div class="qcard__body">
        <p class="qcard__answer">${answer}</p>
      </div>
    </article>
  `;
}

function bindOrderCardClicks(root) {
  root.addEventListener("click", (e) => {
    const card = e.target.closest(".qcard");
    if (!card) return;
    openOrder(card.getAttribute("data-id"));
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".qcard");
    if (!card) return;
    e.preventDefault();
    openOrder(card.getAttribute("data-id"));
  });
}

function openOrder(id) {
  if (!id) return;

  const item = cache.orders.find((x) => String(x.id) === String(id));
  if (!item) return;

  const form = ordersEl.querySelector(".oform");
  const list = document.getElementById("ordersList");
  const detail = document.getElementById("orderDetail");
  if (!detail) return;

  form?.classList.add("is-hidden");
  list?.classList.add("is-hidden");

  detail.classList.remove("is-hidden");
  detail.innerHTML = renderOrderDetail(item);

  detail.querySelector("[data-back]")?.addEventListener("click", closeOrderDetail);

  detail.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openOrder(btn.getAttribute("data-open")));
  });
}

function closeOrderDetail() {
  const form = ordersEl.querySelector(".oform");
  const list = document.getElementById("ordersList");
  const detail = document.getElementById("orderDetail");

  detail?.classList.add("is-hidden");
  if (detail) detail.innerHTML = "";

  form?.classList.remove("is-hidden");
  list?.classList.remove("is-hidden");
}


function renderOrderCard(item) {
  const id = item.id ?? "";
  const title = escapeHtml(item.title ?? "");
  const level = escapeHtml(item.level ?? "");
  const answer = escapeHtml(item.answer ?? "");

  return `
    <article class="qcard" data-id="${escapeAttr(id)}" role="button" tabindex="0">
      <div class="qcard__top">
        <div class="qcard__left">
          <span class="qcard__bubble" aria-hidden="true">💬</span>
          <div class="qcard__text">
            <h3 class="qcard__title">${title}</h3>
            <p class="qcard__level">${level}</p>
          </div>
        </div>

        <span class="qcard__arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>
            <path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>

      <div class="qcard__body">
        <p class="qcard__answer">${answer}</p>
      </div>
    </article>
  `;
}

function bindOrderCardClicks(root) {
  root.addEventListener("click", (e) => {
    const card = e.target.closest(".qcard");
    if (!card) return;
    openOrder(card.getAttribute("data-id"));
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".qcard");
    if (!card) return;
    e.preventDefault();
    openOrder(card.getAttribute("data-id"));
  });
}

function openOrder(id) {
  if (!id) return;

  const item = cache.orders.find((x) => String(x.id) === String(id));
  if (!item) return;

  document.querySelector(".app")?.classList.add("is-detail");


  const form = ordersEl.querySelector(".oform");
  const list = document.getElementById("ordersList");
  const detail = document.getElementById("orderDetail");

  if (!detail) return;

  form?.classList.add("is-hidden");
  list?.classList.add("is-hidden");

  detail.classList.remove("is-hidden");
  detail.innerHTML = renderOrderDetail(item);

  detail.querySelector("[data-back]")?.addEventListener("click", closeOrderDetail);

  detail.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openOrder(btn.getAttribute("data-open")));
  });
}

function closeOrderDetail() {
document.querySelector(".app")?.classList.remove("is-detail");

  const form = ordersEl.querySelector(".oform");
  const list = document.getElementById("ordersList");
  const detail = document.getElementById("orderDetail");

  detail?.classList.add("is-hidden");
  if (detail) detail.innerHTML = "";

  form?.classList.remove("is-hidden");
  list?.classList.remove("is-hidden");
}

function renderOrderDetail(item) {
  const level = escapeHtml(item.level ?? "");
  const title = escapeHtml(item.title ?? "");
  const about = escapeHtml(item.about ?? "");
  const quick = escapeHtml(item.quick ?? item.answer ?? "");
  const analysis = escapeHtml(item.analysis ?? "");
  const biz = escapeHtml(item.biz ?? "");

  const convince = Array.isArray(item.convince) ? item.convince : [];
  const flags = Array.isArray(item.flags) ? item.flags : [];
  const similar = Array.isArray(item.similar) ? item.similar : [];

  const convinceHtml = convince
    .map((t, i) => `
      <div class="oline">
        <div class="oline__num">${i + 1}</div>
        <p class="oline__txt">${escapeHtml(t)}</p>
      </div>
    `)
    .join("");

  const flagsHtml = flags
    .map((t) => `
      <div class="flag">
        <div class="flag__dot">!</div>
        <p class="flag__txt">${escapeHtml(t)}</p>
      </div>
    `)
    .join("");

  const similarHtml = similar
    .map((s) => {
      // если similar приходит как {id,title} — поддержим оба варианта
      const sid = typeof s === "object" ? s.id : "";
      const stitle = escapeHtml(typeof s === "object" ? (s.title ?? "") : String(s));
      return sid
        ? `<button class="similar__item" type="button" data-open="${escapeAttr(sid)}">${stitle}</button>`
        : `<div class="similar__item">${stitle}</div>`;
    })
    .join("");

  return `
    <button class="odetail__back" type="button" data-back>
      ← К списку вопросов
    </button>

    <div class="odetail__hero">
      ${level ? `<span class="odetail__pill">${level}</span>` : ``}
      <h1 class="odetail__q">«${title}»</h1>
      ${about ? `<p class="odetail__hint">${about}</p>` : ``}
    </div>

    <div class="oblock oblock--primary">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">💡</span>
        <h3 class="oblock__title">Быстрый ответ</h3>
      </div>
      <p class="oblock__text">${quick}</p>
    </div>

    <div class="oblock">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">🧾</span>
        <h3 class="oblock__title">Развёрнутый разбор</h3>
      </div>
      <p class="oblock__text">${analysis}</p>
    </div>

    <div class="oblock">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">✅</span>
        <h3 class="oblock__title">Как убедить заказчика</h3>
      </div>
      <div class="olines">
        ${convinceHtml || `<p class="oblock__text">—</p>`}
      </div>
    </div>

    <div class="oblock">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">📈</span>
        <h3 class="oblock__title">Бизнес-логика</h3>
      </div>
      <p class="oblock__text">${biz}</p>
    </div>

    <div class="oblock">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">⛳</span>
        <h3 class="oblock__title">Красные флаги</h3>
      </div>
      <div class="flaglist">
        ${flagsHtml || `<p class="oblock__text">—</p>`}
      </div>
    </div>

    <div class="oblock">
      <div class="oblock__head">
        <span class="oblock__icon" aria-hidden="true">🔎</span>
        <h3 class="oblock__title">Похожие вопросы</h3>
      </div>
      <div class="similar">
        ${similarHtml || `<p class="oblock__text">—</p>`}
      </div>
    </div>
  `;
}


  // ===== Icons + Utils =====
  function iconEye() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1 6C1 6 2.5 2.5 6 2.5C9.5 2.5 11 6 11 6C11 6 9.5 9.5 6 9.5C2.5 9.5 1 6 1 6Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 7.5C6.82843 7.5 7.5 6.82843 7.5 6C7.5 5.17157 6.82843 4.5 6 4.5C5.17157 4.5 4.5 5.17157 4.5 6C4.5 6.82843 5.17157 7.5 6 7.5Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function iconHeart() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none" aria-hidden="true">
        <path d="M9 6C9.745 5.27 10.5 4.395 10.5 3.25C10.5 2.52065 10.2103 1.82118 9.69454 1.30546C9.17882 0.789731 8.47935 0.5 7.75 0.5C6.87 0.5 6.25 0.75 5.5 1.5C4.75 0.75 4.13 0.5 3.25 0.5C2.52065 0.5 1.82118 0.789731 1.30546 1.30546C0.789731 1.82118 0.5 2.52065 0.5 3.25C0.5 4.4 1.25 5.275 2 6L5.5 9.5L9 6Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("`", "&#096;");
  }
})();
