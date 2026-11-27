// Small, optional conveniences. The site reads fully without this file.
(function () {
  // Design choice: kept in this browser only.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-use-design]');
    if (!b) return;
    try { localStorage.setItem('design', b.getAttribute('data-use-design')); } catch (err) {}
    location.href = '/';
  });
  // Timeline filters.
  var tl = document.getElementById('timeline');
  if (!tl) return;
  var era = document.getElementById('f-era'), th = document.getElementById('f-thread'), ty = document.getElementById('f-type'), q = document.getElementById('f-q'), count = document.getElementById('f-count');
  var facts = Array.prototype.slice.call(tl.querySelectorAll('.fact'));
  var p = new URLSearchParams(location.search);
  if (p.get('era')) era.value = p.get('era');
  if (p.get('thread')) th.value = p.get('thread');
  if (p.get('source')) ty.value = p.get('source');
  if (p.get('q')) q.value = p.get('q');
  function apply() {
    var n = 0, words = q.value.trim().toLowerCase();
    facts.forEach(function (f) {
      var ok = (!era.value || f.dataset.era === era.value) &&
        (!th.value || (' ' + f.dataset.threads + ' ').indexOf(' ' + th.value + ' ') >= 0) &&
        (!ty.value || f.dataset.type === ty.value) &&
        (!words || f.textContent.toLowerCase().indexOf(words) >= 0);
      f.parentNode.hidden = !ok; if (ok) n++;
    });
    Array.prototype.forEach.call(tl.querySelectorAll('h2'), function (h) {
      var el = h.nextElementSibling, any = false;
      while (el && el.tagName !== 'H2') { if (!el.hidden) any = true; el = el.nextElementSibling; }
      h.hidden = !any;
    });
    count.textContent = n + ' of ' + facts.length + ' facts';
  }
  [era, th, ty].forEach(function (el) { el.addEventListener('change', apply); });
  q.addEventListener('input', apply);
  apply();
})();
