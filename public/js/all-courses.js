document.addEventListener('DOMContentLoaded', () => {

  const searchInput    = document.getElementById('searchInput');
  const courseCards    = Array.from(document.querySelectorAll('.course-card'));
  const showingCount   = document.getElementById('showingCount');
  const noResults      = document.getElementById('noResults');
  const paginationWrap = document.getElementById('paginationWrap');
  const pageNumbers    = document.getElementById('pageNumbers');
  const pagePrev       = document.getElementById('pagePrev');
  const pageNext       = document.getElementById('pageNext');

  if (!searchInput || courseCards.length === 0) return;

  const CARDS_PER_PAGE = 9;

  const categoryBtns = document.querySelectorAll('.filter-btn-category');
  const levelBtns    = document.querySelectorAll('.filter-btn-level');

  let activeCategory = 'all';
  let activeLevel    = 'all';
  let searchQuery    = '';
  let currentPage    = 1;
  let filteredCards  = [];

  // ── 1. FILTER ────────────────────────────────────────────────
  function applyFilters() {
    filteredCards = courseCards.filter(card => {
      const cat    = card.dataset.category;
      const lvl    = card.dataset.level;
      const title  = card.querySelector('.card-title').textContent.toLowerCase();
      const desc   = card.querySelector('.card-desc').textContent.toLowerCase();
      const author = card.querySelector('.card-author').textContent.toLowerCase();

      const matchCategory = activeCategory === 'all' || cat === activeCategory;
      const matchLevel    = activeLevel    === 'all' || lvl === activeLevel;
      const matchSearch   = searchQuery   === ''     ||
                            title.includes(searchQuery)  ||
                            desc.includes(searchQuery)   ||
                            author.includes(searchQuery) ||
                            cat.toLowerCase().includes(searchQuery);

      return matchCategory && matchLevel && matchSearch;
    });

    currentPage = 1;
    renderPage();
  }

  // ── 2. RENDER CURRENT PAGE ───────────────────────────────────
  function renderPage() {
    const total      = filteredCards.length;
    const totalPages = Math.ceil(total / CARDS_PER_PAGE);
    const start      = (currentPage - 1) * CARDS_PER_PAGE;
    const end        = start + CARDS_PER_PAGE;

    // Hide all, then show only current page slice
    courseCards.forEach(c => c.classList.add('hidden'));
    filteredCards.slice(start, end).forEach(c => c.classList.remove('hidden'));

    // Count label
    const text = window.coursePageText || {};
const template = total === 1
  ? text.showingCountSingle || "Showing {{count}} course"
  : text.showingCount || "Showing {{count}} courses";

showingCount.textContent = template.replace("{{count}}", total);

    // No-results message
    noResults.classList.toggle('hidden', total > 0);

    // Pagination controls
    if (totalPages <= 1) {
      paginationWrap.classList.add('hidden');
      return;
    }
    paginationWrap.classList.remove('hidden');

    pagePrev.disabled = currentPage === 1;
    pageNext.disabled = currentPage === totalPages;

    // Build page number buttons
    pageNumbers.innerHTML = '';
    const pages = getPageRange(currentPage, totalPages);
    pages.forEach(p => {
      if (p === '…') {
        const dot = document.createElement('span');
        dot.className = 'page-dot';
        dot.textContent = '…';
        pageNumbers.appendChild(dot);
      } else {
        const btn = document.createElement('button');
        btn.className = 'page-num' + (p === currentPage ? ' active' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => {
          currentPage = p;
          renderPage();
          scrollToGrid();
        });
        pageNumbers.appendChild(btn);
      }
    });
  }

  // ── 3. PAGE RANGE (with ellipsis) ────────────────────────────
  function getPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
    return [1, '…', current-1, current, current+1, '…', total];
  }

  function scrollToGrid() {
    document.querySelector('.course-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── 4. EVENT LISTENERS ───────────────────────────────────────
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLevel = btn.dataset.level;
      applyFilters();
    });
  });

  pagePrev.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderPage(); scrollToGrid(); }
  });

  pageNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
    if (currentPage < totalPages) { currentPage++; renderPage(); scrollToGrid(); }
  });

  // ── 5. PRE-SELECT CATEGORY FROM URL PARAM (?category=Web Development) ──
  const urlParams   = new URLSearchParams(window.location.search);
  const preCategory = urlParams.get('category');
  if (preCategory) {
    const matchBtn = [...categoryBtns].find(b => b.dataset.category === preCategory);
    if (matchBtn) {
      categoryBtns.forEach(b => b.classList.remove('active'));
      matchBtn.classList.add('active');
      activeCategory = preCategory;
    }
  }

  // ── 6. INITIAL RENDER ────────────────────────────────────────
  applyFilters();
});
