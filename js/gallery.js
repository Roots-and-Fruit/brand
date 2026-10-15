(function () {
  function setup(root) {
    var thumbs = Array.prototype.slice.call(root.querySelectorAll(".rf-gallery__thumb"));
    var stage = root.querySelector(".rf-gallery__img");
    var open = root.querySelector(".rf-gallery__open");
    var caption = root.querySelector(".rf-gallery__text");
    var count = root.querySelector(".rf-gallery__count");
    var dialog = root.querySelector(".rf-gallery__dialog");
    if (!thumbs.length || !stage || !open || !caption || !count || !dialog) return;

    var dialogImg = dialog.querySelector("img");
    var dialogCaption = dialog.querySelector(".rf-gallery__dialog-caption");
    var dialogCount = dialog.querySelector(".rf-gallery__dialog-count");
    var prevs = Array.prototype.slice.call(root.querySelectorAll(".rf-gallery__prev"));
    var nexts = Array.prototype.slice.call(root.querySelectorAll(".rf-gallery__next"));
    var closeBtn = dialog.querySelector(".rf-gallery__close");
    if (!dialogImg || !dialogCaption || !prevs.length || !nexts.length || !closeBtn) return;
    var index = 0;
    var opener = open;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    thumbs.forEach(function (btn, i) {
      if (btn.getAttribute("aria-current") === "true") index = i;
    });

    function label(i) {
      return (i + 1) + " of " + thumbs.length;
    }

    function show(i, fromUser) {
      index = (i + thumbs.length) % thumbs.length;
      var btn = thumbs[index];
      var src = btn.getAttribute("data-src");
      var alt = btn.getAttribute("data-alt") || "";
      var cap = btn.getAttribute("data-caption") || "";
      var text = label(index);

      stage.src = src;
      stage.alt = alt;
      if (btn.getAttribute("data-width")) stage.width = btn.getAttribute("data-width");
      if (btn.getAttribute("data-height")) stage.height = btn.getAttribute("data-height");
      caption.textContent = cap;
      count.textContent = text;
      open.setAttribute("aria-label", "Open screenshot " + text + ": " + cap);

      thumbs.forEach(function (thumb, n) {
        var on = n === index;
        if (on) thumb.setAttribute("aria-current", "true");
        else thumb.removeAttribute("aria-current");
        thumb.tabIndex = on ? 0 : -1;
      });

      var single = thumbs.length < 2;
      prevs.forEach(function (el) { el.hidden = single; });
      nexts.forEach(function (el) { el.hidden = single; });

      if (dialog.open) fillDialog();
      if (fromUser) btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }

    function fillDialog() {
      var btn = thumbs[index];
      var cap = btn.getAttribute("data-caption") || "";
      var text = label(index);
      dialogImg.src = btn.getAttribute("data-src");
      dialogImg.alt = btn.getAttribute("data-alt") || "";
      dialogCaption.textContent = cap;
      if (dialogCount) dialogCount.textContent = text;
      dialog.setAttribute("aria-label", "Screenshot " + text + ". " + cap);
      var single = thumbs.length < 2;
      prevs.forEach(function (el) { el.hidden = single; });
      nexts.forEach(function (el) { el.hidden = single; });
    }

    thumbs.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        show(i, true);
      });
    });

    root.addEventListener("keydown", function (event) {
      if (dialog.open) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (!root.contains(event.target)) return;
      event.preventDefault();
      var fromThumb = event.target.closest && event.target.closest(".rf-gallery__thumb");
      show(event.key === "ArrowRight" ? index + 1 : index - 1, true);
      if (fromThumb) thumbs[index].focus();
    });

    function openDialog(trigger) {
      opener = trigger || open;
      fillDialog();
      dialog.showModal();
    }

    open.addEventListener("click", function () {
      openDialog(open);
    });

    var expand = root.querySelector(".rf-gallery__expand");
    if (expand) {
      expand.addEventListener("click", function () {
        openDialog(expand);
      });
    }

    prevs.forEach(function (el) {
      el.addEventListener("click", function () { show(index - 1, true); });
    });
    nexts.forEach(function (el) {
      el.addEventListener("click", function () { show(index + 1, true); });
    });
    closeBtn.addEventListener("click", function () { dialog.close(); });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        show(index + 1, true);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(index - 1, true);
      }
    });

    dialog.addEventListener("close", function () {
      if (opener && opener.focus) opener.focus();
    });

    show(index);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(".rf-gallery"), setup);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
