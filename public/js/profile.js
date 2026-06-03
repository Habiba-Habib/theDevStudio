document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("editProfileBtn");

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      window.location.href = editBtn.href;
    });
  }
});
