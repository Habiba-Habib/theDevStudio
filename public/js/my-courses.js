const courses = [
  {
    title: "React Development Bootcamp",
    instructor: "Dr. Sarah Miller",
    progress: 65,
    lessons: "29/45",
    lastAccessed: "2 hours ago",
    status: "ongoing",
    link: "dashboard.html",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=900&auto=format&fit=crop"
  },
  {
    title: "Python for Data Science",
    instructor: "Prof. John Smith",
    progress: 45,
    lessons: "17/38",
    lastAccessed: "1 day ago",
    status: "ongoing",
    link: "dashboard.html",
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=900&auto=format&fit=crop"
  },
  {
    title: "Advanced JavaScript Concepts",
    instructor: "Dr. Emily Chen",
    progress: 85,
    lessons: "26/30",
    lastAccessed: "5 hours ago",
    status: "ongoing",
    link: "dashboard.html",
    image:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=900&auto=format&fit=crop"
  },
  {
    title: "Full Stack Development",
    instructor: "Prof. David Martinez",
    progress: 100,
    lessons: "50/50",
    lastAccessed: "1 week ago",
    status: "completed",
    link: "leaderboard.html",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=900&auto=format&fit=crop"
  }
];

const coursesContainer = document.getElementById("coursesContainer");
const tabs = document.querySelectorAll(".tab");

function renderCourses(filter) {
  coursesContainer.innerHTML = "";

  if (filter === "completed") {
    coursesContainer.classList.add("completed-view");
  } else {
    coursesContainer.classList.remove("completed-view");
  }

  const filteredCourses = courses.filter(function (course) {
    return course.status === filter;
  });

  filteredCourses.forEach(function (course) {
    const card = document.createElement("div");
    card.classList.add("course-card");

    card.innerHTML = `
      <div class="course-image">
        <img src="${course.image}" alt="${course.title}">

        ${
          course.status === "completed"
            ? `<div class="completed-badge">
                <i class="fa-solid fa-check"></i>
                Completed
              </div>`
            : ""
        }

        <div class="progress-track">
          <div class="progress-fill" style="width: ${course.progress}%"></div>
        </div>
      </div>

      <div class="course-content">
        <h2>${course.title}</h2>

        <p class="instructor">By ${course.instructor}</p>

        <div class="info-row">
          <span>Progress</span>
          <span class="percent">${course.progress}%</span>
        </div>

        <div class="info-row">
          <span>Lessons</span>
          <span>${course.lessons}</span>
        </div>

        <p class="last-accessed">
          <span class="clock">
            <i class="fa-regular fa-clock"></i>
          </span>
          Last accessed: ${course.lastAccessed}
        </p>

        <button class="continue-btn" type="button">
          ${course.status === "completed" ? "Review Course" : "Continue Learning"}
        </button>
      </div>
    `;

    card.addEventListener("click", function () {
      window.location.href = course.link;
    });

    coursesContainer.appendChild(card);
  });
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabs.forEach(function (btn) {
      btn.classList.remove("active");
    });

    tab.classList.add("active");

    const filter = tab.getAttribute("data-filter");
    renderCourses(filter);
  });
});

renderCourses("ongoing");