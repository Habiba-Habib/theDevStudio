let challenges       = getChallenges();
let currentFilter    = 'all';
let currentSearch    = '';
let deleteTargetId   = null;
let deletedChallenge = null;
let undoTimeout      = null;

const tableBody    = document.getElementById('tableBody');
const resultsCount = document.getElementById('resultsCount');
const searchInput  = document.getElementById('searchInput');
const filterTabs   = document.querySelectorAll('.filter-tab');
const modalOverlay = document.getElementById('modalOverlay');
const modalCancel  = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

function getRecentlyDeleted() {
    const stored = localStorage.getItem('recentlyDeleted');
    return stored ? JSON.parse(stored) : [];
}

function saveRecentlyDeleted(data) {
    localStorage.setItem('recentlyDeleted', JSON.stringify(data));
}

function addToRecentlyDeleted(challenge) {
    const recent = getRecentlyDeleted();
    challenge.deletedAt = new Date().toISOString();
    recent.unshift(challenge);
    if (recent.length > 10) recent.pop();
    saveRecentlyDeleted(recent);
}

function restoreFromRecentlyDeleted(id) {
    const recent = getRecentlyDeleted();
    const challenge = recent.find(c => c.id === id);
    if (!challenge) return;

    delete challenge.deletedAt;

    const current = getChallenges();

    const idExists = current.find(c => c.id === challenge.id);
    if (idExists) {
        challenge.id = Math.max(...current.map(c => c.id)) + 1;
    }

    current.push(challenge);
    current.sort((a, b) => a.id - b.id);
    localStorage.setItem('challenges', JSON.stringify(current));

    const updatedRecent = recent.filter(c => c.id !== id && c.deletedAt !== challenge.deletedAt);
    saveRecentlyDeleted(updatedRecent);

    challenges = getChallenges();
    renderTable();
    renderRecentlyDeleted();
    showToast('Challenge restored successfully!');
}

function permanentlyDelete(id) {
    const recent = getRecentlyDeleted().filter(c => c.id !== id);
    saveRecentlyDeleted(recent);
    renderRecentlyDeleted();
    showToast('Challenge permanently deleted');
}

function renderRecentlyDeleted() {
    const recent  = getRecentlyDeleted();
    const section = document.getElementById('recentlyDeletedSection');
    const tbody   = document.getElementById('recentlyDeletedBody');

    if (recent.length === 0) {
        section.style.display = 'none';
        return;
    }

    
    const filtered = recent.filter(c => {
        const matchesDifficulty = currentFilter === 'all' ||
            c.difficulty.toLowerCase() === currentFilter;
        const matchesSearch = c.title.toLowerCase().includes(currentSearch) ||
                              c.desc.toLowerCase().includes(currentSearch) ||
                              c.category.toLowerCase().includes(currentSearch);
        return matchesDifficulty && matchesSearch;
    });

    section.style.display = 'block';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-trash"></i>
                        <p>No deleted challenges match your filter</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

  
    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td>
                <div class="challenge-name">${c.title}</div>
                <div class="challenge-desc">${c.desc}</div>
            </td>
            <td><span class="badge badge-category">${c.category}</span></td>
            <td><span class="badge badge-${c.difficulty.toLowerCase()}">${c.difficulty}</span></td>
            <td><span class="points-value">${c.points}</span></td>
            <td class="deleted-at" data-time="${c.deletedAt}">${timeAgo(c.deletedAt)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn restore-btn" title="Restore" onclick="restoreFromRecentlyDeleted(${c.id})">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                    <button class="action-btn delete" title="Permanently Delete" onclick="confirmPermanentDelete(${c.id})">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}
let permanentDeleteId = null;

function confirmPermanentDelete(id) {
    permanentDeleteId = id;
    document.querySelector('.modal-title').textContent = 'Permanently Delete';
    document.querySelector('.modal-desc').textContent  = 'This will permanently remove the challenge and cannot be undone.';
    modalOverlay.classList.add('show');
}

function renderTable() {
    const filtered = challenges.filter(c => {
        const matchesDifficulty = currentFilter === 'all' ||
            c.difficulty.toLowerCase() === currentFilter;
        const matchesSearch = c.title.toLowerCase().includes(currentSearch) ||
                              c.desc.toLowerCase().includes(currentSearch) ||
                              c.category.toLowerCase().includes(currentSearch);
        return matchesDifficulty && matchesSearch;
    });

    resultsCount.textContent = `Showing ${filtered.length} challenge${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-code"></i>
                        <p>No challenges found</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(c => `
        <tr>
            <td>
                <div class="challenge-name">${c.title}</div>
                <div class="challenge-desc">${c.desc}</div>
            </td>
            <td><span class="badge badge-category">${c.category}</span></td>
            <td><span class="badge badge-${c.difficulty.toLowerCase()}">${c.difficulty}</span></td>
            <td><span class="points-value">${c.points}</span></td>
            <td>${(c.submissions || 0).toLocaleString()}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="View" onclick="viewChallenge(${c.id})">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Edit" onclick="editChallenge(${c.id})">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="confirmDelete(${c.id})">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderTable();
    renderRecentlyDeleted();
});

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderTable();
        renderRecentlyDeleted();
    });
});

function viewChallenge(id) {
    window.location.href = `/public/pages/public/challenge-description.html?id=${id}`;
}

function editChallenge(id) {
    window.location.href = `/public/pages/admin/create-challenge.html?id=${id}`;
}

function confirmDelete(id) {
    permanentDeleteId = null;
    deleteTargetId = id;
    document.querySelector('.modal-title').textContent = 'Delete Challenge';
    document.querySelector('.modal-desc').textContent  = 'Are you sure you want to delete this challenge? This action cannot be undone.';
    modalOverlay.classList.add('show');
}

modalCancel.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
    deleteTargetId    = null;
    permanentDeleteId = null;
});

modalConfirm.addEventListener('click', () => {
    if (permanentDeleteId !== null) {
        permanentlyDelete(permanentDeleteId);
        modalOverlay.classList.remove('show');
        permanentDeleteId = null;
        return;
    }

    if (deleteTargetId !== null) {
        deletedChallenge = challenges.find(c => c.id === deleteTargetId);
        addToRecentlyDeleted({...deletedChallenge});
        deleteChallenge(deleteTargetId);
        challenges = getChallenges();
        renderTable();
        renderRecentlyDeleted();
        modalOverlay.classList.remove('show');
        deleteTargetId = null;
        showUndoToast('Challenge deleted');
    }
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('show');
        deleteTargetId    = null;
        permanentDeleteId = null;
    }
});

function showUndoToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    if (undoTimeout) clearTimeout(undoTimeout);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-trash" style="color:#60A3A6; font-size:16px;"></i>
        <span>${message}</span>
        <button id="undoBtn" style="
            margin-left: 12px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: #F0FE72;
            font-size: 13px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
        ">Undo</button>
    `;
    toast.style.cssText = `
        position: fixed; bottom: 32px; right: 32px;
        background: #1A203A; border: 1px solid rgba(96,163,166,0.4);
        border-radius: 10px; padding: 14px 20px;
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; color: #FFFFFC; font-family: 'Inter', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        transform: translateY(80px); opacity: 0;
        transition: all 0.35s ease; z-index: 9999;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
    });

    document.getElementById('undoBtn').addEventListener('click', () => {
        if (deletedChallenge) {
            // remove from recently deleted
            const recent = getRecentlyDeleted().filter(c => c.id !== deletedChallenge.id);
            saveRecentlyDeleted(recent);

            // restore to challenges
            const current = getChallenges();
            current.push({...deletedChallenge});
            current.sort((a, b) => a.id - b.id);
            localStorage.setItem('challenges', JSON.stringify(current));

            challenges = getChallenges();
            renderTable();
            renderRecentlyDeleted();
            deletedChallenge = null;
            clearTimeout(undoTimeout);
            hideToast(toast);
            showToast('Challenge restored!');
        }
    });

    undoTimeout = setTimeout(() => {
        deletedChallenge = null;
        hideToast(toast);
    }, 5000);
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    toast.style.cssText = `
        position: fixed; bottom: 32px; right: 32px;
        background: #1A203A; border: 1px solid rgba(96,163,166,0.4);
        border-radius: 10px; padding: 14px 20px;
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; color: #FFFFFC; font-family: 'Inter', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        transform: translateY(80px); opacity: 0;
        transition: all 0.35s ease; z-index: 9999;
    `;
    toast.querySelector('i').style.color = '#60A3A6';
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
    });

    setTimeout(() => hideToast(toast), 3000);
}

function hideToast(toast) {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
}

function timeAgo(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

renderTable();
renderRecentlyDeleted();
setInterval(() => {
    renderRecentlyDeleted();
}, 60000);