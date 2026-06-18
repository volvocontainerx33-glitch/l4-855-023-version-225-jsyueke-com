(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      body.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-selected', String(dotIndex === current));
      });
    }

    function startTimer() {
      if (slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
    var count = scope.querySelector('[data-result-count]');
    var activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function refresh() {
      var keyword = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var filterText = normalize(card.getAttribute('data-filter'));
        var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedFilter = activeFilter === 'all' || filterText.indexOf(activeFilter) !== -1;
        var shouldShow = matchedText && matchedFilter;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }

      input.addEventListener('input', refresh);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = normalize(chip.getAttribute('data-filter-chip'));
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        refresh();
      });
    });

    refresh();
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-src');
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function initAndPlay() {
      if (!video || !source) {
        setStatus('当前内容暂时无法播放');
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.controls = true;

      if (!initialized) {
        initialized = true;
        setStatus('正在连接播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
            video.play().catch(function () {
              setStatus('点击播放器即可继续播放');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放加载失败，请稍后再试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪');
            video.play().catch(function () {
              setStatus('点击播放器即可继续播放');
            });
          }, { once: true });
          video.addEventListener('error', function () {
            setStatus('播放加载失败，请稍后再试');
          });
        } else {
          setStatus('当前浏览器不支持 HLS 播放');
        }
      } else {
        video.play().catch(function () {
          setStatus('点击播放器即可继续播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', initAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          initAndPlay();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}());
