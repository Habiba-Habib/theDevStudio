// ── TABS ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});
document.querySelectorAll('[data-progress]').forEach(el => {
  const progress = Number(el.dataset.progress) || 0;
  el.style.width = `${progress}%`;
});

// ── MARK AS COMPLETE ──
const btnComplete = document.getElementById('btnComplete');

if (btnComplete && !btnComplete.classList.contains('is-done')) {
  btnComplete.addEventListener('click', async () => {
    const courseId = btnComplete.dataset.courseId;
    const lessonId = btnComplete.dataset.lessonId;

    btnComplete.disabled = true;
    btnComplete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';

    try {
      const res  = await fetch(`/student/course/${courseId}/lesson/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        // button
        btnComplete.classList.add('is-done');
        btnComplete.innerHTML = '<i class="fa-solid fa-check"></i> Completed';

        // sidebar lesson row
        const row = document.querySelector(`.lesson-row[data-lesson-id="${lessonId}"]`);
        if (row) {
          row.classList.add('is-done');
          const icon = row.querySelector('.lesson-row-icon');
          if (icon) icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        }

        // topbar progress
        const fill  = document.getElementById('topbarFill');
        const pct   = document.getElementById('topbarPct');
        if (fill) fill.style.width  = data.progress + '%';
        if (pct)  pct.textContent   = data.progress + '%';

        // sidebar progress
        const sFill  = document.getElementById('sidebarFill');
        const sCount = document.getElementById('sidebarCount');
        if (sFill)  sFill.style.width  = data.progress + '%';
        if (sCount) sCount.textContent = `${data.completedCount}/${data.totalLessons}`;

        // show completion modal when all lessons are done
        if (data.progress === 100) {
          showCompletionModal(courseId);
        }

      } else {
        btnComplete.disabled = false;
        btnComplete.innerHTML = '<i class="fa-solid fa-check"></i> Mark Complete';
      }

    } catch (err) {
      console.error(err);
      btnComplete.disabled = false;
      btnComplete.innerHTML = '<i class="fa-solid fa-check"></i> Mark Complete';
    }
  });
}

// ── COMPLETION MODAL ──
function showCompletionModal(courseId) {
  const overlay = document.getElementById('completionOverlay');
  if (!overlay) return;
  overlay.classList.add('is-visible');

  const stars     = overlay.querySelectorAll('.cm-star');
  const label     = document.getElementById('cmStarLabel');
  const submitBtn = document.getElementById('cmSubmit');
  const comment   = document.getElementById('cmComment');
  const skipBtn   = document.getElementById('cmSkip');

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  let selectedRating = 0;

  // star hover + click
  stars.forEach(star => {
    const val = parseInt(star.dataset.value, 10);

    star.addEventListener('mouseenter', () => {
      stars.forEach(s => {
        const sv = parseInt(s.dataset.value, 10);
        s.classList.toggle('hovered', sv <= val);
        s.querySelector('i').className = sv <= val ? 'fa-solid fa-star' : 'fa-regular fa-star';
      });
      label.textContent = starLabels[val];
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        const sv = parseInt(s.dataset.value, 10);
        s.classList.remove('hovered');
        s.querySelector('i').className = sv <= selectedRating ? 'fa-solid fa-star' : 'fa-regular fa-star';
        s.classList.toggle('selected', sv <= selectedRating);
      });
      label.textContent = selectedRating ? starLabels[selectedRating] : 'Tap a star to rate';
    });

    star.addEventListener('click', () => {
      selectedRating = val;
      stars.forEach(s => {
        const sv = parseInt(s.dataset.value, 10);
        s.querySelector('i').className = sv <= selectedRating ? 'fa-solid fa-star' : 'fa-regular fa-star';
        s.classList.toggle('selected', sv <= selectedRating);
      });
      label.textContent = starLabels[selectedRating];
      submitBtn.disabled = false;
    });
  });

  // submit review
  submitBtn.addEventListener('click', async () => {
    if (!selectedRating) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';

    try {
      const res  = await fetch(`/student/course/${courseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedRating, comment: comment.value.trim() })
      });
      const data = await res.json();

      if (data.success) {
        submitBtn.classList.add('is-done');
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Review Submitted!';
        submitBtn.disabled = true;
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Review';
      }
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Review';
    }
  });

  // skip
  skipBtn.addEventListener('click', () => {
    overlay.classList.remove('is-visible');
  });

  // close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('is-visible');
  });
}

// Show modal on page load if course is already 100% complete
(function checkAlreadyComplete() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  const total     = parseInt(nav.dataset.total, 10) || 0;
  const completed = parseInt(nav.dataset.completed, 10) || 0;
  if (total > 0 && completed >= total) {
    const courseId = document.getElementById('btnComplete')?.dataset.courseId
                  || nav.dataset.courseId;
    if (courseId) showCompletionModal(courseId);
  }
})();
