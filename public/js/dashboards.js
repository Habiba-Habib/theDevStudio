// =====================
// Student Dashboard
// =====================
document.addEventListener('DOMContentLoaded', () => {

  const bars = document.querySelectorAll('.progress-bar');
  bars.forEach(bar => {
    const targetWidth = bar.dataset.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth + '%';
    }, 200);
  });

  document.querySelectorAll('.btn-continue').forEach(btn => {
    btn.addEventListener('click', e => {
      const card  = e.target.closest('.course-progress-card');
      const title = card?.querySelector('.course-progress-title')?.textContent;
      console.log(`Continue: ${title}`);
    });
  });

});


// =====================
// Shared Helpers & Colors
// (used by both Admin and Instructor charts)
// =====================
document.addEventListener('DOMContentLoaded', () => {

  const style      = getComputedStyle(document.documentElement);
  const PINK       = style.getPropertyValue('--pink').trim();
  const PINK_LIGHT = style.getPropertyValue('--pink-light').trim();
  const YELLOW     = style.getPropertyValue('--yellow').trim();
  const TEAL       = style.getPropertyValue('--teal').trim();
  const SURFACE    = style.getPropertyValue('--surface').trim();
  const MUTED      = style.getPropertyValue('--text-muted').trim();

  function setupCanvas(canvas) {
    const wrapper = canvas.parentElement;
    canvas.width  = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    return canvas.getContext('2d');
  }

  function showTooltip(tooltip, x, y, month, value, valueColor) {
    tooltip.innerHTML = `${month}<span style="color:${valueColor}">${value}</span>`;
    tooltip.classList.remove('hidden');
    tooltip.style.left = (x + 14) + 'px';
    tooltip.style.top  = (y - 10) + 'px';
  }

  function hideTooltip(tooltip) {
    tooltip.classList.add('hidden');
  }


  // =====================
  // Admin Dashboard Charts
  // =====================
  const userGrowthCanvas    = document.getElementById('userGrowthChart');
  const revenueGrowthCanvas = document.getElementById('revenueGrowthChart');
  const donutCanvas         = document.getElementById('donutChart');

  if (userGrowthCanvas && revenueGrowthCanvas && donutCanvas) {

    const months      = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const userData    = [36000, 42000, 45000, 46500, 47500, 50000];
    const revenueData = [175, 210, 235, 255, 280, 0];

    // ---- Line Chart: User Growth ----
    function drawUserGrowthChart() {
      const canvas  = userGrowthCanvas;
      const tooltip = document.getElementById('userTooltip');
      const ctx     = setupCanvas(canvas);
      const W = canvas.width, H = canvas.height;
      const PAD    = { top: 20, right: 20, bottom: 40, left: 60 };
      const chartW = W - PAD.left - PAD.right;
      const chartH = H - PAD.top  - PAD.bottom;
      const maxVal = 60000;
      const yTicks = [0, 15000, 30000, 45000, 60000];

      function xPos(i)   { return PAD.left + (i / (months.length - 1)) * chartW; }
      function yPos(val) { return PAD.top  + chartH - (val / maxVal) * chartH; }

      function draw(hoverIdx = -1) {
        ctx.clearRect(0, 0, W, H);

        ctx.font      = '11px Inter, sans-serif';
        ctx.fillStyle = MUTED;
        ctx.textAlign = 'right';
        yTicks.forEach(t => {
          const y = yPos(t);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth   = 1;
          ctx.moveTo(PAD.left, y);
          ctx.lineTo(W - PAD.right, y);
          ctx.stroke();
          ctx.fillText(t.toLocaleString(), PAD.left - 8, y + 4);
        });

        ctx.textAlign = 'center';
        months.forEach((m, i) => ctx.fillText(m, xPos(i), H - PAD.bottom + 18));

        const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
        grad.addColorStop(0, 'rgba(255,64,160,0.2)');
        grad.addColorStop(1, 'rgba(255,64,160,0)');
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(userData[0]));
        userData.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
        ctx.lineTo(xPos(userData.length - 1), H - PAD.bottom);
        ctx.lineTo(xPos(0), H - PAD.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = PINK;
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        ctx.moveTo(xPos(0), yPos(userData[0]));
        userData.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
        ctx.stroke();

        userData.forEach((v, i) => {
          const isHover = i === hoverIdx;
          ctx.beginPath();
          ctx.arc(xPos(i), yPos(v), isHover ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle   = isHover ? PINK_LIGHT : PINK;
          ctx.strokeStyle = SURFACE;
          ctx.lineWidth   = 2;
          ctx.fill();
          ctx.stroke();
        });

        if (hoverIdx >= 0) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth   = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(xPos(hoverIdx), PAD.top);
          ctx.lineTo(xPos(hoverIdx), H - PAD.bottom);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      draw();

      canvas.addEventListener('mousemove', (e) => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;

        let closest = -1, minDist = 40;
        months.forEach((_, i) => {
          const d = Math.abs(mouseX - xPos(i));
          if (d < minDist) { minDist = d; closest = i; }
        });

        draw(closest);
        if (closest >= 0) {
          showTooltip(
            tooltip,
            xPos(closest) / scaleX,
            yPos(userData[closest]) / scaleY,
            months[closest],
            `users : ${userData[closest].toLocaleString()}`,
            PINK
          );
        } else {
          hideTooltip(tooltip);
        }
      });

      canvas.addEventListener('mouseleave', () => { draw(); hideTooltip(tooltip); });
    }

    // ---- Bar Chart: Revenue Growth ----
    function drawRevenueGrowthChart() {
      const canvas  = revenueGrowthCanvas;
      const tooltip = document.getElementById('revenueTooltip');
      const ctx     = setupCanvas(canvas);
      const W = canvas.width, H = canvas.height;
      const PAD    = { top: 20, right: 20, bottom: 40, left: 44 };
      const chartW = W - PAD.left - PAD.right;
      const chartH = H - PAD.top  - PAD.bottom;
      const maxVal = 280;
      const yTicks = [0, 70, 140, 210, 280];
      const barW   = (chartW / months.length) * 0.55;

      function xCenter(i) { return PAD.left + (i + 0.5) * (chartW / months.length); }
      function yPos(val)  { return PAD.top  + chartH - (val / maxVal) * chartH; }

      function draw(hoverIdx = -1) {
        ctx.clearRect(0, 0, W, H);

        ctx.font      = '11px Inter, sans-serif';
        ctx.fillStyle = MUTED;
        ctx.textAlign = 'right';
        yTicks.forEach(t => {
          const y = yPos(t);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth   = 1;
          ctx.moveTo(PAD.left, y);
          ctx.lineTo(W - PAD.right, y);
          ctx.stroke();
          ctx.fillText(t, PAD.left - 6, y + 4);
        });

        ctx.textAlign = 'center';
        months.forEach((m, i) => ctx.fillText(m, xCenter(i), H - PAD.bottom + 18));

        revenueData.forEach((v, i) => {
          if (v === 0) return;
          const x     = xCenter(i) - barW / 2;
          const y     = yPos(v);
          const bH    = chartH - (y - PAD.top);
          const r     = 4;
          const isHov = i === hoverIdx;

          ctx.beginPath();
          ctx.fillStyle   = TEAL;
          ctx.globalAlpha = isHov ? 0.5 : 0.85;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + barW - r, y);
          ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
          ctx.lineTo(x + barW, y + bH);
          ctx.lineTo(x, y + bH);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      draw();

      canvas.addEventListener('mousemove', (e) => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;

        let closest = -1, minDist = (chartW / months.length) / 2;
        revenueData.forEach((v, i) => {
          if (v === 0) return;
          const d = Math.abs(mouseX - xCenter(i));
          if (d < minDist) { minDist = d; closest = i; }
        });

        draw(closest);
        if (closest >= 0) {
          showTooltip(
            tooltip,
            xCenter(closest) / scaleX,
            yPos(revenueData[closest]) / scaleY,
            months[closest],
            `revenue : $${revenueData[closest]}K`,
            TEAL
          );
        } else {
          hideTooltip(tooltip);
        }
      });

      canvas.addEventListener('mouseleave', () => { draw(); hideTooltip(tooltip); });
    }

    // ---- Donut Chart: Course Categories ----
    function drawDonutChart() {
      const canvas  = donutCanvas;
      const tooltip = document.getElementById('donutTooltip');
      canvas.width  = 200;
      canvas.height = 200;
      const ctx         = canvas.getContext('2d');
      const cx          = 100, cy = 100;
      const radius      = 80;
      const innerRadius = 52;
      const gapAngle    = 0.04;

      const slices = [
        { label: 'Web Dev',      value: 30, color: PINK },
        { label: 'Data Science', value: 25, color: YELLOW },
        { label: 'Mobile',       value: 20, color: TEAL },
        { label: 'ML/AI',        value: 15, color: '#8B8BF5' },
        { label: 'Design',       value: 10, color: '#FFB7E6' },
      ];

      const total = slices.reduce((s, d) => s + d.value, 0);

      let angle = -Math.PI / 2;
      slices.forEach(slice => {
        slice.startAngle = angle;
        slice.sweepAngle = (slice.value / total) * Math.PI * 2 - gapAngle;
        slice.endAngle   = angle + slice.sweepAngle;
        angle += slice.sweepAngle + gapAngle;
      });

      function draw(hoverIdx = -1) {
        ctx.clearRect(0, 0, 200, 200);
        slices.forEach((slice, i) => {
          const isHover = i === hoverIdx;
          const r = isHover ? radius + 6 : radius;

          ctx.beginPath();
          ctx.moveTo(cx + innerRadius * Math.cos(slice.startAngle), cy + innerRadius * Math.sin(slice.startAngle));
          ctx.arc(cx, cy, r, slice.startAngle, slice.endAngle);
          ctx.arc(cx, cy, innerRadius, slice.endAngle, slice.startAngle, true);
          ctx.closePath();
          ctx.fillStyle   = slice.color;
          ctx.globalAlpha = isHover ? 1 : 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      draw();

      canvas.addEventListener('mousemove', (e) => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx     = (e.clientX - rect.left) * scaleX - cx;
        const my     = (e.clientY - rect.top)  * scaleY - cy;
        const dist   = Math.sqrt(mx * mx + my * my);

        if (dist < innerRadius || dist > radius + 8) {
          draw();
          hideTooltip(tooltip);
          return;
        }

        let angle = Math.atan2(my, mx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;

        let hoverIdx = -1;
        slices.forEach((slice, i) => {
          let start = slice.startAngle;
          let end   = slice.endAngle;
          if (start < -Math.PI / 2) { start += Math.PI * 2; end += Math.PI * 2; }
          if (angle >= start && angle <= end) hoverIdx = i;
        });

        draw(hoverIdx);

        if (hoverIdx >= 0) {
          const slice = slices[hoverIdx];
          tooltip.innerHTML = `${slice.label}<span style="color:${slice.color}">${slice.value}%</span>`;
          tooltip.classList.remove('hidden');
          tooltip.style.left = ((e.clientX - rect.left) + 12) + 'px';
          tooltip.style.top  = ((e.clientY - rect.top)  - 10) + 'px';
        } else {
          hideTooltip(tooltip);
        }
      });

      canvas.addEventListener('mouseleave', () => { draw(); hideTooltip(tooltip); });
    }

    drawUserGrowthChart();
    drawRevenueGrowthChart();
    drawDonutChart();

    window.addEventListener('resize', () => {
      drawUserGrowthChart();
      drawRevenueGrowthChart();
    });

  } // end admin if


  // =====================
  // Instructor Dashboard Charts
  // =====================
  const enrollCanvas  = document.getElementById('enrollmentsChart');
  const revenueCanvas = document.getElementById('revenueChart');

  if (enrollCanvas && revenueCanvas) {
    const chartDataEl = document.getElementById('instructorChartData');
const chartData = chartDataEl ? JSON.parse(chartDataEl.textContent) : {};

      const instrMonths = chartData.months || [];
      const enrollData = chartData.enrollments || [];
      const instrRevenueData = chartData.revenue || [];
    // ---- Line Chart: Student Enrollments ----
    function drawLineChart() {
      const canvas  = enrollCanvas;
      const tooltip = document.getElementById('enrollTooltip');
      const ctx     = setupCanvas(canvas);
      const W = canvas.width;
      const H = canvas.height;
      const PAD    = { top: 20, right: 20, bottom: 40, left: 44 };
      const chartW = W - PAD.left - PAD.right;
      const chartH = H - PAD.top  - PAD.bottom;
   const maxVal = Math.max(...enrollData, 1);

      function xPos(i)   { return PAD.left + (i / (instrMonths.length - 1)) * chartW; }
      function yPos(val) { return PAD.top  + chartH - (val / maxVal) * chartH; }

      function draw(hoverIdx = -1) {
        ctx.clearRect(0, 0, W, H);

        const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
        ctx.font      = '11px Inter, sans-serif';
        ctx.fillStyle = MUTED;
        ctx.textAlign = 'right';
        yTicks.forEach(t => {
          const y = yPos(t);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth   = 1;
          ctx.moveTo(PAD.left, y);
          ctx.lineTo(W - PAD.right, y);
          ctx.stroke();
          ctx.fillText(t, PAD.left - 6, y + 4);
        });

        ctx.textAlign = 'center';
        instrMonths.forEach((m, i) => ctx.fillText(m, xPos(i), H - PAD.bottom + 18));

        const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
        grad.addColorStop(0, 'rgba(255,64,160,0.25)');
        grad.addColorStop(1, 'rgba(255,64,160,0)');
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(enrollData[0]));
        enrollData.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
        ctx.lineTo(xPos(enrollData.length - 1), H - PAD.bottom);
        ctx.lineTo(xPos(0), H - PAD.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = PINK;
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        ctx.moveTo(xPos(0), yPos(enrollData[0]));
        enrollData.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
        ctx.stroke();

        enrollData.forEach((v, i) => {
          const isHover = i === hoverIdx;
          ctx.beginPath();
          ctx.arc(xPos(i), yPos(v), isHover ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle   = isHover ? PINK_LIGHT : PINK;
          ctx.strokeStyle = SURFACE;
          ctx.lineWidth   = 2;
          ctx.fill();
          ctx.stroke();
        });

        if (hoverIdx >= 0) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth   = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(xPos(hoverIdx), PAD.top);
          ctx.lineTo(xPos(hoverIdx), H - PAD.bottom);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      draw();

      canvas.addEventListener('mousemove', (e) => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;

        let closest = -1, minDist = 40;
        instrMonths.forEach((_, i) => {
          const d = Math.abs(mouseX - xPos(i));
          if (d < minDist) { minDist = d; closest = i; }
        });

        draw(closest);
        if (closest >= 0) {
          showTooltip(tooltip, xPos(closest) / scaleX, yPos(enrollData[closest]) / scaleY,
            instrMonths[closest], `students : ${enrollData[closest]}`, PINK);
        } else {
          hideTooltip(tooltip);
        }
      });

      canvas.addEventListener('mouseleave', () => { draw(); hideTooltip(tooltip); });
    }

    // ---- Bar Chart: Monthly Revenue ----
    function drawBarChart() {
      const canvas  = revenueCanvas;
      const tooltip = document.getElementById('revenueTooltip');
      const ctx     = setupCanvas(canvas);
      const W = canvas.width;
      const H = canvas.height;
      const PAD    = { top: 20, right: 20, bottom: 40, left: 56 };
      const chartW = W - PAD.left - PAD.right;
      const chartH = H - PAD.top  - PAD.bottom;
      const maxVal = Math.max(...instrRevenueData, 1);
      const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
      const barW   = (chartW / instrMonths.length) * 0.55;

      function xCenter(i) { return PAD.left + (i + 0.5) * (chartW / instrMonths.length); }
      function yPos(val)  { return PAD.top  + chartH - (val / maxVal) * chartH; }

      function draw(hoverIdx = -1) {
        ctx.clearRect(0, 0, W, H);

        ctx.font      = '11px Inter, sans-serif';
        ctx.fillStyle = MUTED;
        ctx.textAlign = 'right';
        yTicks.forEach(t => {
          const y = yPos(t);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth   = 1;
          ctx.moveTo(PAD.left, y);
          ctx.lineTo(W - PAD.right, y);
          ctx.stroke();
          ctx.fillText(t.toLocaleString(), PAD.left - 6, y + 4);
        });

        ctx.textAlign = 'center';
        instrMonths.forEach((m, i) => ctx.fillText(m, xCenter(i), H - PAD.bottom + 18));

        instrRevenueData.forEach((v, i) => {
          const x     = xCenter(i) - barW / 2;
          const y     = yPos(v);
          const bH    = chartH - (y - PAD.top);
          const r     = 4;
          const isHov = i === hoverIdx;

          ctx.beginPath();
          ctx.fillStyle   = YELLOW;
          ctx.globalAlpha = isHov ? 0.5 : 0.85;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + barW - r, y);
          ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
          ctx.lineTo(x + barW, y + bH);
          ctx.lineTo(x, y + bH);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      draw();

      canvas.addEventListener('mousemove', (e) => {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;

        let closest = -1, minDist = (chartW / instrMonths.length) / 2;
        instrMonths.forEach((_, i) => {
          const d = Math.abs(mouseX - xCenter(i));
          if (d < minDist) { minDist = d; closest = i; }
        });

        draw(closest);
        if (closest >= 0) {
          showTooltip(tooltip, xCenter(closest) / scaleX, yPos(instrRevenueData[closest]) / scaleY,
            instrMonths[closest], `revenue : $${instrRevenueData[closest].toLocaleString()}`, YELLOW);
        } else {
          hideTooltip(tooltip);
        }
      });

      canvas.addEventListener('mouseleave', () => { draw(); hideTooltip(tooltip); });
    }

    drawLineChart();
    drawBarChart();

    window.addEventListener('resize', () => {
      drawLineChart();
      drawBarChart();
    });

  } 

}); 

function showActivateModal() {
  document.getElementById('activateModal').style.display = 'flex';
}

function closeActivateModal() {
  document.getElementById('activateModal').style.display = 'none';
}

function confirmActivate() {
  fetch('/student/activate-instructor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/auth/login';
    } else {
      alert(data.message);
      closeActivateModal();
    }
  })
  .catch(err => {
    alert('Something went wrong: ' + err.message);
    closeActivateModal();
  });
}


function showRejectionReason(btn) {
  const card = btn.closest('.instructor-status-card');
  const reason = card.dataset.reason;
  document.getElementById('rejectionReasonText').textContent = reason;
  document.getElementById('reasonModal').style.display = 'flex';
}


function closeReasonModal() {
  document.getElementById('reasonModal').style.display = 'none';
}
// ══════════════════════════════════════════════════════════════
// COURSE FILTERS & SEARCH (Instructor Dashboard)
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const courseItems = document.querySelectorAll('.course-item');
  const searchInput = document.getElementById('course-search');
  const noResults = document.getElementById('no-results');
  
  // Skip if no filter tabs exist (not on instructor dashboard)
  if (!filterTabs.length || !courseItems.length) return;
  
  let currentFilter = 'all';

  // Filter functionality
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Get filter value
      currentFilter = tab.getAttribute('data-filter');
      
      // Clear search when switching filters
      if (searchInput) {
        searchInput.value = '';
      }
      
      // Apply filter
      applyFilters();
    });
  });

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  // Apply both filter and search
  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;
    
    courseItems.forEach(item => {
      const status = item.getAttribute('data-status');
      const title = item.getAttribute('data-course-title');
      
      // Check filter match
      let filterMatch = false;
      if (currentFilter === 'all') {
        filterMatch = true;
      } else if (currentFilter === 'published' && status === 'published') {
        filterMatch = true;
      } else if (currentFilter === 'drafts' && status === 'draft') {
        filterMatch = true;
      }
      
      // Check search match
      const searchMatch = !searchTerm || title.includes(searchTerm);
      
      // Show/hide item
      if (filterMatch && searchMatch) {
        item.classList.remove('hidden');
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.classList.add('hidden');
        item.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    if (noResults) {
      if (visibleCount === 0) {
        noResults.style.display = 'flex';
      } else {
        noResults.style.display = 'none';
      }
    }
  }

  // Initialize on page load
  applyFilters();
});
