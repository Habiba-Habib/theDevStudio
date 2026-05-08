const challengeData = [
  {
    id: 1,
    title: "Two Sum Problem",
    desc:  "Given an array of integers, return indices of two numbers that add up to a target.",
    difficulty: "easy",
    category: "algorithms",
    points: 50
  },
  {
     id: 2,
    title: "Build a REST API",
    desc:  "Create a RESTful API with CRUD operations using Node.js and Express.",
    difficulty: "medium",
    category: "backend",
    points: 150
  },
  {
     id: 3,
    title: "Implement Binary Search Tree",
    desc:  "Implement a binary search tree with insert, delete, and search operations.",
    difficulty: "hard",
    category: "data structures",
    points: 300
  },
  {
    id: 4,
    title: "CSS Grid Layout",
    desc:  "Create a responsive dashboard layout using CSS Grid.",
    difficulty: "easy",
    category: "frontend",
    points: 75
  },
  {
   id: 5,
    title: "React Component Lifecycle",
    desc:  "Build a React component demonstrating all lifecycle methods and hooks.",
    difficulty: "medium",
    category: "frontend",
    points: 125
  },
  {
    id: 6,
    title: "Dynamic Programming: Knapsack",
    desc:  "Solve the 0/1 knapsack problem using dynamic programming.",
    difficulty: "hard",
    category: "algorithms",
    points: 350
  }
];

const grid        = document.getElementById('challenges-grid');
const countLabel  = document.getElementById('results-count');
let activeFilters = { difficulty: 'all', category: 'all' };

function capFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function render() {
  const filtered = challengeData.filter(item => {
    const dMatch = activeFilters.difficulty === 'all' || item.difficulty === activeFilters.difficulty;
    const cMatch = activeFilters.category   === 'all' || item.category   === activeFilters.category;
    return dMatch && cMatch;
  });

  countLabel.textContent = `Showing ${filtered.length} challenge${filtered.length !== 1 ? 's' : ''}`;

  grid.innerHTML = filtered.map(item => `
    <div class="challenge-card ${item.difficulty}">
      <div class="card-top">
        <span class="badge badge-${item.difficulty}">${capFirst(item.difficulty)}</span>
        <span class="card-pts"><i class="fa-solid fa-bolt"></i> ${item.points} pts</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <div class="card-bottom">
        <span class="card-category">${item.category}</span>
        <button class="btn-view" onclick="window.location.href='/public/pages/public/challenge-description.html?id=${item.id}'">View Challenge</button>
      </div>
    </div>
  `).join('');
}

// Filter button clicks
document.querySelectorAll('.filter-btns').forEach(group => {
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      // remove active from siblings only
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // update filter state
      activeFilters[group.dataset.type] = btn.dataset.value;
      render();
    });
  });
});

// Initial render
render();