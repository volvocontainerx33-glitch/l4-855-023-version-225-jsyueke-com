(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = selectAll(".hero-slide");
    var dots = selectAll(".hero-dot");
    var prev = document.querySelector(".hero-control.prev");
    var next = document.querySelector(".hero-control.next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    start();
  }

  function initLocalFilter() {
    var inputs = selectAll(".filter-input");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        selectAll("[data-search-item]").forEach(function (item) {
          var value = ((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "")).toLowerCase();
          item.classList.toggle("hidden-by-filter", keyword && value.indexOf(keyword) === -1);
        });
      });
    });
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster\" href=\"" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />" +
      "<span class=\"poster-shade\"></span><span class=\"play-chip\">播放</span></a>" +
      "<div class=\"card-body\"><div class=\"card-meta\"><a href=\"category-" + movie.categorySlug + ".html\">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<h2><a href=\"" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h2>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var container = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    if (!container || input === null || typeof MOVIE_SEARCH_DATA === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function render(keyword) {
      var term = keyword.trim().toLowerCase();
      var data = MOVIE_SEARCH_DATA;
      var results = term ? data.filter(function (movie) {
        return movie.searchText.indexOf(term) !== -1;
      }) : data.slice(0, 48);

      if (!results.length) {
        container.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
        return;
      }
      container.innerHTML = "<div class=\"section-head\"><div><h2>搜索结果</h2><p>按关键词匹配片名、地区、题材与标签</p></div></div><div class=\"movie-grid listing-grid\">" + results.slice(0, 120).map(cardTemplate).join("") + "</div>";
    }

    render(query);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !source) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && playResult.catch) {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();
