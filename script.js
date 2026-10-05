// KiToa landing page
// Plain, dependency-free behaviour: screenshot tabs,
// process stepper, latest GitHub release, copy-email button.

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Accessible tabs (screenshots + process stepper) ──────────────
  function tabs(listSelector, onSelect) {
    var list = document.querySelector(listSelector);
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function select(i, focus) {
      items.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) onSelect(panel, on);
      });
      if (focus) items[i].focus();
    }

    items.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % items.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = items.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
  }

  tabs('.tabs', function (panel, on) {
    panel.classList.toggle('is-active', on);
    panel.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) panel.removeAttribute('loading');
  });
  tabs('.steps', function (panel, on) { panel.hidden = !on; });

  // ── Latest GitHub release ────────────────────────────────────────
  // Points the download button at the newest release's installer and shows
  // its version. If the request fails (rate limit, offline, private repo)
  // the button keeps its fallback link to the releases page.
  (function release() {
    var REPO = 'QD-Solution/KiToa';
    var btn = document.getElementById('download-btn');
    var meta = document.getElementById('download-meta');
    if (!btn || !meta) return;

    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (rel) {
        var assets = rel.assets || [];
        var installer = assets.find(function (a) { return /\.(exe|msi)$/i.test(a.name); }) || assets[0];
        btn.href = installer ? installer.browser_download_url : rel.html_url;

        var parts = ['Phiên bản ' + rel.tag_name];
        if (rel.published_at) parts.push(new Date(rel.published_at).toLocaleDateString('vi-VN'));
        if (installer) parts.push((installer.size / 1048576).toFixed(1) + ' MB');
        meta.textContent = parts.join(', ') + '. Windows 10/11, không cần Internet để sử dụng.';
      })
      .catch(function () { /* keep fallback link and text */ });
  })();

  // ── Contact: copy the support address ────────────────────────────
  (function contact() {
    var btn = document.getElementById('copy-mail');
    var note = document.getElementById('copy-note');
    var link = document.querySelector('.mail-address');
    if (!btn || !note || !link) return;
    var address = link.textContent.trim();

    btn.addEventListener('click', function () {
      var done = function () { note.textContent = 'Đã sao chép ' + address; };
      var fail = function () { note.textContent = 'Không sao chép được, hãy chọn địa chỉ ở trên và sao chép thủ công.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, fail);
      } else {
        fail();
      }
    });
  })();
})();
