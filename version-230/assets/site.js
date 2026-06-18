(function () {
  var body = document.body;
  var base = body ? body.getAttribute('data-base') || '' : '';
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.hasAttribute('hidden');
      if (opened) {
        mobileNav.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobileNav.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var globalSearch = document.getElementById('global-search');
  var results = document.getElementById('search-results');

  function renderResults(query) {
    if (!results) {
      return;
    }
    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    var items = (window.SITE_SEARCH_INDEX || []).filter(function (item) {
      return [item.title, item.year, item.region, item.genre, item.type].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 12);
    if (!items.length) {
      results.hidden = false;
      results.innerHTML = '<div class="search-empty">未找到相关影片</div>';
      return;
    }
    results.hidden = false;
    results.innerHTML = items.map(function (item) {
      return '<a class="search-item" href="' + base + item.url + '">' +
        '<img src="' + base + item.poster + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
        '</a>';
    }).join('');
  }

  if (globalSearch) {
    globalSearch.addEventListener('input', function () {
      renderResults(globalSearch.value);
    });
    document.addEventListener('click', function (event) {
      if (!results || results.hidden) {
        return;
      }
      if (!results.contains(event.target) && event.target !== globalSearch) {
        results.hidden = true;
      }
    });
  }

  var localInput = document.querySelector('[data-local-search]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var genreSelect = document.querySelector('[data-genre-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title].movie-card'));

  function filterCards() {
    var q = localInput ? localInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var genre = genreSelect ? genreSelect.value : '';
    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(' ').toLowerCase();
      var match = (!q || text.indexOf(q) !== -1) &&
        (!year || card.dataset.year === year) &&
        (!region || card.dataset.region === region) &&
        (!genre || card.dataset.genre.indexOf(genre) !== -1);
      card.hidden = !match;
    });
  }

  [localInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
