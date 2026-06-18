document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-site-search]").forEach(function (input) {
    var scope = input.closest("[data-search-scope]") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

    if (!cards.length) {
      scope = document;
      cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    }

    input.addEventListener("input", function () {
      var term = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle("is-hidden", term && text.indexOf(term) === -1);
      });
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-overlay]");
    var source = player.getAttribute("data-stream");

    function playVideo() {
      if (!video || !source) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__hlsInstance) {
          var hls = new window.Hls();
          video.__hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      if (!video.getAttribute("src")) {
        video.setAttribute("src", source);
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
});
