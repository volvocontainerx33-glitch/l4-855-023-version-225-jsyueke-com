(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function htmlEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMobileMenu() {
    var toggle = qs(".js-mobile-toggle");
    var panel = qs(".js-mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    var next = qs(".js-hero-next");
    var prev = qs(".js-hero-prev");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        play();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    play();
  }

  function setupCardFilters() {
    var input = qs(".js-card-search");
    var buttons = qsa(".js-filter-buttons [data-filter]");
    var cards = qsa("[data-card]");
    if (!cards.length) {
      return;
    }
    var filter = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" ").toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) >= 0;
        var matchesFilter = filter === "all" || haystack.indexOf(filter.toLowerCase()) >= 0;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        filter = button.getAttribute("data-filter") || "all";
        apply();
      });
    });
  }

  function setupPlayers() {
    qsa(".js-player").forEach(function (player) {
      var video = qs(".js-video", player);
      var button = qs(".js-play-button", player);
      var stream = player.getAttribute("data-stream");
      var hls = null;
      if (!video || !stream) {
        return;
      }

      function start() {
        if (!video.getAttribute("data-ready")) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.setAttribute("data-ready", "1");
        }
        player.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        if (!player.classList.contains("is-playing")) {
          start();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + htmlEscape(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-card>" +
      "<a class=\"poster-frame\" href=\"" + htmlEscape(movie.href) + "\" data-title=\"" + htmlEscape(movie.title) + "\">" +
      "<img src=\"./" + htmlEscape(movie.image) + ".jpg\" alt=\"" + htmlEscape(movie.title) + "\" class=\"poster-image\" loading=\"lazy\" onerror=\"this.parentElement.classList.add('poster-text');this.remove();\">" +
      "<span class=\"card-badge\">" + htmlEscape(movie.category) + "</span>" +
      "<span class=\"card-score\">" + htmlEscape(movie.rating) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"" + htmlEscape(movie.href) + "\">" + htmlEscape(movie.title) + "</a>" +
      "<p class=\"movie-desc\">" + htmlEscape(movie.desc) + "</p>" +
      "<div class=\"movie-meta\"><span>" + htmlEscape(movie.year) + "</span><span>" + htmlEscape(movie.region) + "</span><span>" + htmlEscape(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var container = qs(".js-search-results");
    var status = qs(".js-search-status");
    var form = qs(".js-search-page-form");
    if (!container || !window.CATALOG_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = form ? qs("input[name='q']", form) : null;
    if (input) {
      input.value = query;
    }
    if (!query) {
      status.textContent = "请输入关键词浏览相关影片。";
      container.innerHTML = window.CATALOG_MOVIES.slice(0, 24).map(movieCard).join("");
      return;
    }
    var q = query.toLowerCase();
    var results = window.CATALOG_MOVIES.filter(function (movie) {
      return [movie.title, movie.desc, movie.genre, movie.region, movie.year, (movie.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(q) >= 0;
    }).slice(0, 120);
    status.textContent = results.length ? "已找到相关影片" : "没有匹配影片";
    container.innerHTML = results.map(movieCard).join("");
  }

  setupMobileMenu();
  setupHero();
  setupCardFilters();
  setupPlayers();
  setupSearchPage();
})();
