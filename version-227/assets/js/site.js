(function () {
  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startSlider() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startSlider();
      });
    });

    startSlider();
  }

  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      toggle.textContent = mobileMenu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupStaticFilter(panel) {
    var root = panel.closest("main") || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-grid] .movie-card"));
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;
        ok = ok && (!q || text.indexOf(q) !== -1);
        ok = ok && (!y || normalize(card.getAttribute("data-year")) === y);
        ok = ok && (!r || normalize(card.getAttribute("data-region")) === r);
        ok = ok && (!t || normalize(card.getAttribute("data-type")) === t);
        card.style.display = ok ? "" : "none";
      });
    }

    [keyword, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(setupStaticFilter);

  function optionList(select, values) {
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(" ");
    return [
      "<a href=\"" + movie.href + "\" class=\"movie-card group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + movie.year + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-tags=\"" + escapeHtml(tags) + "\">",
      "<div class=\"relative aspect-[3/4] overflow-hidden bg-ancient-900\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" class=\"w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500\" loading=\"lazy\">",
      "<div class=\"absolute inset-0 bg-gradient-to-t from-ancient-950 via-ancient-950/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity\"></div>",
      "<div class=\"absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-ancient-950/80 backdrop-blur-sm rounded-md\"><span class=\"text-sm font-semibold text-amber-400\">" + movie.year + "</span></div>",
      "<div class=\"absolute bottom-0 left-0 right-0 p-4\"><h3 class=\"font-serif font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors text-base md:text-lg\">" + escapeHtml(movie.title) + "</h3><p class=\"text-ancient-300 text-sm line-clamp-2 mb-3\">" + escapeHtml(movie.oneLine) + "</p><div class=\"flex items-center justify-between text-xs text-ancient-400\"><div class=\"flex items-center space-x-3\"><span>" + escapeHtml(movie.region) + "</span><span>" + movie.score + "</span></div><span class=\"px-2 py-1 bg-amber-500/20 text-amber-400 rounded\">" + escapeHtml(movie.type) + "</span></div></div>",
      "</div>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var searchRoot = document.querySelector("[data-search-page]");
  var searchResults = document.getElementById("search-results");

  if (searchRoot && searchResults && window.MovieSearchData) {
    var input = searchRoot.querySelector("[data-search-input]");
    var yearSelect = searchRoot.querySelector("[data-search-year]");
    var regionSelect = searchRoot.querySelector("[data-search-region]");
    var typeSelect = searchRoot.querySelector("[data-search-type]");
    var params = new URLSearchParams(window.location.search);
    var years = Array.from(new Set(window.MovieSearchData.map(function (movie) { return movie.year; }))).sort(function (a, b) { return b - a; });
    var regions = Array.from(new Set(window.MovieSearchData.map(function (movie) { return movie.region; }))).sort();
    var types = Array.from(new Set(window.MovieSearchData.map(function (movie) { return movie.type; }))).sort();

    optionList(yearSelect, years);
    optionList(regionSelect, regions);
    optionList(typeSelect, types);

    if (params.get("q")) {
      input.value = params.get("q");
    }

    function renderSearch() {
      var q = normalize(input.value);
      var y = normalize(yearSelect.value);
      var r = normalize(regionSelect.value);
      var t = normalize(typeSelect.value);
      var result = window.MovieSearchData.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" "));
        return (!q || text.indexOf(q) !== -1) &&
          (!y || normalize(movie.year) === y) &&
          (!r || normalize(movie.region) === r) &&
          (!t || normalize(movie.type) === t);
      }).slice(0, 240);

      searchResults.innerHTML = result.map(movieCard).join("");
    }

    [input, yearSelect, regionSelect, typeSelect].forEach(function (node) {
      node.addEventListener("input", renderSearch);
      node.addEventListener("change", renderSearch);
    });

    renderSearch();
  }

  window.MovieSite = {
    mountPlayer: function (streamUrl, videoId, coverId) {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      var hls = null;
      var loaded = false;

      if (!video || !streamUrl) {
        return;
      }

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function start() {
        hideCover();

        if (loaded) {
          video.play().catch(function () {});
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", hideCover);
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  };
})();
