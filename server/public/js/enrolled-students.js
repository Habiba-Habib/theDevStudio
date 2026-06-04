// Set progress bar widths
document.querySelectorAll('.progress-fill').forEach(bar => {
  const progress = bar.dataset.progress || 0;
  bar.style.width = progress + '%';
});

const searchInput  = document.getElementById('searchInput');
const studentCards = document.querySelectorAll('.student-card');
const resultsCount = document.getElementById('resultsCount');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  let visible = 0;

  studentCards.forEach(card => {
    const name  = card.dataset.name;
    const email = card.dataset.email;

    if (name.includes(query) || email.includes(query)) {
      card.style.display = '';
      visible++;
    } else {
      card.style.display = 'none';
    }
  });

  resultsCount.textContent = `Showing ${visible} student${visible !== 1 ? 's' : ''}`;
});