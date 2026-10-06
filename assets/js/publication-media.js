(function () {
  "use strict";

  document.querySelectorAll(".alive-preview").forEach(function (preview) {
    var button = preview.querySelector(".alive-preview__toggle");
    var source = preview.querySelector(".alive-preview__source");
    var result = preview.querySelector(".alive-preview__result");
    var badge = preview.querySelector(".alive-preview__badge");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var showingResult = false;
    var visible = false;
    var pointerType = "";

    function play(video) {
      if (visible && !document.hidden) {
        var promise = video.play();
        if (promise) promise.catch(function () { /* Keep the poster if autoplay is blocked. */ });
      }
    }

    function showResult(next) {
      var previous = showingResult ? result : source;
      var active = next ? result : source;
      var time = previous.currentTime;
      previous.pause();
      showingResult = next;
      button.setAttribute("aria-pressed", String(next));
      button.setAttribute("aria-label", next ? "Show the source video" : "Show ALIVE's edited video");
      badge.textContent = next ? "ALIVE" : "Source video";

      function resume() {
        if (active !== (showingResult ? result : source)) return;
        // Align the same source action when switching between the two clips.
        if (Number.isFinite(active.duration) && active.duration > 0) {
          active.currentTime = time % active.duration;
        }
        if (next || !reducedMotion.matches) play(active);
      }
      if (active.readyState >= 1) resume();
      else active.addEventListener("loadedmetadata", resume, { once: true });
    }

    button.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse") showResult(true);
    });
    button.addEventListener("pointerleave", function (event) {
      if (event.pointerType === "mouse") showResult(false);
    });
    button.addEventListener("pointerdown", function (event) { pointerType = event.pointerType; });
    button.addEventListener("click", function (event) {
      showResult(event.detail === 0 || pointerType !== "mouse" ? !showingResult : true);
    });
    button.addEventListener("blur", function () { showResult(false); });
    button.addEventListener("keydown", function (event) {
      if (event.key === "Escape") showResult(false);
    });

    function updatePlayback() {
      source.pause();
      result.pause();
      if (showingResult || !reducedMotion.matches) play(showingResult ? result : source);
    }
    document.addEventListener("visibilitychange", updatePlayback);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        updatePlayback();
      }).observe(preview);
    } else {
      visible = true;
      updatePlayback();
    }
  });
}());
