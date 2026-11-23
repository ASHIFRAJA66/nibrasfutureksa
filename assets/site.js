/* Nebras Afaq Al-Mustaqbal — shared script. Nothing is stored or sent to any server. */
(function () {
  "use strict";
  var AR = document.documentElement.lang === "ar";
  var WA = "966559670724";

  /* ---------- mobile menu ---------- */
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- hide pictures that fail to load ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("img.photo"), function (img) {
    function bad() { img.classList.add("broken"); }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) bad();
    else img.addEventListener("error", bad);
  });

  /* ---------- open / closed (Riyadh time) ---------- */
  // Sat–Thu 07:00–12:00 and 14:00–19:30. Friday closed.
  var SHIFTS = [[420, 720], [840, 1170]];
  function riyadh() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Riyadh", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  var T = AR ? {
    open: "مفتوح الآن", closed: "مغلق الآن", closes: "يغلق الساعة ", soon: "يغلق خلال ", mins: " دقيقة",
    today: "نفتح اليوم الساعة ", tomorrow: "نفتح غداً الساعة ", sat: "نفتح يوم السبت الساعة ",
    t720: "12:00 ظهراً", t1170: "7:30 مساءً", t420: "7:00 صباحاً", t840: "2:00 ظهراً"
  } : {
    open: "Open now", closed: "Closed now", closes: "Closes at ", soon: "Closes in ", mins: " min",
    today: "Opens today at ", tomorrow: "Opens tomorrow at ", sat: "Opens Saturday at ",
    t720: "12:00 PM", t1170: "7:30 PM", t420: "7:00 AM", t840: "2:00 PM"
  };
  function status() {
    var box = document.getElementById("status");
    if (!box || !window.Intl) return;
    var n;
    try { n = riyadh(); } catch (e) { return; }
    var open = false, text = "", i;
    if (n.day !== 5) {
      for (i = 0; i < SHIFTS.length; i++) {
        if (n.min >= SHIFTS[i][0] && n.min < SHIFTS[i][1]) {
          open = true;
          var left = SHIFTS[i][1] - n.min;
          text = left <= 30 ? T.soon + left + T.mins : T.closes + T["t" + SHIFTS[i][1]];
        }
      }
    }
    if (!open) {
      if (n.day !== 5 && n.min < 420) text = T.today + T.t420;
      else if (n.day !== 5 && n.min >= 720 && n.min < 840) text = T.today + T.t840;
      else if (n.day === 4 || n.day === 5) text = (n.day === 5 ? T.tomorrow : T.sat) + T.t420;
      else text = T.tomorrow + T.t420;
    }
    box.className = "status " + (open ? "open" : "closed");
    box.querySelector(".st").textContent = (open ? T.open : T.closed) + " · " + text;
    box.hidden = false;
  }
  status();
  setInterval(status, 60000);

  /* ---------- forms that open WhatsApp ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("form.wa-form"), function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = ["*" + f.getAttribute("data-title") + "*"], ok = true;
      Array.prototype.forEach.call(f.querySelectorAll("[data-l]"), function (el) {
        var label = el.getAttribute("data-l");
        if (el.type === "checkbox") { if (el.checked) lines.push(label); return; }
        var v = (el.value || "").replace(/\s+/g, " ").trim().slice(0, 600);
        if (el.required && !v) { ok = false; el.classList.add("bad"); return; }
        el.classList.remove("bad");
        if (v) lines.push(label + ": " + v);
      });
      var err = f.querySelector(".err"), after = f.querySelector(".after");
      if (!ok) { if (err) err.hidden = false; return; }
      if (err) err.hidden = true;
      lines.push("", "— nibrasfutureksa.com");
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (x) {} } else { location.href = url; }
      if (after) after.hidden = false;
    });
    Array.prototype.forEach.call(f.querySelectorAll("[required]"), function (el) {
      el.addEventListener("input", function () { el.classList.remove("bad"); });
    });
  });

  /* ---------- before / after gallery ---------- */
  // Photos go in /assets/gallery/ named 01-before.jpg, 01-after.jpg ... 12-before.jpg, 12-after.jpg
  var slots = document.querySelectorAll(".ba[data-n]");
  if (slots.length) {
    var pending = slots.length, shown = 0;
    var done = function () {
      pending--;
      if (pending === 0) {
        var empty = document.getElementById("ga-empty");
        if (empty && shown > 0) empty.hidden = true;
      }
    };
    Array.prototype.forEach.call(slots, function (fig) {
      var n = fig.getAttribute("data-n"), left = 2, any = false, got = 0;
      ["before", "after"].forEach(function (side) {
        var img = fig.querySelector("." + side + " img"), test = new Image();
        test.onload = function () { img.src = test.src; any = true; got++; finish(); };
        test.onerror = function () { img.closest(".half").hidden = true; finish(); };
        test.src = "/assets/gallery/" + n + "-" + side + ".jpg";
      });
      function finish() {
        left--;
        if (left === 0) {
          if (any) { if (got === 1) fig.querySelector(".pair").classList.add("single"); fig.hidden = false; shown++; }
          done();
        }
      }
    });
  }
})();
