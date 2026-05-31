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
