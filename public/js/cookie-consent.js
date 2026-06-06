(function () {
  const STORAGE_KEY = 'tds_cookie_consent';
  const banner      = document.getElementById('cookieBanner');
  const acceptBtn   = document.getElementById('cookieAccept');
  const declineBtn  = document.getElementById('cookieDecline');

  if (!banner) return;

  // Already answered — stay hidden
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Show after a short delay so the page settles first
  setTimeout(() => {
    banner.classList.remove('hidden');
    requestAnimationFrame(() => banner.classList.add('show'));
  }, 800);

  function dismiss(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    banner.classList.remove('show');
    setTimeout(() => banner.classList.add('hidden'), 400);
  }

  acceptBtn.addEventListener('click',  () => dismiss('accepted'));
  declineBtn.addEventListener('click', () => dismiss('declined'));
})();
