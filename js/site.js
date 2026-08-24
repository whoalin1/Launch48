(function () {
  var toggle = document.querySelector("[data-menu]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-faq]").forEach(function (item) {
    var btn = item.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll("[data-faq]").forEach(function (other) {
        other.classList.remove("open");
        var b = other.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  var form = document.querySelector("form.brief");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var banner = document.querySelector("[data-preview-banner]");
      if (banner) {
        banner.classList.add("show");
        banner.focus();
        banner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
