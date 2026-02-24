/* ============ PARTICLES (CSS) ============ */
const pContainer = document.getElementById('particles');
for (let i = 0; i < 55; i++) {
  const p = document.createElement('div');
  p.className = 'h-particle';
  const size = 1.2 + Math.random() * 3;
  p.style.cssText = `
    left: ${Math.random() * 100}%;
    top:  ${15 + Math.random() * 72}%;
    width: ${size}px; height: ${size}px;
    box-shadow: 0 0 ${size * 2.5}px ${size}px rgba(var(--accent-rgb),0.6);
    animation-delay:    ${Math.random() * 14}s;
    animation-duration: ${8 + Math.random() * 12}s;
    opacity: 0;
  `;
  pContainer.appendChild(p);
}

/* ============ INTERACTIVE CANVAS PARTICLES ============ */
(function() {
  const hero = document.getElementById('home');
  if (!hero) return;

  // Inject nebula3 + light rays + canvas
  const neb = document.createElement('div');
  neb.className = 'h-nebula3';
  hero.prepend(neb);

  const rays = document.createElement('div');
  rays.className = 'h-rays';
  for (let i = 0; i < 6; i++) {
    const r = document.createElement('div');
    r.className = 'h-ray';
    rays.appendChild(r);
  }
  hero.prepend(rays);

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // Color palette matching the site
  const COLORS = [
    [62,  220, 176],  // accent green
    [30,  144, 255],  // blue
    [168, 85,  247],  // purple accent
    [62,  220, 176],  // accent (weighted more)
    [30,  144, 255],
  ];

  const NUM = 120;
  const parts = [];

  function randColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  for (let i = 0; i < NUM; i++) {
    const c = randColor();
    parts.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  0.8 + Math.random() * 2,
      alpha: 0.15 + Math.random() * 0.55,
      aDir: Math.random() > 0.5 ? 1 : -1,
      aSpd: 0.002 + Math.random() * 0.005,
      c,
    });
  }

  const CONNECT_DIST  = 130;
  const MOUSE_REPEL   = 110;
  const MOUSE_ATTRACT = 200;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    parts.forEach(p => {
      // Mouse interaction
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * 0.9;
        p.vx += (dx / dist) * force * 0.4;
        p.vy += (dy / dist) * force * 0.4;
      } else if (dist < MOUSE_ATTRACT) {
        const force = (dist - MOUSE_REPEL) / MOUSE_ATTRACT * 0.04;
        p.vx -= (dx / dist) * force;
        p.vy -= (dy / dist) * force;
      }

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Breathe
      p.alpha += p.aSpd * p.aDir;
      if (p.alpha > 0.75 || p.alpha < 0.05) p.aDir *= -1;

      // Draw dot with glow
      const [r,g,b] = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
      ctx.shadowBlur  = p.r * 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Connection lines
    for (let i = 0; i < parts.length; i++) {
      for (let j = i+1; j < parts.length; j++) {
        const a = parts[i], b = parts[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < CONNECT_DIST) {
          const opacity = (1 - d/CONNECT_DIST) * 0.18;
          const [r,g,bl] = a.c;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============ PREMIUM SMOOTH SCROLL ============ */
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function smoothScrollTo(targetY, duration = 900) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(progress));
    if (elapsed < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = document.querySelector('nav')?.offsetHeight || 70;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navH;
    smoothScrollTo(targetY, 950);
  });
});

/* ============ TYPING EFFECT ============ */
const roles    = ['Full-Stack Developer', 'Problem Solver', 'Open Source Contributor', 'Estudante ADS — Senai'];
const typingEl = document.getElementById('typingText');
let rIdx = 0, cIdx = 0, deleting = false;

function type() {
  const word = roles[rIdx];
  if (!deleting) {
    typingEl.textContent = word.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === word.length) { deleting = true; setTimeout(type, 1900); return; }
  } else {
    typingEl.textContent = word.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
  }
  setTimeout(type, deleting ? 45 : 75);
}
setTimeout(type, 1000);

/* ============ SCROLL REVEAL ============ */
const rvObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('in'), i * 110);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/* ============ SKILL BAR ANIMATION ============ */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sbar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.skill-card').forEach(c => barObs.observe(c));

/* ============ ACTIVE NAV HIGHLIGHT ============ */
const allSections = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  allSections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

/* ============ GITHUB BUTTON — stop card flip ============ */
document.addEventListener('DOMContentLoaded', () => {
  const githubBtn = document.getElementById('githubBtn');
  if (githubBtn) {
    githubBtn.addEventListener('click', e => e.stopPropagation());
    githubBtn.addEventListener('mousedown', e => e.stopPropagation());
    githubBtn.addEventListener('pointerdown', e => e.stopPropagation());
  }
});
function sendForm(e) {
  e.preventDefault();
  const btn  = document.getElementById('sendBtn');
  const span = btn.querySelector('span');
  span.textContent = 'Mensagem Enviada ✓';
  btn.style.background = '#2bc49a';
  setTimeout(() => {
    span.textContent = 'Enviar Mensagem';
    btn.style.background = '';
  }, 3200);
}

/* ============ PROJECT CARD FLIP ============ */
function toggleCard(card) {
  card.classList.toggle('is-open');
}

function closeCard(event, btn) {
  event.stopPropagation();
  btn.closest('.proj-card').classList.remove('is-open');
}





/* ============ SCROLL PROGRESS BAR ============ */
(function() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  });
})();

/* ============ AURORA HERO (handled inline in canvas block) ============ */





/* ============ NUMBER COUNTER ANIMATION ============ */
(function() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count);
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * end) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* ============ PARALLAX HERO CONTENT ============ */
(function() {
  const hero = document.getElementById('home');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const content = hero.querySelector('.h-content');
    if (content && y < window.innerHeight) {
      content.style.transform = `translateY(${y * 0.18}px)`;
      content.style.opacity   = 1 - y / window.innerHeight * 1.4;
    }
    const plants = hero.querySelectorAll('.hero-plant');
    plants.forEach(p => {
      p.style.transform = `translateY(${y * 0.08}px)`;
    });
  });
})();
