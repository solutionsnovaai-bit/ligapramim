/* =====================================================
   Liga Pra Mim — LabFuture
   main.js — Production-ready scripts
   ===================================================== */

'use strict';

/* ─── UTILS ─── */
const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

/* ─── CUSTOM CURSOR ─── */
(function initCursor() {
  if (isMobile()) return;

  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (!cur || !ring) return;

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  /* Trail dots */
  const trailContainer = document.createElement('div');
  trailContainer.id = 'cur-trail';
  document.body.appendChild(trailContainer);

  const TRAIL = 12;
  const dots = Array.from({ length: TRAIL }, (_, i) => {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    const t = 1 - i / TRAIL;
    d.style.cssText = `width:${3 * t}px;height:${3 * t}px;opacity:${t * 0.35};`;
    trailContainer.appendChild(d);
    return { el: d, x: -200, y: -200 };
  });

  function animCursor() {
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';

    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    /* trail */
    for (let i = TRAIL - 1; i > 0; i--) {
      dots[i].x = dots[i - 1].x;
      dots[i].y = dots[i - 1].y;
    }
    dots[0].x += (mx - dots[0].x) * 0.25;
    dots[0].y += (my - dots[0].y) * 0.25;

    const COLORS = ['#00E5FF', '#2979FF', '#7B2FFF', '#FFB300'];
    dots.forEach((d, i) => {
      d.el.style.left       = d.x + 'px';
      d.el.style.top        = d.y + 'px';
      d.el.style.background = COLORS[i % COLORS.length];
    });

    requestAnimationFrame(animCursor);
  }
  animCursor();

  /* Hover state */
  document.querySelectorAll('a, button, .feat-card, .roi-card, .depo-card, .obj-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });
})();

/* ─── HERO CANVAS — Particles + Glow ─── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const PALETTE    = ['#2979FF', '#00E5FF', '#7B2FFF', '#FFB300', '#FF6D00'];
  const NUM_PARTS  = isMobile() ? 60 : 120;

  const particles = Array.from({ length: NUM_PARTS }, () => ({
    x:          Math.random(),
    y:          Math.random(),
    vx:         (Math.random() - 0.5) * 0.0004,
    vy:         (Math.random() - 0.5) * 0.0004,
    r:          Math.random() * 1.8 + 0.4,
    color:      PALETTE[Math.floor(Math.random() * PALETTE.length)],
    alpha:      Math.random() * 0.6 + 0.2,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: 0.008 + Math.random() * 0.012,
  }));

  let mouseX = 0.5, mouseY = 0.5;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX / W;
    mouseY = e.clientY / H;
  });

  let frameCount = 0;

  function drawCanvas() {
    ctx.clearRect(0, 0, W, H);
    frameCount++;

    /* Radial glows — concentrated on right side where robot is, stronger purple like reference */
    const glows = [
      { x: 0.68, y: 0.42, color: 'rgba(90,20,180,.12)',  r: W * 0.60 },
      { x: 0.80, y: 0.50, color: 'rgba(120,40,220,.10)', r: W * 0.42 },
      { x: 0.72, y: 0.28, color: 'rgba(60,10,140,.08)',  r: W * 0.35 },
      { x: 0.85, y: 0.65, color: 'rgba(40,80,255,.06)',  r: W * 0.30 },
      { x: 0.65, y: 0.55, color: 'rgba(0,180,255,.04)',  r: W * 0.25 },
    ];

    glows.forEach(g => {
      const grad = ctx.createRadialGradient(g.x * W, g.y * H, 0, g.x * W, g.y * H, g.r);
      grad.addColorStop(0, g.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });

    /* Scan line */
    const scanY   = ((frameCount * 0.4) % (H + 200)) - 100;
    const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    scanGrad.addColorStop(0,   'transparent');
    scanGrad.addColorStop(0.5, 'rgba(0,229,255,.022)');
    scanGrad.addColorStop(1,   'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 60, W, 120);

    /* Connections */
    const maxDist = isMobile() ? 100 : 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = (particles[i].x - particles[j].x) * W;
        const dy   = (particles[i].y - particles[j].y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x * W, particles[i].y * H);
          ctx.lineTo(particles[j].x * W, particles[j].y * H);
          ctx.strokeStyle = `rgba(41,121,255,${(0.12 * (1 - dist / maxDist)).toFixed(3)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    /* Particles */
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r * (1 + 0.3 * Math.sin(p.pulse)), 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0');
      ctx.fill();

      if (p.r > 1.4) {
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '18';
        ctx.fill();
      }

      /* Mouse repel */
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 0.15) {
        p.vx += mdx * 0.000015;
        p.vy += mdy * 0.000015;
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;

      /* Subtle drift right (toward robot) */
      if (p.x < 0.4) p.vx += 0.000003;
      p.vx *= 0.998;
      p.vy *= 0.998;
    });

    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();
})();

/* ─── PARALLAX HERO ─── */
(function initParallax() {
  const canvas        = document.getElementById('hero-canvas');
  const heroGradient  = document.querySelector('.hero-gradient');
  const heroImage     = document.querySelector('.hero-image');

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (canvas)       canvas.style.transform       = `translateY(${s * 0.28}px)`;
    if (heroGradient) heroGradient.style.transform  = `translateY(${s * 0.15}px)`;
    if (heroImage)    heroImage.style.transform     = `translateY(${s * 0.18}px)`;
  }, { passive: true });
})();

/* ─── NAV SCROLL ─── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ─── INTERSECTION REVEAL ─── */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  function countUp(el, target, suffix) {
    let v    = 0;
    const step = target / 60;
    const t  = setInterval(() => {
      v = Math.min(v + step, target);
      el.textContent = Math.floor(v) + suffix;
      if (v >= target) clearInterval(t);
    }, 24);
  }

  const statIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        countUp(el, target, suffix);
        statIo.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => statIo.observe(el));
})();

/* ─── VAGAS PROGRESS BAR ─── */
(function initVagasBar() {
  const vf = document.getElementById('vagasfill');
  if (!vf) return;

  const vagasIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('filled'), 300);
        vagasIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  vagasIo.observe(vf);
})();
