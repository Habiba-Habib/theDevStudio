

const coursesContainer = document.getElementById("coursesContainer");
const tabs = document.querySelectorAll(".tab");
const courseCards = document.querySelectorAll(".course-card");

function filterCourses(filter) {
  if (!coursesContainer) return;

  if (filter === "completed") {
    coursesContainer.classList.add("completed-view");
  } else {
    coursesContainer.classList.remove("completed-view");
  }

  courseCards.forEach(function (card) {
    const status = card.getAttribute("data-status");

    if (status === filter) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabs.forEach(function (btn) {
      btn.classList.remove("active");
    });

    tab.classList.add("active");

    const filter = tab.getAttribute("data-filter");
    filterCourses(filter);
  });
});

filterCourses("ongoing");

document.querySelectorAll(".progress-fill[data-progress]").forEach(function (bar) {
  const progress = Number(bar.getAttribute("data-progress")) || 0;
  bar.style.width = progress + "%";
});