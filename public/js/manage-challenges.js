let deleteTargetId = null;
let permanentDeleteId = null;

const searchInput = document.getElementById("searchInput");
const filterTabs = document.querySelectorAll(".filter-tab");
const tableBody = document.getElementById("tableBody");
const resultsCount = document.getElementById("resultsCount");

const modalOverlay = document.getElementById("modalOverlay");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

function updateResultsCount() {
  const visibleRows = tableBody.querySelectorAll("tr:not([style*='display: none'])");
  resultsCount.textContent = `Showing ${visibleRows.length} challenge${visibleRows.length !== 1 ? "s" : ""}`;
}

function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const activeFilter = document.querySelector(".filter-tab.active")?.dataset.filter || "all";

  tableBody.querySelectorAll("tr").forEach((row) => {
    const title = row.dataset.title || "";
    const category = row.dataset.category || "";
    const difficulty = row.dataset.difficulty || "";

    const matchesSearch =
      title.includes(searchValue) ||
      category.includes(searchValue);

    const matchesDifficulty =
      activeFilter === "all" ||
      difficulty === activeFilter;

    row.style.display = matchesSearch && matchesDifficulty ? "" : "none";
  });

  updateResultsCount();
}

searchInput.addEventListener("input", applyFilters);

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    applyFilters();
  });
});

function confirmDelete(id) {
  permanentDeleteId = null;
  deleteTargetId = id;

  document.querySelector(".modal-title").textContent = "Delete Challenge";
  document.querySelector(".modal-desc").textContent =
    "Are you sure you want to delete this challenge?";

  modalConfirm.textContent = "Delete";
  modalOverlay.classList.add("show");
}

function confirmPermanentDelete(id) {
  deleteTargetId = null;
  permanentDeleteId = id;

  document.querySelector(".modal-title").textContent = "Permanently Delete";
  document.querySelector(".modal-desc").textContent =
    "This will permanently remove the challenge and cannot be undone.";

  modalConfirm.textContent = "Delete";
  modalOverlay.classList.add("show");
}

async function restoreChallenge(id) {
  const response = await fetch(`/admin/manage-challenges/${id}/restore`, {
    method: "POST"
  });

  if (response.ok) {
    window.location.reload();
  } else {
    alert("Failed to restore challenge.");
  }
}

modalCancel.addEventListener("click", () => {
  modalOverlay.classList.remove("show");
  deleteTargetId = null;
  permanentDeleteId = null;
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.classList.remove("show");
    deleteTargetId = null;
    permanentDeleteId = null;
  }
});

modalConfirm.addEventListener("click", async () => {
  let url = null;

  if (permanentDeleteId) {
    url = `/admin/manage-challenges/${permanentDeleteId}/permanent-delete`;
  } else if (deleteTargetId) {
    url = `/admin/manage-challenges/${deleteTargetId}/delete`;
  }

  if (!url) return;

  const response = await fetch(url, {
    method: "POST"
  });

  if (response.ok) {
    window.location.reload();
  } else {
    alert("Failed to delete challenge.");
  }
});

document.querySelectorAll(".deleted-at").forEach((cell) => {
  const value = cell.dataset.time;
  if (!value) return;

  cell.textContent = timeAgo(value);
});

function timeAgo(dateValue) {
  const diff = Math.floor((Date.now() - new Date(dateValue)) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${Math.floor(diff / 86400)}d ago`;
}