// Apply the saved preference before styles render, including when storage is unavailable.
(function () {
  let theme = 'dark';
  try { if (localStorage.getItem('portfolio-theme') === 'light') theme = 'light'; } catch {}
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f5f8fa' : '#080d10';
})();
