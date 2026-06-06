const grid           = document.getElementById('challenges-grid');
const countLabel     = document.getElementById('results-count');
const paginationWrap = document.getElementById('paginationWrap');
const pageNumbers    = document.getElementById('pageNumbers');
const pagePrev       = document.getElementById('pagePrev');
const pageNext       = document.getElementById('pageNext');

const CARDS_PER_PAGE = 9;
let activeFilters    = { difficulty: 'all', category: 'all' };
let currentPage      = 1;
let filteredCards    = [];

// ── 1. FILTER ────────────────────────────────────────────────
function applyFilters() {
  const allCards = Array.from(grid.querySelectorAll('.challenge-card'));

  filteredCards = allCards.filter(card => {
    const dMatch = activeFilters.difficulty === 'all' || card.dataset.difficulty === activeFilters.difficulty;
    const cMatch = activeFilters.category   === 'all' || card.dataset.category   === activeFilters.category;
    return dMatch && cMatch;
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

  // Hide all, show current page slice
  Array.from(grid.querySelectorAll('.challenge-card')).forEach(c => c.style.display = 'none');
  filteredCards.slice(start, end).forEach(c => c.style.display = '');

  countLabel.textContent = `Showing ${total} challenge${total !== 1 ? 's' : ''}`;

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
  getPageRange(currentPage, totalPages).forEach(p => {
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
  if (current <= 4)          return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3)  return [1, '…', total-4, total-3, total-2, total-1, total];
  return [1, '…', current-1, current, current+1, '…', total];
}

function scrollToGrid() {
  grid?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 4. FILTER BUTTONS ────────────────────────────────────────
document.querySelectorAll('.filter-btns').forEach(group => {
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters[group.dataset.type] = btn.dataset.value;
      applyFilters();
    });
  });
});

// ── 5. PREV / NEXT ───────────────────────────────────────────
pagePrev.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderPage(); scrollToGrid(); }
});
pageNext.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  if (currentPage < totalPages) { currentPage++; renderPage(); scrollToGrid(); }
});

// ── 6. INITIAL RENDER ────────────────────────────────────────
applyFilters();
