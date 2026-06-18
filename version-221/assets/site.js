document.addEventListener('DOMContentLoaded', function () {
  setupMenu();
  setupHeroCarousel();
  setupLocalFilter();
  setupSearchPage();
  setupPlayer();
});

function setupMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));

  if (!slides.length) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('mouseenter', function () {
      show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      start();
    });
  });

  var hero = document.querySelector('.hero-carousel');
  if (hero) {
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
  }

  show(0);
  start();
}

function setupLocalFilter() {
  var input = document.querySelector('[data-local-filter]');
  var list = document.querySelector('[data-card-list]');

  if (!input || !list) {
    return;
  }

  var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

  input.addEventListener('input', function () {
    var keyword = input.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  });
}

function setupSearchPage() {
  var results = document.querySelector('[data-search-results]');
  var fallback = document.querySelector('[data-search-fallback]');
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-input]');

  if (!results || !input || !window.SEARCH_INDEX) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function escapeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function render(items) {
    results.innerHTML = items.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeText(item.link) + '" aria-label="观看' + escapeText(item.title) + '">',
        '    <img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy" decoding="async">',
        '    <span class="poster-shine"></span>',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="meta-row"><span>' + escapeText(item.year) + '</span><span>' + escapeText(item.region) + '</span><span>' + escapeText(item.type) + '</span></div>',
        '    <h3><a href="' + escapeText(item.link) + '">' + escapeText(item.title) + '</a></h3>',
        '    <p>' + escapeText(item.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeText(item.genre) + '</span><span>' + escapeText(item.category) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function search(query) {
    var keyword = query.trim().toLowerCase();

    if (!keyword) {
      results.innerHTML = '';
      if (fallback) {
        fallback.classList.remove('is-hidden');
      }
      return;
    }

    var items = window.SEARCH_INDEX.filter(function (item) {
      return item.search.indexOf(keyword) !== -1;
    }).slice(0, 120);

    render(items);

    if (fallback) {
      fallback.classList.toggle('is-hidden', items.length > 0);
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);

      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }

      window.history.replaceState(null, '', url.toString());
      search(query);
    });
  }

  input.addEventListener('input', function () {
    search(input.value);
  });

  search(initialQuery);
}

function setupPlayer() {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play]');
  var overlay = shell.querySelector('.player-overlay');

  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var loaded = false;
  var hlsInstance = null;

  function loadStream() {
    if (loaded || !stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    loaded = true;
  }

  function playVideo() {
    loadStream();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    playVideo();
  });

  shell.addEventListener('click', function (event) {
    if (event.target === video && loaded) {
      return;
    }
    playVideo();
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
