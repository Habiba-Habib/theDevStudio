// Modal functionality
const applicationsData = document.getElementById("applications-data");

const applications = applicationsData
  ? JSON.parse(applicationsData.textContent || "[]")
  : [];
function openModal(appId) {
  const app = applications.find(a => a._id === appId);
  if (!app) return;

  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">Instructor Information</div>
      <div class="instructor-info">
        <img src="${app.avatar}" alt="${app.name}" />
        <div class="instructor-info-details">
          <h3>${app.name}</h3>
          <p><i class="fa-regular fa-envelope"></i> ${app.email}</p>
          <p><i class="fa-solid fa-briefcase"></i> ${app.jobTitle}</p>
        </div>
      </div>
      <div class="bio-label">Bio</div>
      <div class="bio-text">${app.bio || 'No bio provided'}</div>
      <div class="bio-label">Expertise</div>
      <div class="tags-row">
        ${app.expertise.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Experience</div>
      <div class="bio-text">${app.experience}</div>
    </div>

    <div class="modal-section">
  <div class="modal-section-title">Documents</div>
  <div class="docs-grid">
    <div class="doc-card">
      <div class="doc-card-header">
        <i class="fa-solid fa-file-pdf doc-icon"></i>
        <span class="doc-title">CV/Resume</span>
      </div>
      <div class="doc-filename">${app.cvUrl ? 'Document uploaded' : 'Not provided'}</div>
      ${app.cvUrl ? `
        <a href="/admin/download-cv/${app._id}" target="_blank" class="btn-download">
          <i class="fa-solid fa-download"></i> Download CV
        </a>
      ` : ''}
    </div>
   ${(app.certificateUrls && app.certificateUrls.length > 0) 
  ? app.certificateUrls.map((certUrl, index) => `
    <div class="doc-card">
      <div class="doc-card-header">
        <i class="fa-solid fa-certificate doc-cert-icon"></i>
        <span class="doc-title">Certificate ${app.certificateUrls.length > 1 ? (index + 1) : ''}</span>
      </div>
      <div class="doc-filename">Document uploaded</div>
      <a href="/admin/download-certificate/${app._id}?index=${index}" target="_blank" class="btn-download">
        <i class="fa-solid fa-download"></i> Download
      </a>
    </div>
  `).join('')
  : `
    <div class="doc-card">
      <div class="doc-card-header">
        <i class="fa-solid fa-certificate doc-cert-icon"></i>
        <span class="doc-title">Certificate</span>
      </div>
      <div class="doc-filename">Not provided</div>
    </div>
  `
}

  </div>
</div>


    <div class="modal-section professional-links">
      <div class="link-label">Professional Links</div>
      ${app.linkedinUrl ? `<a href="${app.linkedinUrl}" target="_blank" class="linkedin-link">
        <i class="fa-brands fa-linkedin"></i> LinkedIn Profile
      </a>` : ''}
      ${app.portfolioUrl ? `<a href="${app.portfolioUrl}" target="_blank" class="linkedin-link">
        <i class="fa-solid fa-globe"></i> Portfolio
      </a>` : ''}
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Application Timeline</div>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-icon date-icon"><i class="fa-regular fa-calendar"></i></div>
          <span>Submitted: ${new Date(app.applicationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"><i class="fa-solid fa-clock"></i></div>
          <span>Status: ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
        </div>
      </div>
    </div>

    ${app.status === 'pending' ? `
    <div class="modal-section">
      <div class="modal-section-title">Admin Decision</div>
      <div class="decision-label">Add notes (optional)</div>
      <textarea class="notes-input" id="admin-notes" placeholder="Enter your decision notes here..."></textarea>
      <div class="decision-buttons">
        <button class="btn-approve" onclick="approveApplication('${app._id}')">
          <i class="fa-solid fa-check"></i> Approve
        </button>
              <button class="btn-reject" onclick="openRejectModal('${app._id}')">
          <i class="fa-solid fa-xmark"></i> Reject
        </button>
      </div>
    </div>
    ` : ''}
  `;

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(event) {
  if (event.target.id === 'modal-overlay') {
    closeModal();
  }
}

// Search functionality
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  filterApplications(searchTerm, getCurrentFilter());
});

// Status filter functionality
const selectSelected = document.getElementById('select-selected');
const selectItems = document.getElementById('select-items');
const selectArrow = document.querySelector('.select-arrow');

selectSelected.addEventListener('click', function() {
  selectItems.classList.toggle('hidden');
  selectArrow.classList.toggle('open');
});

selectItems.querySelectorAll('.select-item').forEach(item => {
  item.addEventListener('click', function() {
    const value = this.dataset.value;
    const text = this.textContent.trim();
    
    // Update selected text
    selectSelected.innerHTML = `${text} <i class="fa-solid fa-chevron-down select-arrow"></i>`;
    
    // Update active state
    selectItems.querySelectorAll('.select-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('i')?.remove();
    });
    this.classList.add('active');
    if (!this.querySelector('i')) {
      this.innerHTML += ' <i class="fa-solid fa-check"></i>';
    }
    
    // Close dropdown
    selectItems.classList.add('hidden');
    selectArrow.classList.remove('open');
    
    // Filter applications
    filterApplications(searchInput.value.toLowerCase(), value);
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.custom-select')) {
    selectItems.classList.add('hidden');
    selectArrow.classList.remove('open');
  }
});

function getCurrentFilter() {
  const activeItem = selectItems.querySelector('.select-item.active');
  return activeItem ? activeItem.dataset.value : 'all';
}

function filterApplications(searchTerm, statusFilter) {
  const rows = document.querySelectorAll('.app-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const status = row.dataset.status;
    const name = row.dataset.name;
    const email = row.dataset.email;
    
    const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    if (matchesSearch && matchesStatus) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  // Update count
  const countElement = document.getElementById('showing-count');
  countElement.textContent = `Showing ${visibleCount} application${visibleCount !== 1 ? 's' : ''}`;
}

// ── Toast helper ──────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('admin-toast');
  const icon  = document.getElementById('admin-toast-icon');
  const text  = document.getElementById('admin-toast-msg');
  toast.className = `admin-toast ${type}`;
  icon.className  = type === 'success'
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-circle-xmark';
  text.textContent = msg;
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Approve/Reject functionality
async function approveApplication(userId) {
  try {
    const response = await fetch(`/admin/instructor-applications/${userId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      closeModal();
      showToast('Application approved successfully!', 'success');
      setTimeout(() => location.reload(), 1200);
    } else {
      showToast('Failed to approve application', 'error');
    }
  } catch (error) {
    console.error('Error approving application:', error);
    showToast('Error approving application', 'error');
  }
}

async function rejectApplication(userId) {
  try {
    const response = await fetch(`/admin/instructor-applications/${userId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      closeModal();
      showToast('Application rejected successfully!', 'success');
      setTimeout(() => location.reload(), 1200);
    } else {
      showToast('Failed to reject application', 'error');
    }
  } catch (error) {
    console.error('Error rejecting application:', error);
    showToast('Error rejecting application', 'error');
  }
}
let rejectUserId = null;

function openRejectModal(userId) {
  rejectUserId = userId;
  document.getElementById("rejectModal").classList.remove("hidden");
}

function closeRejectModal() {
  document.getElementById("rejectModal").classList.add("hidden");
  document.getElementById("rejectReason").value = "";
  rejectUserId = null;
}

function confirmReject() {
  const reason = document.getElementById('rejectReason').value;
  if (!reason.trim()) {
    alert('Please provide a reason for rejection');
    return;
  }
  
  fetch(`/admin/instructor-applications/${rejectUserId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      closeRejectModal();
      location.reload();
    }
  });
}