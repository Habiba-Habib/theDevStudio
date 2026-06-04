document.addEventListener('DOMContentLoaded', () => {

  const searchInput = document.getElementById('umSearch');
  const showing     = document.getElementById('umShowing');
  const noResults   = document.getElementById('umNoResults');
 const rows        = document.querySelectorAll('#umTableBody > .row');

  //  Dropdown 
  const dropdown = document.getElementById('umDropdown');
  const trigger  = document.getElementById('umDropdownTrigger');
  const label    = document.getElementById('umDropdownLabel');
  const options  = document.querySelectorAll('.dropdown-option');
  const blockModal = document.getElementById('blockInstructorModal');
const blockText = document.getElementById('blockInstructorText');
const cancelBlock = document.getElementById('cancelBlockInstructor');
const confirmBlock = document.getElementById('confirmBlockInstructor');

  let activeRole = 'all';
  let selectedBlockId = null;
let selectedBlockRow = null;

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
  let selectedUserId = null;
let selectedRow = null;

const removeModal = document.getElementById('removeUserModal');
const removeText = document.getElementById('removeUserText');
const cancelRemove = document.getElementById('cancelRemoveUser');
const confirmRemove = document.getElementById('confirmRemoveUser');

document.querySelectorAll('.btn-remove-user').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedRow = btn.closest('.row');
    selectedUserId = selectedRow.dataset.userId;
    const userName = selectedRow.dataset.name || 'this user';

    removeText.textContent = `Are you sure you want to remove ${userName}? This action cannot be undone.`;
    removeModal.classList.remove('hidden');
  });
});

cancelRemove.addEventListener('click', () => {
  removeModal.classList.add('hidden');
  selectedUserId = null;
  selectedRow = null;
});

confirmRemove.addEventListener('click', async () => {
  if (!selectedUserId) return;

  const res = await fetch(`/admin/users/delete/${selectedUserId}`, {
    method: 'POST'
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed to remove user.');
    return;
  }

  selectedRow.remove();
  removeModal.classList.add('hidden');
  selectedUserId = null;
  selectedRow = null;
});
document.querySelectorAll('.btn-block-instructor').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedBlockRow = btn.closest('.row');
    selectedBlockId = selectedBlockRow.dataset.userId;
    const userName = selectedBlockRow.dataset.name || 'this instructor';

    blockText.textContent = `Are you sure you want to block ${userName}? Their courses will be archived and students will be notified.`;
    blockModal.classList.remove('hidden');
  });
});

cancelBlock.addEventListener('click', () => {
  blockModal.classList.add('hidden');
  selectedBlockId = null;
  selectedBlockRow = null;
});

confirmBlock.addEventListener('click', async () => {
  if (!selectedBlockId) return;

  const res = await fetch(`/admin/users/${selectedBlockId}/block`, {
    method: 'POST'
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed to block instructor.');
    return;
  }

  window.location.reload();
});
let selectedUnblockId = null;

const unblockModal = document.getElementById('unblockInstructorModal');
const unblockText = document.getElementById('unblockInstructorText');
const cancelUnblock = document.getElementById('cancelUnblockInstructor');
const confirmUnblock = document.getElementById('confirmUnblockInstructor');

document.querySelectorAll('.btn-unblock-instructor').forEach((btn) => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.row');
    selectedUnblockId = row.dataset.userId;
    const userName = row.dataset.name || 'this instructor';

    unblockText.textContent = `Are you sure you want to unblock ${userName}?`;
    unblockModal.classList.remove('hidden');
  });
});

cancelUnblock.addEventListener('click', () => {
  unblockModal.classList.add('hidden');
  selectedUnblockId = null;
});

confirmUnblock.addEventListener('click', async () => {
  if (!selectedUnblockId) return;

  const res = await fetch(`/admin/users/${selectedUnblockId}/unblock`, {
    method: 'POST'
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed to unblock instructor.');
    return;
  }
  window.location.reload();

});
});