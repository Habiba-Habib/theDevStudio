/* TheDevStudio — Index page animations (JS side)
   Handles: count-up, scroll reveal, stagger delays
   Bidirectional: elements re-animate when scrolled back into view */

document.addEventListener('DOMContentLoaded', () => {

  // ─── HELPERS ─────────────────────────────────────────────────

  /* Parse "50K+" → { num: 50, suffix: "K+" }  */
  function parseCountTarget(text) {
    const raw    = text.trim();
    const num    = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
    const suffix = raw.replace(/^[\d.]+/, '');
    return { num, suffix };
  }

  /* Animate a number from 0 → target */
  function countUp(el) {
    const { num, suffix } = parseCountTarget(el.textContent);
    if (num === 0) return;

    const duration = 1800;
    const fps      = 60;
    const interval = 1000 / fps;
    const steps    = duration / interval;
    const inc      = num / steps;
    let   current  = 0;

    const timer = setInterval(() => {
      current += inc;
      if (current >= num) {
        el.textContent = (Number.isInteger(num) ? num : num.toFixed(1)) + suffix;
        clearInterval(timer);
      } else {
        el.textContent = (Number.isInteger(num) ? Math.floor(current) : current.toFixed(1)) + suffix;
      }
    }, interval);
  }

  /* One-shot observer — fires once and stops (used for count-up) */
  function onVisible(el, callback, threshold = 0.12) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        callback(el);
        obs.unobserve(el);
      });
    }, { threshold });
    obs.observe(el);
  }

  /* Bidirectional observer:
     - adds    scroll-in-view when ≥ threshold% visible (scrolling down into view)
     - removes scroll-in-view when element is fully out of viewport (scrolling back up)
     This lets every element re-animate each time it enters the viewport.           */
  function onVisibleBi(el, threshold = 0.1) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= threshold) {
          el.classList.add('scroll-in-view');
        } else if (entry.intersectionRatio < 0.01) {
          // Fully out of view — reset so it can animate again on next entry
          el.classList.remove('scroll-in-view');
        }
      });
    }, { threshold: [0, threshold] });
    obs.observe(el);
  }


  // ─── 1. STAT COUNT-UP (one-shot — counting up every scroll would be annoying) ──
  const statsContainer = document.querySelector('.cards-container');
  if (statsContainer) {
    onVisible(statsContainer, () => {
      statsContainer.querySelectorAll('.card-number').forEach(countUp);
    }, 0.1);
  }


  // ─── 2. STAT CARDS — staggered fade-up, bidirectional ────────
  document.querySelectorAll('.card-item').forEach((card, i) => {
    card.classList.add('scroll-fade-up');
    card.style.transitionDelay = `${i * 0.1}s`;
    onVisibleBi(card, 0.1);
  });


  // ─── 3. FEATURED COURSE CARDS — opacity fade, bidirectional ──
  // Uses scroll-fade-opacity (NOT scroll-fade-up) so the card's own hover
  // transform (translateY -4px) is never blocked by scroll-in-view.
  document.querySelectorAll('.featured-courses .courses-card').forEach((card, i) => {
    card.classList.add('scroll-fade-opacity');
    card.style.transitionDelay = `${i * 0.12}s`;
    onVisibleBi(card, 0.08);
  });


  // ─── 4. WHY-DEVSTUDIO LEARNING CARDS — staggered, bidirectional ─
  // Icon hover is on a child element so scroll-fade-up on the card doesn't conflict.
  document.querySelectorAll('.learning-card').forEach((card, i) => {
    card.classList.add('scroll-fade-up');
    card.style.transitionDelay = `${i * 0.09}s`;
    onVisibleBi(card, 0.08);
  });


  // ─── 5. CHALLENGES SECTION ───────────────────────────────────

  // Left panel: slides in from the left, bidirectional
  const challengesContent = document.querySelector('.challenges .challenges-content');
  if (challengesContent) {
    challengesContent.classList.add('scroll-slide-left');
    onVisibleBi(challengesContent, 0.1);
  }

  // Challenge cards: individual staggered opacity fade, bidirectional.
  // scroll-fade-opacity keeps the difficulty-matched hover transform (translateY -4px)
  // fully intact — scroll-in-view only touches opacity, never transform.
  document.querySelectorAll('.challenges-grid .challenges-card').forEach((card, i) => {
    card.classList.add('scroll-fade-opacity');
    card.style.transitionDelay = `${i * 0.1}s`;
    onVisibleBi(card, 0.1);
  });

});
