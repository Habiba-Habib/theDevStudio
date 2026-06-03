function openCourseModal(courseId) {
  const course = courses.find(c => c._id === courseId);
  if (!course) return;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "courseModal";

 modal.innerHTML = `
  <div class="modal course-details-modal">
    <div class="modal-header">
      <div>
        <h2>Course Details</h2>
        <p>Review complete course information before approval</p>
      </div>
      <button class="modal-close" onclick="closeCourseModal()">×</button>
    </div>

    <div class="modal-body course-details-scroll">
      <img class="course-details-cover" src="${course.thumbnail || "/images/course1.jpg"}" alt="${course.title || "Course"}">

      <h2 class="course-details-title">${course.title || "Untitled Course"}</h2>
      <p class="course-details-subtitle">${course.shortDescription || "No short description provided."}</p>

      <div class="course-details-meta">
        <div>
          <span>Category</span>
          <strong>${course.category || "N/A"}</strong>
        </div>
        <div>
          <span>Difficulty</span>
          <strong>${course.level || "N/A"}</strong>
        </div>
        <div>
          <span>Price</span>
          <strong>$${course.price || 0}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>${course.duration || "N/A"}</strong>
        </div>
      </div>

     <section class="course-details-card">
  <h3>Course Requirements</h3>

  <h4>Learning Outcomes</h4>
  ${
    course.learningOutcomes && course.learningOutcomes.length
      ? `<ul class="outcomes-list">
          ${course.learningOutcomes.map(item => `<li><i class="fa-regular fa-circle-check"></i> ${item}</li>`).join("")}
        </ul>`
      : `<p class="muted-text">No learning outcomes provided.</p>`
  }
</section>

      <section class="course-curriculum-block">
  <h3 class="curriculum-title">
    <i class="fa-solid fa-book-open-reader"></i>
    Course Curriculum
  </h3>

  ${
    course.sections && course.sections.length
      ? course.sections.map((section, sectionIndex) => `
        <div class="curriculum-section">
          <button class="curriculum-section-header" type="button" onclick="toggleCurriculumSection(${sectionIndex})">
            <span class="section-title-left">
              <i class="fa-solid fa-chevron-down curriculum-chevron" id="curriculumChevron${sectionIndex}"></i>
              <strong>${section.title || "Untitled Section"}</strong>
            </span>
            <span class="lesson-count">
              ${section.lessons?.length || 0} lesson${section.lessons?.length === 1 ? "" : "s"}
            </span>
          </button>

          <div class="curriculum-lessons" id="curriculumLessons${sectionIndex}">
            ${
              section.lessons && section.lessons.length
                ? section.lessons.map(lesson => `
                 <a class="curriculum-lesson-row" href="/admin/courses/${course._id}/content?lesson=${lesson._id}">
                <span class="lesson-left">
                    <i class="fa-regular fa-circle-play"></i>
                    ${lesson.title || "Untitled Lesson"}
                </span>

                <span class="lesson-right">
                    <span>${lesson.duration || ""}</span>
                    <span class="lesson-dot pink-dot"></span>
                    <span class="lesson-dot yellow-dot"></span>
                    <span class="lesson-dot teal-dot"></span>
                    <span>${(lesson.resourceFiles?.length || 0) + (lesson.resources?.length || 0)} files</span>
                </span>
                </a>
                `).join("")
                : `<p class="muted-text curriculum-empty">No lessons added yet.</p>`
            }
          </div>
        </div>
      `).join("")
      : `<p class="muted-text">No curriculum sections added yet.</p>`
  }
</section>

     

      <section class="admin-notes-block">
        <label>Admin Notes (Optional)</label>
        <textarea placeholder="Add internal notes about this course..."></textarea>
      </section>

      ${course.approvalStatus === "pending" ? `
        <div class="admin-decision-plain">
          <div class="decision-buttons admin-decision-buttons">
            <button class="btn-approve" onclick="openApproveModal('${course._id}')">
              <i class="fa-regular fa-thumbs-up"></i>
              Approve Course
            </button>
            <button class="btn-reject" onclick="openRejectModal('${course._id}')">
              <i class="fa-regular fa-thumbs-down"></i>
              Reject Course
            </button>
          </div>
        </div>
      ` : ""}

      <div class="course-actions-bottom">
        <a class="btn-content btn-small-content" href="/admin/courses/${course._id}/content">
          <i class="fa-regular fa-eye"></i>
          View Course Content
        </a>

        ${course.approvalStatus === "approved" ? `
          <a class="btn-enrolled-students btn-small-content" href="/admin/courses/${course._id}/students">
            <i class="fa-solid fa-users"></i>
            View Enrolled Students
          </a>
        ` : ""}
      </div>
    </div>
  </div>
`;

  

  document.body.appendChild(modal);
}


function closeCourseModal() {
  const modal = document.getElementById("courseModal");
  if (modal) modal.remove();
}
function toggleCurriculumSection(sectionIndex) {
  const lessons = document.getElementById(`curriculumLessons${sectionIndex}`);
  const chevron = document.getElementById(`curriculumChevron${sectionIndex}`);

  if (!lessons || !chevron) return;

  lessons.classList.toggle("collapsed");
  chevron.classList.toggle("collapsed");
}

async function approveCourse(courseId) {
  const res = await fetch(`/admin/course-applications/${courseId}/approve`, {
    method: "POST"
  });

  if (res.ok) {
    location.reload();
  } else {
    alert("Failed to approve course");
  }
}

async function rejectCourse(courseId) {
  const reason = prompt("Enter rejection reason:");
  if (reason === null) return;

  const res = await fetch(`/admin/course-applications/${courseId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });

  if (res.ok) {
    location.reload();
  } else {
    alert("Failed to reject course");
  }
}

const searchInput = document.getElementById("courseSearch");
const statusFilter = document.getElementById("statusFilter");
const statusFilterSelected = document.getElementById("statusFilterSelected");
const statusFilterItems = document.getElementById("statusFilterItems");
const statusFilterOptions = document.querySelectorAll(".select-item");

if (statusFilterSelected && statusFilterItems) {
  statusFilterSelected.addEventListener("click", () => {
    statusFilterItems.classList.toggle("hidden");
    statusFilterSelected.querySelector(".select-arrow")?.classList.toggle("open");
  });
}

statusFilterOptions.forEach(item => {
  item.addEventListener("click", () => {
    const value = item.dataset.value;
    const label = item.textContent.trim();

    statusFilter.value = value;
    statusFilterSelected.querySelector("span").textContent = label;

    statusFilterOptions.forEach(option => {
      option.classList.remove("active");
      option.querySelector("i")?.remove();
    });

    item.classList.add("active");
    item.innerHTML = `${label} <i class="fa-solid fa-check"></i>`;

    statusFilterItems.classList.add("hidden");
    statusFilterSelected.querySelector(".select-arrow")?.classList.remove("open");

    filterCourses();
  });
});

function filterCourses() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  document.querySelectorAll(".courses-table tbody tr").forEach(row => {
    const title = row.dataset.title || "";
    const instructor = row.dataset.instructor || "";
    const rowStatus = row.dataset.status || "";

    const matchesSearch = title.includes(search) || instructor.includes(search);
    const matchesStatus = status === "all" || rowStatus === status;

    row.style.display = matchesSearch && matchesStatus ? "" : "none";
  });
}
let selectedApproveCourseId = null;
let selectedRejectCourseId = null;

function openApproveModal(courseId) {
  selectedApproveCourseId = courseId;

  const modal = document.createElement("div");
  modal.className = "decision-modal-overlay";
  modal.id = "approveModal";

 modal.innerHTML = `
  <div class="decision-modal">
    <button class="decision-close" onclick="closeApproveModal()">×</button>

    <h2>Approve Course</h2>
    <p class="decision-subtitle">Are you sure you want to publish this course?</p>

    <div class="approval-info">
      This course will be immediately published and available to all students on the platform.
    </div>

    <div class="decision-actions">
      <button class="confirm-approve" onclick="confirmApproveCourse()">Confirm Approval</button>
      <button class="decision-cancel" onclick="closeApproveModal()">Cancel</button>
    </div>
  </div>
`;
  document.body.appendChild(modal);
}

function closeApproveModal() {
  const modal = document.getElementById("approveModal");
  if (modal) modal.remove();
  selectedApproveCourseId = null;
}

async function confirmApproveCourse() {
  if (!selectedApproveCourseId) return;

  const res = await fetch(`/admin/course-applications/${selectedApproveCourseId}/approve`, {
    method: "POST"
  });

  if (res.ok) {
    location.reload();
  } else {
    alert("Failed to approve course");
  }
}

function openRejectModal(courseId) {
  selectedRejectCourseId = courseId;

  const modal = document.createElement("div");
  modal.className = "decision-modal-overlay";
  modal.id = "rejectModal";

  modal.innerHTML = `
    <div class="decision-modal">
      <button class="decision-close" onclick="closeRejectModal()">×</button>

      <h2>Reject Course</h2>
      <p class="decision-subtitle">Provide feedback to help the instructor improve</p>

      <label class="reject-label" for="rejectReason">Rejection Reason *</label>
      <textarea id="rejectReason" class="reject-textarea" placeholder="Explain why this course cannot be approved..."></textarea>

      <div class="decision-actions">
        <button class="confirm-reject" id="confirmRejectBtn" onclick="confirmRejectCourse()">Confirm Rejection</button>
        <button class="decision-cancel" onclick="closeRejectModal()">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const textarea = document.getElementById("rejectReason");
  const confirmBtn = document.getElementById("confirmRejectBtn");

  textarea.addEventListener("input", () => {
    confirmBtn.disabled = textarea.value.trim().length === 0;
  });

  confirmBtn.disabled = true;
}

function closeRejectModal() {
  const modal = document.getElementById("rejectModal");
  if (modal) modal.remove();
  selectedRejectCourseId = null;
}

async function confirmRejectCourse() {
  if (!selectedRejectCourseId) return;

  const reason = document.getElementById("rejectReason").value.trim();
  if (!reason) return;

  const res = await fetch(`/admin/course-applications/${selectedRejectCourseId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });

  if (res.ok) {
    location.reload();
  } else {
    alert("Failed to reject course");
  }
}

if (searchInput) searchInput.addEventListener("input", filterCourses);

const courseToOpen = new URLSearchParams(window.location.search).get("course");
if (courseToOpen) {
  openCourseModal(courseToOpen);
}
