const grid       = document.getElementById('challenges-grid');
const countLabel = document.getElementById('results-count');

let activeFilters = { difficulty: 'all', category: 'all' };

function applyFilters() {
  const cards = grid.querySelectorAll('.challenge-card');
  let visible = 0;

  cards.forEach(card => {
    const dMatch = activeFilters.difficulty === 'all' || card.dataset.difficulty === activeFilters.difficulty;
    const cMatch = activeFilters.category   === 'all' || card.dataset.category   === activeFilters.category;

    if (dMatch && cMatch) {
      card.style.display = '';
      visible++;
    } else {
      card.style.display = 'none';
    }
  });

  countLabel.textContent = `Showing ${visible} challenge${visible !== 1 ? 's' : ''}`;
}

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