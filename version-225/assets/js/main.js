function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function initMenu() {
  var button = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-mobile-nav]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function initSpotlight() {
  var root = document.querySelector("[data-spotlight]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".spotlight-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-slide-dot]"));
  if (slides.length < 2) {
    return;
  }
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  start();
}

function initSearchFilters() {
  var list = document.querySelector("[data-search-list]");
  if (!list) {
    return;
  }
  var keywordInput = document.querySelector("[data-filter-keyword]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var genreSelect = document.querySelector("[data-filter-genre]");
  var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
  var urlParams = new URLSearchParams(window.location.search);
  var initialQuery = urlParams.get("q") || "";

  if (keywordInput && initialQuery) {
    keywordInput.value = initialQuery;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    var keyword = normalize(keywordInput ? keywordInput.value : "");
    var region = normalize(regionSelect ? regionSelect.value : "");
    var genre = normalize(genreSelect ? genreSelect.value : "");

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardGenre = normalize(card.getAttribute("data-genre"));
      var okKeyword = !keyword || haystack.indexOf(keyword) > -1;
      var okRegion = !region || cardRegion === region;
      var okGenre = !genre || cardGenre.indexOf(genre) > -1 || haystack.indexOf(genre) > -1;
      card.hidden = !(okKeyword && okRegion && okGenre);
    });
  }

  [keywordInput, regionSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}

function setupMoviePlayer(streamUrl) {
  onReady(function () {
    var root = document.querySelector("[data-player-root]");
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-play-button]");
    if (!root || !video || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function playVideo() {
      attachSource();
      root.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}

onReady(function () {
  initMenu();
  initSpotlight();
  initSearchFilters();
});

window.setupMoviePlayer = setupMoviePlayer;
