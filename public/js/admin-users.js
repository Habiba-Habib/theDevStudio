document.addEventListener('DOMContentLoaded', () => {

  const searchInput = document.getElementById('umSearch');
  const showing     = document.getElementById('umShowing');
  const noResults   = document.getElementById('umNoResults');
  const rows        = document.querySelectorAll('.row');

  //  Dropdown 
  const dropdown = document.getElementById('umDropdown');
  const trigger  = document.getElementById('umDropdownTrigger');
  const label    = document.getElementById('umDropdownLabel');
  const options  = document.querySelectorAll('.dropdown-option');

  let activeRole = 'all';

  trigger.addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      label.textContent = opt.textContent;
      activeRole = opt.dataset.value;
      dropdown.classList.remove('open');
      filterUsers();
    });
  });

  // Filter 
  function filterUsers() {
    const query = searchInput.value.trim().toLowerCase();
    let count = 0;

    rows.forEach(row => {
      const name  = row.dataset.name.toLowerCase();
      const email = row.dataset.email.toLowerCase();
      const role  = row.dataset.role;

      const matchesSearch = query === '' || name.includes(query) || email.includes(query);
      const matchesRole   = activeRole === 'all' || role === activeRole;

      if (matchesSearch && matchesRole) {
        row.classList.remove('hidden');
        count++;
      } else {
        row.classList.add('hidden');
      }
    });

    showing.textContent = `Showing ${count} user${count !== 1 ? 's' : ''}`;
    noResults.classList.toggle('hidden', count > 0);
  }

  searchInput.addEventListener('input', filterUsers);
  filterUsers();

});