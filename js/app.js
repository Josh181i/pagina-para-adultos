
// OMINHUB FRONTEND COMPLETO
(function () {
  const BASE_PATH = (window.OMINHUB_BASE_PATH || ".").replace(/\/+$/,"");

  // ============================
  // Utilidades almacenamiento
  // ============================
  function getStored(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function setStored(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignorar
    }
  }

  const STORE_KEYS = {
    favorites: "ominhub_favorites_v1",
    history: "ominhub_history_v1",
    uploaded: "ominhub_uploaded_v1"
  };

  // ============================
  // Catálogo de videos (demo)
  // ============================
  const THUMBS = [
    BASE_PATH + "/assets/thumbs/t1.jpg",
    BASE_PATH + "/assets/thumbs/t2.jpg",
    BASE_PATH + "/assets/thumbs/t3.jpg",
    BASE_PATH + "/assets/thumbs/t4.jpg",
    BASE_PATH + "/assets/thumbs/t5.jpg",
    BASE_PATH + "/assets/thumbs/t6.jpg"
  ];
  const VIDEO_SRC = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const CATEGORIES = ["Recommended", "Trending", "Gaming", "Music", "Tech", "Lifestyle"];
  const TAGS = ["4K", "60fps", "Atmospheric", "Study", "Relax", "Deep Focus", "Loop"];

  const VIDEOS = (function buildVideos() {
    const list = [];
    let idCounter = 1;
    for (let c = 0; c < CATEGORIES.length; c++) {
      const cat = CATEGORIES[c];
      for (let i = 1; i <= 12; i++) {
        const thumb = THUMBS[(idCounter - 1) % THUMBS.length];
        const durationMin = 8 + ((i * (c + 1)) % 25);
        const durationSec = (i * 7) % 60;
        const views = 4200 * idCounter + 13500;
        list.push({
          id: String(idCounter),
          title: cat + " session #" + i,
          category: cat,
          duration: durationMin + ":" + String(durationSec).padStart(2, "0"),
          views: views,
          thumb: thumb,
          src: VIDEO_SRC,
          tags: [
            TAGS[(i + c) % TAGS.length],
            TAGS[(i + c + 2) % TAGS.length]
          ],
          channelName: "Channel " + c,
          channelAvatar: "https://i.pravatar.cc/40?u=" + idCounter,
          subscribers: 1000 * c + 2500,
          likes: Math.floor(views / 100),
          dislikes: Math.floor(views / 1000),
          comments: [
            { author: "User1", text: "Great video!", avatar: "https://i.pravatar.cc/40?u=101" },
            { author: "User2", text: "I love this channel.", avatar: "https://i.pravatar.cc/40?u=102" }
          ]
        });
        idCounter++;
      }
    }
    return list;
  })();

  function getVideoById(id) {
    return VIDEOS.find(v => v.id === String(id));
  }

  // ============================
  // Navegación
  // ============================
  function resolveHref(pageKey) {
    switch (pageKey) {
      case "home": return BASE_PATH + "/index.html";
      case "search": return BASE_PATH + "/pages/search/index.html";
      case "categories": return BASE_PATH + "/pages/categories/index.html";
      case "favorites": return BASE_PATH + "/pages/favorites/index.html";
      case "history": return BASE_PATH + "/pages/history/index.html";
      case "playlist": return BASE_PATH + "/pages/playlist/index.html";
      case "channel": return BASE_PATH + "/pages/channel/index.html";
      case "tags": return BASE_PATH + "/pages/tags/index.html";
      case "admin": return BASE_PATH + "/pages/admin/index.html";
      case "login": return BASE_PATH + "/pages/login/index.html";
      case "register": return BASE_PATH + "/pages/register/index.html";
      case "profile": return BASE_PATH + "/pages/profile/index.html";
      case "watch": return BASE_PATH + "/watch.html";
      default: return null;
    }
  }

  function getCurrentPageKey() {
    const body = document.body;
    return body.dataset.page || "home";
  }

  // ============================
  // Layout base (navbar + sidebar + footer)
  // ============================
  function buildShell() {
    const container = document.getElementById("app-root") || document.body;
    container.innerHTML = [
      '<header class="nav">',
      '  <div class="nav-left">',
      '    <button class="icon-button" type="button" data-sidebar-toggle>&#9776;</button>',
      '    <a class="logo" data-nav="home">',
      '      <span class="logo-main">OMIN</span><span class="logo-accent">HUB</span>',
      "    </a>",
      "  </div>",
      '  <div class="nav-center">',
      '    <form class="search-bar" id="top-search-form">',
'      <input type="text" id="top-search-input" placeholder="Search millions of HD videos..." autocomplete="off" data-translate="Search millions of HD videos..."/>',
'      <button type="submit" data-translate="Search">Search</button>',
      "    </form>",
      "  </div>",
      '  <div class="nav-right">',
'    <a class="nav-link" data-nav="channel" data-translate="Upload">Upload</a>',
'    <div id="user-actions"></div>',
'    <div class="nav-lang">',
'      <select class="nav-lang-toggle" id="lang-select">',
'        <option value="en">English</option>',
'        <option value="es">Español</option>',
'      </select>',
'    </div>',
      "  </div>",
      "</header>",
      '<div class="app-shell">',
      '  <aside class="sidebar">',
'    <div class="sidebar-section-title" data-translate="Browse">Browse</div>',
      '    <ul class="sidebar-menu">',
'      <li><a data-nav="home" data-page-target="home"><span class="sidebar-icon">&#8962;</span><span data-translate="Home">Home</span></a></li>',
'      <li><a data-nav="categories" data-page-target="categories"><span class="sidebar-icon">&#9776;</span><span data-translate="Categories">Categories</span></a></li>',
'      <li><a data-nav="tags" data-page-target="tags"><span class="sidebar-icon">#</span><span data-translate="Tags">Tags</span></a></li>',
      "    </ul>",
'    <div class="sidebar-section-title" data-translate="Library">Library</div>',
      '    <ul class="sidebar-menu">',
'      <li><a data-nav="favorites" data-page-target="favorites"><span class="sidebar-icon">&#10084;</span><span data-translate="Favorites">Favorites</span></a></li>',
'      <li><a data-nav="history" data-page-target="history"><span class="sidebar-icon">&#8635;</span><span data-translate="History">History</span></a></li>',
'      <li><a data-nav="playlist" data-page-target="playlist"><span class="sidebar-icon">&#127911;</span><span data-translate="Playlists">Playlists</span></a></li>',
      "    </ul>",
'    <div class="sidebar-section-title" data-translate="Creator">Creator</div>',
      '    <ul class="sidebar-menu">',
'      <li><a data-nav="channel" data-page-target="channel"><span class="sidebar-icon">&#128249;</span><span data-translate="My channel">My channel</span></a></li>',
'      <li><a data-nav="admin" data-page-target="admin"><span class="sidebar-icon">&#9881;</span><span data-translate="Admin panel">Admin panel</span></a></li>',
'      <li><a data-nav="profile" data-page-target="profile"><span class="sidebar-icon">&#128100;</span><span data-translate="Profile">Profile</span></a></li>',
      "    </ul>",
      '    <div class="sidebar-bottom">',
      "      Signed in as Demo user<br/>Experience for study / portfolio only.",
      "    </div>",
      "  </aside>",
      '  <div class="sidebar-overlay" data-sidebar-close></div>',
      '  <main id="main-content" class="main"></main>',
      "</div>",
      '<footer class="footer">',
      '  <div class="footer-top">',
      '    <div>',
      '      <div class="footer-column-title">Discover</div>',
      '      <div class="footer-links">',
      "        <a href=\"#\">About OMINHUB</a>",
      "        <a href=\"#\">Creators</a>",
      "        <a href=\"#\">Studio</a>",
      "      </div>",
      "    </div>",
      '    <div>',
      '      <div class="footer-column-title">Legal</div>',
      '      <div class="footer-links">',
      "        <a href=\"#\">Terms</a>",
      "        <a href=\"#\">Privacy</a>",
      "        <a href=\"#\">Cookies</a>",
      "      </div>",
      "    </div>",
      '    <div>',
      '      <div class="footer-column-title">Help</div>',
      '      <div class="footer-links">',
      "        <a href=\"#\">Support</a>",
      "        <a href=\"#\">Safety</a>",
      "      </div>",
      "    </div>",
      "  </div>",
      '  <div style="opacity:0.6;">© ' + new Date().getFullYear() + ' OMINHUB · Demo UI</div>',
      "</footer>"
    ].join("");

    wireNavigation();
    wireSidebar();
    wireSearch();
    highlightActiveMenu();
    setupLanguage();
  }

  const translations = {
    "es": {
      "Search millions of HD videos...": "Busca millones de videos en HD...",
      "Search": "Buscar",
      "Upload": "Subir",
      "Log in": "Iniciar sesión",
      "Sign up": "Registrarse",
      "Browse": "Explorar",
      "Home": "Inicio",
      "Categories": "Categorías",
      "Tags": "Etiquetas",
      "Library": "Biblioteca",
      "Favorites": "Favoritos",
      "History": "Historial",
      "Playlists": "Playlists",
      "Creator": "Creator",
      "My channel": "Mi canal",
      "Admin panel": "Panel de admin",
      "Profile": "Perfil",
      "Featured videos": "Videos destacados",
      "Curated sessions to keep your viewers engaged. Scroll or change page to explore more.": "Sesiones seleccionadas para mantener a tus espectadores interesados. Desplázate o cambia de página para explorar más.",
      "Browse by category": "Explorar por categoría",
      "Click a category to filter the catalog. Use the pagination to move between pages of results.": "Haz clic en una categoría para filtrar el catálogo. Usa la paginación para moverte entre las páginas de resultados.",
      "Popular tags": "Etiquetas populares",
      "Select a tag to see all the sessions that use it.": "Selecciona una etiqueta para ver todas las sesiones que la usan.",
      "Type a keyword and press Enter to filter videos by title, category or tags.": "Escribe una palabra clave y presiona Enter para filtrar videos por título, categoría o etiquetas.",
      "All the videos you have marked with the heart will appear here.": "Todos los videos que has marcado con el corazón aparecerán aquí.",
      "You have no favorites yet. Click the heart on any video to add it.": "Aún no tienes favoritos. Haz clic en el corazón de cualquier video para agregarlo.",
      "Watch history": "Historial de reproducciones",
      "This is a local demo history stored only in your browser.": "Este es un historial de demostración local almacenado solo en tu navegador.",
      "You have not watched any sessions yet. Pick something from Home!": "Aún no has visto ninguna sesión. ¡Elige algo de la página de inicio!",
      "My playlists": "Mis playlists",
      "Create manual collections of videos. This is a visual demo — backend logic is not implemented.": "Crea colecciones manuales de videos. Esta es una demostración visual, la lógica del backend no está implementada.",
      "Create a new playlist": "Crear una nueva playlist",
      "Give your playlist a name and short description.": "Dale a tu playlist un nombre y una descripción corta.",
      "Name": "Nombre",
      "Description": "Descripción",
      "Save demo playlist": "Guardar playlist de demostración",
      "Creator studio": "Estudio de creación",
      "Upload and manage your content. For this demo we only show the interface.": "Sube y gestiona tu contenido. Para esta demostración, solo mostramos la interfaz.",
      "Upload a new video": "Subir un nuevo video",
      "Title": "Título",
      "Video file": "Archivo de video",
      "Upload video": "Subir video",
      "My videos": "Mis videos",
      "You have not uploaded any videos yet.": "Aún no has subido ningún video.",
      "Admin dashboard": "Panel de administración",
      "A compact control panel to moderate videos and manage the catalog (demo only).": "Un panel de control compacto para moderar videos y gestionar el catálogo (solo demostración).",
      "This page represents the viewer account in this demo.": "Esta página representa la cuenta del espectador en esta demostración.",
      "Use any credentials. This form is only for UI demonstration.": "Usa cualquier credencial. Este formulario es solo para demostración de la interfaz de usuario.",
      "Create account": "Crear cuenta",
      "Fill out the fields below. Data is not sent anywhere in this demo.": "Completa los campos a continuación. Los datos no se envían a ninguna parte en esta demostración.",
      "Select a video from Home, Categories or Search to start watching.": "Selecciona un video de Inicio, Categorías o Búsqueda para comenzar a ver.",
      "More like this": "Más como esto",
      "Featured videos": "Videos destacados",
      "Like": "Me gusta",
      "Dislike": "No me gusta",
      "Share": "Compartir",
      "Welcome": "Bienvenido",
      "Log out": "Cerrar sesión",
      "Subscribed": "Suscrito",
      "Subscribe": "Suscribirse",
      "Comments": "Comentarios",
      "Related videos": "Videos relacionados",
      "Add a comment...": "Añade un comentario...",
      "Comment": "Comentar",
      "No comments yet.": "Aún no hay comentarios.",
      "Please log in to manage your channel.": "Por favor, inicia sesión para gestionar tu canal."
    }
  };

  function updateUserActions() {
    const user = getStored("ominhub_user", null);
    const userActions = document.getElementById("user-actions");

    if (userActions) {
      if (user) {
        userActions.innerHTML = `
          <span class="nav-link" data-translate="Welcome">Welcome</span>, ${user.name}
          <button class="nav-button" id="logout-btn" data-translate="Log out">Log out</button>
        `;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            setStored("ominhub_user", null);
            window.location.reload();
          });
        }
      } else {
        userActions.innerHTML = `
          <button class="nav-button" data-nav="login" data-translate="Log in">Log in</button>
          <button class="nav-button nav-button-outline" data-nav="register" data-translate="Sign up">Sign up</button>
        `;
      }
      wireNavigation();
      translateUI(getStored("ominhub_lang", "en"));
    }
  }

  function setupLanguage() {
    const langSelect = document.getElementById("lang-select");
    const currentLang = getStored("ominhub_lang", "en");

    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.addEventListener("change", (e) => {
        setStored("ominhub_lang", e.target.value);
        window.location.reload();
      });
    }

    translateUI(currentLang);
  }

  function translateUI(lang) {
    const elements = document.querySelectorAll("[data-translate]");
    const translationMap = translations[lang] || {};

    elements.forEach(el => {
      const key = el.getAttribute("data-translate");
      if (translationMap[key]) {
        el.textContent = translationMap[key];
      }
    });
  }

  function wireNavigation() {
    const navElements = document.querySelectorAll("[data-nav]");
    navElements.forEach(el => {
      const key = el.getAttribute("data-nav");
      const href = resolveHref(key);
      if (href) {
        if (el.tagName === "A") {
          el.setAttribute("href", href);
        } else {
          el.addEventListener("click", () => {
            window.location.href = href;
          });
        }
      }
    });
  }

  function wireSidebar() {
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const overlay = document.querySelector("[data-sidebar-close]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-open");
      });
    }
    if (overlay) {
      overlay.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
      });
    }
  }

  function wireSearch() {
    const form = document.getElementById("top-search-form");
    const input = document.getElementById("top-search-input");
    if (!form || !input) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const term = input.value.trim();
      const searchHref = resolveHref("search");
      if (!searchHref) return;
      const url = searchHref + (term ? ("?q=" + encodeURIComponent(term)) : "");
      window.location.href = url;
    });
  }

  function highlightActiveMenu() {
    const current = getCurrentPageKey();
    document.querySelectorAll("[data-page-target]").forEach(el => {
      const page = el.getAttribute("data-page-target");
      if (page === current) {
        el.classList.add("active");
      }
    });
  }

  // ============================
  // Render helpers
  // ============================
  function createVideoCard(video, options) {
    options = options || {};
    const wrapper = document.createElement("article");
    wrapper.className = "video-card";
    const watchHref = resolveHref("watch") + "?id=" + encodeURIComponent(video.id);

    wrapper.innerHTML = [
      '<div class="video-thumb-wrapper">',
      '  <img class="video-thumb" src="' + video.thumb + '" alt="' + escapeHtml(video.title) + '">',
      '  <div class="video-duration">' + video.duration + "</div>",
      "</div>",
      '<div class="video-body">',
      '  <div class="video-title">' + escapeHtml(video.title) + "</div>",
      '  <div class="video-meta">' + escapeHtml(video.category) + " · " + formatViews(video.views) + " views</div>",
      '  <div class="video-tags">' + video.tags.map(t => '<span class="video-tag">' + escapeHtml(t) + "</span>").join("") + "</div>",
      '  <div class="video-actions">',
      '    <button class="btn-pill" type="button">Watch</button>',
      '    <span class="favorite-indicator" title="Add to favorites">&#9825;</span>',
      "  </div>",
      "</div>"
    ].join("");

    wrapper.addEventListener("click", function (e) {
      const isButton = e.target.closest("button") || e.target.classList.contains("favorite-indicator");
      if (e.target.classList.contains("favorite-indicator")) {
        e.stopPropagation();
        toggleFavorite(video.id, e.target);
        return;
      }
      if (isButton && e.target.classList.contains("btn-pill")) {
        window.location.href = watchHref;
        return;
      }
      // click en cualquier parte de la tarjeta
      window.location.href = watchHref;
    });

    // marcar si ya es favorito
    const favEl = wrapper.querySelector(".favorite-indicator");
    if (favEl && isFavorite(video.id)) {
      favEl.textContent = "♥";
    }

    return wrapper;
  }

  function setupPagination(gridEl, paginationEl, items, perPage) {
    let currentPage = 1;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));

    function renderPage(page) {
      currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * perPage;
      const currentItems = items.slice(start, start + perPage);

      gridEl.innerHTML = "";
      currentItems.forEach(v => gridEl.appendChild(createVideoCard(v)));

      paginationEl.innerHTML = "";
      if (totalPages <= 1) return;

      const prev = document.createElement("button");
      prev.textContent = "Prev";
      prev.disabled = currentPage === 1;
      prev.addEventListener("click", () => renderPage(currentPage - 1));
      paginationEl.appendChild(prev);

      for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.textContent = String(p);
        if (p === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => renderPage(p));
        paginationEl.appendChild(btn);
      }

      const next = document.createElement("button");
      next.textContent = "Next";
      next.disabled = currentPage === totalPages;
      next.addEventListener("click", () => renderPage(currentPage + 1));
      paginationEl.appendChild(next);
    }

    renderPage(1);
  }

  function formatViews(v) {
    const num = typeof v === "number" ? v : Number(v);
    if (!isFinite(num)) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\\.0$/, "") + "K";
    return String(num);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ============================
  // Favoritos & historial
  // ============================
  function isFavorite(id) {
    const favs = getStored(STORE_KEYS.favorites, []);
    return favs.includes(String(id));
  }
  function toggleFavorite(id, el) {
    let favs = getStored(STORE_KEYS.favorites, []);
    const sId = String(id);
    if (favs.includes(sId)) {
      favs = favs.filter(x => x !== sId);
      if (el) el.textContent = "♡";
    } else {
      favs.push(sId);
      if (el) el.textContent = "♥";
    }
    setStored(STORE_KEYS.favorites, favs);
  }

  function pushHistory(videoId) {
    const history = getStored(STORE_KEYS.history, []);
    const now = new Date().toISOString();
    const filtered = history.filter(h => h.id !== String(videoId));
    filtered.unshift({ id: String(videoId), at: now });
    const trimmed = filtered.slice(0, 40);
    setStored(STORE_KEYS.history, trimmed);
  }

  // ============================
  // Render de cada página
  // ============================
  function renderHome(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Featured videos">Featured videos</h1>',
      '  <p class="section-subtitle" data-translate="Curated sessions to keep your viewers engaged. Scroll or change page to explore more.">Curated sessions to keep your viewers engaged. Scroll or change page to explore more.</p>',
      '  <div id="home-grid" class="video-grid"></div>',
      '  <div id="home-pagination" class="pagination"></div>',
      "</section>"
    ].join("");

    const grid = document.getElementById("home-grid");
    const pag = document.getElementById("home-pagination");
    const allVideos = [...VIDEOS];
    setupPagination(grid, pag, allVideos, 12);
  }

  function renderCategories(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Browse by category">Browse by category</h1>',
      '  <p class="section-subtitle" data-translate="Click a category to filter the catalog. Use the pagination to move between pages of results.">Click a category to filter the catalog. Use the pagination to move between pages of results.</p>',
      '  <div id="cat-filters" class="chip-filter-row"></div>',
      '  <div id="cat-grid" class="video-grid"></div>',
      '  <div id="cat-pagination" class="pagination"></div>',
      "</section>"
    ].join("");

    const catFilters = document.getElementById("cat-filters");
    const grid = document.getElementById("cat-grid");
    const pag = document.getElementById("cat-pagination");

    const uniqueCats = Array.from(new Set(VIDEOS.map(v => v.category)));
    let currentCat = uniqueCats[0] || null;

    uniqueCats.forEach(cat => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = cat;
      chip.className = "chip-filter" + (cat === currentCat ? " active" : "");
      chip.addEventListener("click", () => {
        currentCat = cat;
        document.querySelectorAll(".chip-filter").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const filtered = VIDEOS.filter(v => v.category === currentCat);
        setupPagination(grid, pag, filtered, 12);
      });
      catFilters.appendChild(chip);
    });

    const initial = VIDEOS.filter(v => v.category === currentCat);
    setupPagination(grid, pag, initial, 12);
  }

  function renderTags(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Popular tags">Popular tags</h1>',
      '  <p class="section-subtitle" data-translate="Select a tag to see all the sessions that use it.">Select a tag to see all the sessions that use it.</p>',
      '  <div id="tag-filters" class="chip-filter-row"></div>',
      '  <div id="tag-grid" class="video-grid"></div>',
      '  <div id="tag-pagination" class="pagination"></div>',
      "</section>"
    ].join("");

    const tagFilters = document.getElementById("tag-filters");
    const grid = document.getElementById("tag-grid");
    const pag = document.getElementById("tag-pagination");

    const uniqueTags = Array.from(new Set(VIDEOS.flatMap(v => v.tags)));
    let current = uniqueTags[0] || null;

    uniqueTags.forEach(tag => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = tag;
      chip.className = "chip-filter" + (tag === current ? " active" : "");
      chip.addEventListener("click", () => {
        current = tag;
        document.querySelectorAll(".chip-filter").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const filtered = VIDEOS.filter(v => v.tags.includes(tag));
        setupPagination(grid, pag, filtered, 12);
      });
      tagFilters.appendChild(chip);
    });

    const initial = VIDEOS.filter(v => v.tags.includes(current));
    setupPagination(grid, pag, initial, 12);
  }

  function renderSearch(main) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Search">Search</h1>',
      '  <p class="section-subtitle" data-translate="Type a keyword and press Enter to filter videos by title, category or tags.">Type a keyword and press Enter to filter videos by title, category or tags.</p>',
      '  <form class="search-bar" id="page-search-form" style="max-width:480px;margin-bottom:14px;">',
      '    <input type="text" id="page-search-input" placeholder="Search in OMINHUB..." value="' + escapeHtml(q) + '" />',
      '    <button type="submit">Search</button>',
      "  </form>",
      '  <div id="search-grid" class="video-grid"></div>',
      '  <div id="search-pagination" class="pagination"></div>',
      "</section>"
    ].join("");

    const form = document.getElementById("page-search-form");
    const input = document.getElementById("page-search-input");
    const grid = document.getElementById("search-grid");
    const pag = document.getElementById("search-pagination");

    function perform(term) {
      const t = term.toLowerCase();
      const filtered = !t
        ? VIDEOS
        : VIDEOS.filter(v =>
            v.title.toLowerCase().includes(t) ||
            v.category.toLowerCase().includes(t) ||
            v.tags.some(tag => tag.toLowerCase().includes(t))
          );
      if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state">No results found. Try another keyword.</div>';
        pag.innerHTML = "";
        return;
      }
      setupPagination(grid, pag, filtered, 12);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const value = input.value.trim();
      const searchHref = resolveHref("search");
      const url = searchHref + (value ? ("?q=" + encodeURIComponent(value)) : "");
      window.location.href = url;
    });

    perform(q);
  }

  function renderFavorites(main) {
    const favIds = getStored(STORE_KEYS.favorites, []);
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Favorites">Favorites</h1>',
      '  <p class="section-subtitle" data-translate="All the videos you have marked with the heart will appear here.">All the videos you have marked with the heart will appear here.</p>',
      '  <div id="fav-grid" class="video-grid"></div>',
      '  <div id="fav-pagination" class="pagination"></div>',
      "</section>"
    ].join("");

    const grid = document.getElementById("fav-grid");
    const pag = document.getElementById("fav-pagination");

    const favVideos = favIds
      .map(id => getVideoById(id))
      .filter(Boolean);

    if (!favVideos.length) {
      grid.innerHTML = '<div class="empty-state" data-translate="You have no favorites yet. Click the heart on any video to add it.">You have no favorites yet. Click the heart on any video to add it.</div>';
      pag.innerHTML = "";
      return;
    }

    setupPagination(grid, pag, favVideos, 12);
  }

  function renderHistory(main) {
    const historyRaw = getStored(STORE_KEYS.history, []);
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Watch history">Watch history</h1>',
      '  <p class="section-subtitle" data-translate="This is a local demo history stored only in your browser.">This is a local demo history stored only in your browser.</p>',
      '  <div id="hist-grid" class="video-grid"></div>',
      "</section>"
    ].join("");

    const grid = document.getElementById("hist-grid");

    if (!historyRaw.length) {
      grid.innerHTML = '<div class="empty-state" data-translate="You have not watched any sessions yet. Pick something from Home!">You have not watched any sessions yet. Pick something from Home!</div>';
      return;
    }

    historyRaw.forEach(item => {
      const v = getVideoById(item.id);
      if (!v) return;
      const card = createVideoCard(v);
      grid.appendChild(card);
    });
  }

  function renderPlaylist(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="My playlists">My playlists</h1>',
      '  <p class="section-subtitle" data-translate="Create manual collections of videos. This is a visual demo — backend logic is not implemented.">Create manual collections of videos. This is a visual demo — backend logic is not implemented.</p>',
      '  <div class="form-card">',
      '    <h1 data-translate="Create a new playlist">Create a new playlist</h1>',
      '    <p data-translate="Give your playlist a name and short description.">Give your playlist a name and short description.</p>',
      '    <div class="form-field">',
      '      <label for="pl-name" data-translate="Name">Name</label>',
      '      <input id="pl-name" type="text" placeholder="Night coding set" />',
      "    </div>",
      '    <div class="form-field">',
      '      <label for="pl-desc" data-translate="Description">Description</label>',
      '      <input id="pl-desc" type="text" placeholder="Deep focus 4K walks for late sessions" />',
      "    </div>",
      '    <button class="nav-button" type="button" id="pl-save-btn" data-translate="Save demo playlist">Save demo playlist</button>',
      '    <div class="form-footer" id="pl-info"></div>',
      "  </div>",
      "</section>"
    ].join("");

    const btn = document.getElementById("pl-save-btn");
    const info = document.getElementById("pl-info");
    if (btn && info) {
      btn.addEventListener("click", () => {
        info.textContent = "Playlist saved locally (demo only, not persisted on server).";
      });
    }
  }

  function renderChannel(main) {
    const user = getStored("ominhub_user", null);

    if (!user) {
      main.innerHTML = `
        <section class="section">
          <div class="empty-state">Please <a data-nav="login">log in</a> to manage your channel.</div>
        </section>
      `;
      wireNavigation();
      return;
    }

    main.innerHTML = `
      <section class="section">
        <h1 class="section-title" data-translate="Creator studio">Creator studio</h1>
        <p class="section-subtitle" data-translate="Upload and manage your content. For this demo we only show the interface.">Upload and manage your content. For this demo we only show the interface.</p>
        <div class="form-card">
          <h1 data-translate="Upload a new video">Upload a new video</h1>
          <div class="form-field">
            <label for="up-title" data-translate="Title">Title</label>
            <input id="up-title" type="text" placeholder="Forest walk in 4K" />
          </div>
          <div class="form-field">
            <label for="up-description" data-translate="Description">Description</label>
            <textarea id="up-description" placeholder="A relaxing walk through a forest..."></textarea>
          </div>
          <div class="form-field">
            <label for="up-file" data-translate="Video file">Video file</label>
            <input id="up-file" type="file" accept="video/*" />
          </div>
          <button class="nav-button" type="button" id="up-btn" data-translate="Upload video">Upload video</button>
          <div class="form-footer" id="up-info"></div>
        </div>
        <h2 class="section-title" data-translate="My videos">My videos</h2>
        <div id="my-videos" class="video-grid"></div>
      </section>
    `;

    const btn = document.getElementById("up-btn");
    const info = document.getElementById("up-info");
    const myVideosContainer = document.getElementById("my-videos");

    function renderMyVideos() {
      const uploadedVideos = getStored(STORE_KEYS.uploaded, []).filter(v => v.channelName === user.name);
      myVideosContainer.innerHTML = "";
      if (uploadedVideos.length) {
        uploadedVideos.forEach(v => myVideosContainer.appendChild(createVideoCard(v)));
      } else {
        myVideosContainer.innerHTML = `<div class="empty-state" data-translate="You have not uploaded any videos yet.">You have not uploaded any videos yet.</div>`;
      }
      translateUI(getStored("ominhub_lang", "en"));
    }

    if (btn && info) {
      btn.addEventListener("click", () => {
        const title = document.getElementById("up-title").value.trim();
        const description = document.getElementById("up-description").value.trim();
        const file = document.getElementById("up-file").files[0];

        if (title && description && file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const newVideo = {
              id: "up_" + Date.now(),
              title: title,
              description: description,
              category: "Uploaded",
              duration: "N/A",
              views: 0,
              thumb: BASE_PATH + "/assets/thumbs/t6.jpg", // Placeholder thumb
              src: event.target.result,
              tags: ["Uploaded", "User Content"],
              channelName: user.name,
              channelAvatar: "https://i.pravatar.cc/40?u=" + user.name,
              subscribers: 0,
              likes: 0,
              dislikes: 0,
              comments: []
            };
            const allUploaded = getStored(STORE_KEYS.uploaded, []);
            allUploaded.unshift(newVideo);
            setStored(STORE_KEYS.uploaded, allUploaded);
            VIDEOS.unshift(newVideo);
            renderMyVideos();
            info.textContent = "Video uploaded successfully!";
          };
          reader.readAsDataURL(file);
        } else {
          info.textContent = "Please fill all fields.";
        }
      });
    }

    renderMyVideos();
  }


  function renderAdmin(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Admin dashboard">Admin dashboard</h1>',
      '  <p class="section-subtitle" data-translate="A compact control panel to moderate videos and manage the catalog (demo only).">A compact control panel to moderate videos and manage the catalog (demo only).</p>',
      '  <div class="video-grid">',
      '    <div class="video-card">',
      '      <div class="video-body">',
      '        <div class="video-title">Catalog stats</div>',
      '        <div class="video-meta">Total demo videos: ' + VIDEOS.length + "</div>",
      '        <div class="video-tags">',
      '          <span class="video-tag">Categories: ' + CATEGORIES.length + "</span>",
      '          <span class="video-tag">Tags: ' + TAGS.length + "</span>",
      "        </div>",
      "      </div>",
      "    </div>",
      '    <div class="video-card">',
      '      <div class="video-body">',
      '        <div class="video-title">Moderation queue</div>',
      '        <div class="video-meta">No pending reports. Platform is clean.</div>',
      '        <div class="video-tags">',
      '          <span class="video-tag">Abuse</span>',
      '          <span class="video-tag">Copyright</span>',
      "        </div>",
      "      </div>",
      "    </div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  function renderProfile(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <h1 class="section-title" data-translate="Profile">Profile</h1>',
      '  <p class="section-subtitle" data-translate="This page represents the viewer account in this demo.">This page represents the viewer account in this demo.</p>',
      '  <div class="form-card">',
      '    <h1>Demo User</h1>',
      '    <p>Email: demo@ominhub.local</p>',
      '    <div class="form-field">',
      '      <label for="pf-username">Display name</label>',
      '      <input id="pf-username" type="text" value="Demo User" />',
      "    </div>",
      '    <div class="form-field">',
      '      <label for="pf-lang">Language (UI only)</label>',
      '      <input id="pf-lang" type="text" value="English" />',
      "    </div>",
      '    <button class="nav-button" type="button" id="pf-save">Save</button>',
      '    <div class="form-footer" id="pf-info"></div>',
      "  </div>",
      "</section>"
    ].join("");

    const btn = document.getElementById("pf-save");
    const info = document.getElementById("pf-info");
    if (btn && info) {
      btn.addEventListener("click", () => {
        info.textContent = "Changes stored locally (demo only).";
      });
    }
  }

  function renderLogin(main) {
    main.innerHTML = `
      <section class="section">
        <div class="form-card">
          <h1>Iniciar sesión de miembro</h1>
          <p>Accede a tu cuenta de OMINHUB</p>
          <button class="nav-button" style="width:100%; margin-bottom:10px; background:#4285F4;">Inicia sesión con Google</button>
          <button class="nav-button" style="width:100%; margin-bottom:10px; background:#1DA1F2;">Inicia sesión con X</button>
          <div class="form-field">
            <label for="lg-email">Email</label>
            <input id="lg-email" type="email" placeholder="you@example.com" value="demo@ominhub.tv" />
          </div>
          <div class="form-field">
            <label for="lg-pass">Password</label>
            <input id="lg-pass" type="password" placeholder="••••••••" value="1234" />
          </div>
          <button class="nav-button" type="button" id="lg-btn">Inicia sesión con correo electrónico y contraseña</button>
          <div class="form-footer">
            ¿Aún no tienes una cuenta? <a data-nav="register">Registrarse aquí</a>
          </div>
        </div>
      </section>
    `;

    const btn = document.getElementById("lg-btn");
    const emailInput = document.getElementById("lg-email");
    if (btn && emailInput) {
      btn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (email) {
          const name = email.split("@")[0];
          setStored("ominhub_user", { name: name });
          window.location.href = resolveHref("channel");
        }
      });
    }
    wireNavigation();
  }

  function renderRegister(main) {
    main.innerHTML = [
      '<section class="section">',
      '  <div class="form-card">',
      '    <h1>Crear cuenta</h1>',
      '    <p>Únete a OMINHUB y empieza a subir tus videos.</p>',
      '    <div class="form-field">',
      '      <label for="rg-name">Nombre de usuario</label>',
      '      <input id="rg-name" type="text" placeholder="Tu nombre de usuario" />',
      "    </div>",
      '    <div class="form-field">',
      '      <label for="rg-email">Correo electrónico</label>',
      '      <input id="rg-email" type="email" placeholder="tu@ejemplo.com" />',
      "    </div>",
      '    <div class="form-field">',
      '      <label for="rg-pass">Contraseña</label>',
      '      <input id="rg-pass" type="password" placeholder="••••••••" />',
      "    </div>",
      '    <button class="nav-button" type="button" id="rg-btn">Crear cuenta</button>',
      '    <div class="form-footer">',
      '      ¿Ya tienes una cuenta? <a data-nav="login">Iniciar sesión</a>',
      '    </div>',
      "  </div>",
      "</section>"
    ].join("");

    const btn = document.getElementById("rg-btn");
    const nameInput = document.getElementById("rg-name");
    const emailInput = document.getElementById("rg-email");

    if (btn && nameInput && emailInput) {
      btn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        if (name && email) {
          setStored("ominhub_user", { name: name });
          window.location.href = resolveHref("channel");
        }
      });
    }
    wireNavigation();
  }

  function getCurrentVideoIdFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("id");
    if (fromQuery) return fromQuery;
    const match = window.location.pathname.match(/video(\\d+)/);
    if (match) return match[1];
    return null;
  }

  function renderWatch(main) {
    const id = getCurrentVideoIdFromLocation();
    const video = id ? getVideoById(id) : null;

    if (!video) {
      main.innerHTML = '<div class="empty-state" data-translate="Select a video from Home, Categories or Search to start watching.">Select a video from Home, Categories or Search to start watching.</div>';
      return;
    }

    pushHistory(video.id);

    main.innerHTML = `
      <section class="section watch-layout">
        <div class="watch-main-col">
          <div class="watch-player-wrapper">
            <video controls autoplay src="${video.src}" class="watch-player"></video>
          </div>
          <h1 class="watch-title">${escapeHtml(video.title)}</h1>
          <div class="watch-meta-bar">
            <div class="watch-channel-info">
              <img src="${video.channelAvatar}" alt="${escapeHtml(video.channelName)}" class="watch-channel-avatar">
              <div>
                <div class="watch-channel-name">${escapeHtml(video.channelName)}</div>
                <div class="watch-channel-subs">${formatViews(video.subscribers)} subscribers</div>
              </div>
              <button class="nav-button" id="subscribe-btn" data-translate="Subscribe">Subscribe</button>
              <button class="icon-button" id="bell-btn">&#128276;</button>
            </div>
            <div class="watch-actions-group">
              <button class="btn-pill" id="like-btn">
                &#128077; <span id="like-count">${formatViews(video.likes)}</span>
              </button>
              <button class="btn-pill" id="dislike-btn">
                &#128078; <span id="dislike-count">${formatViews(video.dislikes)}</span>
              </button>
              <button class="btn-pill" id="share-btn" data-translate="Share">&#128256; Share</button>
            </div>
          </div>
          <div class="watch-description">
            <strong>${formatViews(video.views)} views</strong> · <span>${escapeHtml(video.category)}</span>
            <p>${escapeHtml(video.description || "No description available.")}</p>
          </div>
          <div class="comments-section">
            <h2 class="section-title" data-translate="Comments">Comments (<span id="comment-count">${video.comments.length}</span>)</h2>
            <div class="comment-form">
              <textarea id="comment-input" placeholder="Add a comment..." data-translate="Add a comment..."></textarea>
              <button class="nav-button" id="comment-btn" data-translate="Comment">Comment</button>
            </div>
            <div id="comment-list" class="comment-list"></div>
          </div>
        </div>
        <div class="watch-related-col">
          <h2 class="aside-heading" data-translate="Related videos">Related videos</h2>
          <div id="watch-related" class="video-grid-related"></div>
        </div>
      </section>
    `;

    const relatedContainer = document.getElementById("watch-related");
    const related = VIDEOS.filter(v => v.category === video.category && v.id !== video.id).slice(0, 10);
    related.forEach(v => relatedContainer.appendChild(createVideoCard(v)));

    const likeBtn = document.getElementById("like-btn");
    const dislikeBtn = document.getElementById("dislike-btn");
    const subscribeBtn = document.getElementById("subscribe-btn");
    const bellBtn = document.getElementById("bell-btn");
    const commentBtn = document.getElementById("comment-btn");
    const commentInput = document.getElementById("comment-input");
    const commentList = document.getElementById("comment-list");
    const likeCountEl = document.getElementById("like-count");
    const dislikeCountEl = document.getElementById("dislike-count");
    const commentCountEl = document.getElementById("comment-count");

    likeBtn.addEventListener("click", () => {
      video.likes++;
      likeCountEl.textContent = formatViews(video.likes);
    });

    dislikeBtn.addEventListener("click", () => {
      video.dislikes++;
      dislikeCountEl.textContent = formatViews(video.dislikes);
    });

    subscribeBtn.addEventListener("click", () => {
      const user = getStored("ominhub_user", null);
      if (!user) {
        window.location.href = resolveHref("login");
        return;
      }
      subscribeBtn.classList.toggle("subscribed");
      subscribeBtn.textContent = subscribeBtn.classList.contains("subscribed") ? "Subscribed" : "Subscribe";
    });

    commentBtn.addEventListener("click", () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        const newComment = {
          author: "Demo User",
          text: commentText,
          avatar: "https://i.pravatar.cc/40?u=99"
        };
        video.comments.unshift(newComment);
        renderComments(video.comments, commentList);
        commentCountEl.textContent = video.comments.length;
        commentInput.value = "";
      }
    });

    renderComments(video.comments, commentList);
  }

  function renderComments(comments, container) {
    container.innerHTML = "";
    if (!comments || !comments.length) {
      container.innerHTML = `<div class="empty-state">No comments yet.</div>`;
      return;
    }
    comments.forEach(comment => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment-item";
      commentEl.innerHTML = `
        <img src="${comment.avatar}" alt="${escapeHtml(comment.author)}" class="comment-avatar">
        <div>
          <div class="comment-author">${escapeHtml(comment.author)}</div>
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
      `;
      container.appendChild(commentEl);
    });
  }

  // ============================
  // Boot
  // ============================
  function init() {
    buildShell();
    updateUserActions();

    const uploadedVideos = getStored(STORE_KEYS.uploaded, []);
    VIDEOS.unshift(...uploadedVideos);
    const main = document.getElementById("main-content");
    const page = getCurrentPageKey();

    switch (page) {
      case "home": renderHome(main); break;
      case "categories": renderCategories(main); break;
      case "tags": renderTags(main); break;
      case "search": renderSearch(main); break;
      case "favorites": renderFavorites(main); break;
      case "history": renderHistory(main); break;
      case "playlist": renderPlaylist(main); break;
      case "channel": renderChannel(main); break;
      case "admin": renderAdmin(main); break;
      case "profile": renderProfile(main); break;
      case "login": renderLogin(main); break;
      case "register": renderRegister(main); break;
      case "watch": renderWatch(main); break;
      default: renderHome(main); break;
    }
    translateUI(getStored("ominhub_lang", "en"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
