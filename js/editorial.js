/* ================================================================
   EDITORIAL EXPERIENCE — Animation & Interaction Engine
   ================================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. LENIS SMOOTH SCROLL — Single driver via GSAP ticker
     ------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Bridge Lenis → ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis RAF through GSAP ticker (NO separate requestAnimationFrame)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ------------------------------------------------------------
     2. CUSTOM CURSOR — using gsap.quickTo for zero-lag tracking
     ------------------------------------------------------------ */
  if (!prefersReduced && window.innerWidth > 991) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const spotlight = document.querySelector('.cursor-spotlight');

    if (dot && ring) {
      const xQuick = gsap.quickTo(dot, 'left', { type: 'x', ease: 'none', duration: 0.15 });
      const yQuick = gsap.quickTo(dot, 'top', { type: 'y', ease: 'none', duration: 0.15 });
      const rxQuick = gsap.quickTo(ring, 'left', { type: 'x', ease: 'power2.out', duration: 0.3 });
      const ryQuick = gsap.quickTo(ring, 'top', { type: 'y', ease: 'power2.out', duration: 0.3 });

      document.addEventListener('mousemove', (e) => {
        xQuick(e.clientX);
        yQuick(e.clientY);
        rxQuick(e.clientX);
        ryQuick(e.clientY);
        if (spotlight) {
          spotlight.style.left = e.clientX + 'px';
          spotlight.style.top = e.clientY + 'px';
        }
      }, { passive: true });
    }
  } else {
    ['cursor-dot', 'cursor-ring', 'cursor-spotlight'].forEach(c => {
      const el = document.querySelector('.' + c);
      if (el) el.style.display = 'none';
    });
  }

  /* ------------------------------------------------------------
     3. TEXT SPLITTING (Manual SplitText replacement)
     ------------------------------------------------------------ */
  function splitTextIntoChars(el) {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('data-split-text', 'true');
    const words = text.split(' ');
    words.forEach((word, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      word.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.willChange = 'transform, opacity';
        wordSpan.appendChild(charSpan);
      });
      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        space.style.display = 'inline-block';
        el.appendChild(space);
      }
    });
    return el.querySelectorAll('.char');
  }

  /* ------------------------------------------------------------
     4. SVG PATH DRAWING
     ------------------------------------------------------------ */
  function prepareDrawPaths() {
    document.querySelectorAll('.draw-path').forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.setAttribute('data-draw-length', length);
    });
  }

  /* ------------------------------------------------------------
     5. MASCOT EYE BLINK
     ------------------------------------------------------------ */
  function initEyeBlink() {
    const eyes = document.querySelectorAll('.mascot-eye');
    if (!eyes.length) return;
    setInterval(() => {
      eyes.forEach(eye => {
        eye.style.transition = 'transform 0.1s';
        eye.style.transformOrigin = 'center';
        eye.style.transform = 'scaleY(0.1)';
        setTimeout(() => {
          eye.style.transform = 'scaleY(1)';
        }, 150);
      });
    }, 4000 + Math.random() * 2000);
  }

  /* ------------------------------------------------------------
     5b. SAFETY NET: Force all reveal elements visible after 2.5s
         Prevents permanently invisible content if JS errors upstream
     ------------------------------------------------------------ */
  function addOpacitySafetyNet() {
    setTimeout(() => {
      document.querySelectorAll('.manifesto__subtitle, .manifesto__actions, .manifesto__robot, .invitation__robot').forEach(el => {
        if (getComputedStyle(el).opacity === '0') {
          gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.3 });
        }
      });
      // Ensure all char-wrap spans are visible
      document.querySelectorAll('.char-wrap span').forEach(span => {
        const chars = span.querySelectorAll('.char');
        if (chars.length) {
          const cs = getComputedStyle(chars[0]);
          if (cs.opacity === '0' || cs.transform !== 'none') {
            gsap.set(chars, { yPercent: 0, opacity: 1, clearProps: 'transform' });
          }
        }
      });
    }, 2500);
  }

  /* ------------------------------------------------------------
     6. SPREAD 1: THE MANIFESTO
     ------------------------------------------------------------ */
  function initManifesto() {
    const spread = document.getElementById('spread-1');
    if (!spread) return;

    // Split headline text into chars
    spread.querySelectorAll('[data-split]').forEach(el => {
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          c.style.willChange = 'transform, opacity';
          span.appendChild(c);
        });
      });
    });

    // Entrance timeline
    const tl = gsap.timeline({ delay: 0.2 });

    // Chars stagger in from bottom
    const allChars = spread.querySelectorAll('.char');
    tl.fromTo(allChars, { yPercent: 120, opacity: 0 }, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.012,
      ease: 'power3.out',
    }, 0);

    // Underline draw
    spread.querySelectorAll('.doodle-svg .draw-path').forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 0.4);
    });

    // Stickers stamp in — faster, less competing
    spread.querySelectorAll('.manifesto .sticker').forEach((s, i) => {
      tl.from(s, {
        scale: 2.5,
        rotation: -20,
        filter: 'blur(3px)',
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.4)',
      }, 0.6 + i * 0.1);
    });

    // Robot fade in
    const robot = document.getElementById('manifesto-robot');
    if (robot) {
      tl.to(robot, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.5);
    }

    // Subtitle & actions — reveal immediately, no scroll dependency for hero
    const sub = document.getElementById('manifesto-sub');
    const actions = document.getElementById('manifesto-actions');

    if (sub) {
      tl.to(sub, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
    }
    if (actions) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.85);
    }
  }

  /* ------------------------------------------------------------
     7. SPREAD 2: THE ARCHIVE (Draggable Cards)
     ------------------------------------------------------------ */
  function initArchive() {
    const spread = document.getElementById('spread-2');
    const stack = document.getElementById('archive-stack');
    if (!spread || !stack) return;

    const cards = stack.querySelectorAll('.archive__card');
    if (cards.length === 0) return;

    let activeIndex = 0;
    const total = cards.length;

    const configs = [
      { xPercent: 0,   yPercent: 0,  rotation: 0,   scale: 1,   opacity: 1, zIndex: 5 },
      { xPercent: 30,  yPercent: 2,  rotation: 10,  scale: 0.9, opacity: 1, zIndex: 4 },
      { xPercent: -30, yPercent: 2,  rotation: -10, scale: 0.9, opacity: 1, zIndex: 4 },
      { xPercent: 50,  yPercent: 6,  rotation: 15,  scale: 0.8, opacity: 1, zIndex: 3 },
      { xPercent: -50, yPercent: 6,  rotation: -15, scale: 0.8, opacity: 1, zIndex: 3 },
    ];

    function getConfig(diff) {
      const absDiff = Math.abs(diff);
      if (absDiff < configs.length) {
        const cfg = { ...configs[absDiff] };
        if (diff < 0) cfg.xPercent = -configs[absDiff].xPercent;
        if (diff < 0) cfg.rotation = -configs[absDiff].rotation;
        return cfg;
      }
      const dir = diff > 0 ? 1 : -1;
      return { xPercent: 55 * dir, yPercent: 8, rotation: 20 * dir, scale: 0.6, opacity: 0, zIndex: 2 };
    }

    function renderCards(animated) {
      cards.forEach((card, i) => {
        const diff = i - activeIndex;
        const cfg = getConfig(diff);
        const dur = animated ? 0.6 : 0;
        gsap.to(card, {
          duration: dur,
          ease: animated ? 'elastic.out(1.2, 1)' : 'none',
          xPercent: cfg.xPercent,
          yPercent: cfg.yPercent,
          rotation: cfg.rotation,
          scale: cfg.scale,
          opacity: cfg.opacity,
          zIndex: cfg.zIndex,
          overwrite: true,
        });
      });
    }

    // Initial render
    gsap.set(cards, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
    renderCards(false);

    // Scroll-triggered entrance
    ScrollTrigger.create({
      trigger: spread,
      start: 'top 80%',
      onEnter: () => {
        gsap.from(stack, { scale: 0.85, opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: true });
        const headerChars = spread.querySelectorAll('.archive__header .char');
        gsap.fromTo(headerChars, { yPercent: 120, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: 'power3.out', overwrite: true,
        });
      },
      once: true,
    });

    // Drag interaction
    if (window.innerWidth > 991 && !prefersReduced) {
      let startX = 0;
      let isDragging = false;
      let dragOffset = 0;
      const threshold = 80;

      stack.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        dragOffset = 0;
        stack.style.cursor = 'grabbing';
      });

      stack.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        dragOffset = 0;
      }, { passive: true });

      function onMove(clientX) {
        if (!isDragging) return;
        dragOffset = clientX - startX;
        const progress = dragOffset / threshold;

        cards.forEach((card, i) => {
          const diff = i - activeIndex;
          const cfg = getConfig(diff);
          const offsetProgress = Math.max(-1, Math.min(1, progress));

          gsap.set(card, {
            xPercent: cfg.xPercent + offsetProgress * 30,
            rotation: cfg.rotation + offsetProgress * 5,
          });
        });
      }

      document.addEventListener('mousemove', (e) => onMove(e.clientX));
      document.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });

      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        stack.style.cursor = 'grab';

        if (Math.abs(dragOffset) > threshold) {
          if (dragOffset < 0 && activeIndex < total - 1) activeIndex++;
          else if (dragOffset > 0 && activeIndex > 0) activeIndex--;
        }
        dragOffset = 0;
        renderCards(true);
      }

      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
      stack.style.cursor = 'grab';
    }

    // Sticker animations
    const stickers = spread.querySelectorAll('.archive [data-sticker]');
    stickers.forEach(s => {
      gsap.from(s, {
        scale: 3, rotation: -25, filter: 'blur(4px)', opacity: 0,
        duration: 0.5, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: s, start: 'top 90%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------
     8. SPREAD 3: THE WORKSHOP
     ------------------------------------------------------------ */
  function initWorkshop() {
    const spread = document.getElementById('spread-3');
    if (!spread) return;

    // Split headline
    spread.querySelectorAll('[data-split]').forEach(el => {
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          span.appendChild(c);
        });
      });
    });

    // Header entrance
    ScrollTrigger.create({
      trigger: spread,
      start: 'top 70%',
      onEnter: () => {
        const chars = spread.querySelectorAll('.workshop__header .char');
        gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: 'power3.out', overwrite: true,
        });
      },
      once: true,
    });

    // Objects scatter in from different directions
    const objects = spread.querySelectorAll('[data-workshop-obj]');
    const origins = [
      { x: -120, y: 40, rotation: -15 },
      { x: 0, y: 80, rotation: 10 },
      { x: 120, y: -40, rotation: 8 },
      { x: -80, y: -60, rotation: -12 },
    ];

    objects.forEach((obj, i) => {
      const origin = origins[i % origins.length];
      gsap.from(obj, {
        x: origin.x,
        y: origin.y,
        rotation: origin.rotation,
        opacity: 0,
        scale: 0.85,
        duration: 0.8,
        ease: 'elastic.out(1, 0.75)',
        scrollTrigger: {
          trigger: obj,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // Parallax on objects
    if (!prefersReduced && window.innerWidth > 991) {
      objects.forEach((obj, i) => {
        gsap.to(obj, {
          y: (i % 2 === 0 ? -30 : 30),
          scrollTrigger: {
            trigger: spread,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }
  }

  /* ------------------------------------------------------------
     9. SPREAD 4: THE CREW
     ------------------------------------------------------------ */
  function initCrew() {
    const spread = document.getElementById('spread-4');
    if (!spread) return;

    // Split headline
    spread.querySelectorAll('[data-split]').forEach(el => {
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          span.appendChild(c);
        });
      });
    });

    // Header entrance
    ScrollTrigger.create({
      trigger: spread,
      start: 'top 70%',
      onEnter: () => {
        const chars = spread.querySelectorAll('.crew__header .char');
        gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: 'power3.out', overwrite: true,
        });
        const italic = spread.querySelector('.crew__header .headline__italic');
        if (italic) {
          gsap.from(italic, {
            scale: 0, rotation: -30, opacity: 0, duration: 0.6, ease: 'back.out(1.7)', delay: 0.4,
          });
        }
      },
      once: true,
    });

    // Polaroids scale in
    const members = spread.querySelectorAll('[data-crew-member]');
    members.forEach((m, i) => {
      gsap.from(m, {
        scale: 0.7,
        opacity: 0,
        rotation: (i % 2 === 0 ? -10 : 10),
        duration: 0.7,
        ease: 'elastic.out(1, 0.75)',
        scrollTrigger: {
          trigger: spread,
          start: 'top 50%',
          once: true,
        },
        delay: i * 0.12,
      });
    });

    // Stickers stamp in
    spread.querySelectorAll('.crew [data-sticker]').forEach((s, i) => {
      gsap.from(s, {
        scale: 3, rotation: -25, filter: 'blur(4px)', opacity: 0,
        duration: 0.5, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: s, start: 'top 90%', once: true },
        delay: 0.3 + i * 0.1,
      });
    });

    // SVG doodles draw
    spread.querySelectorAll('.doodle-svg .draw-path').forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: path.closest('.doodle-svg'), start: 'top 85%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------
     10. JOURNEY / JOURNAL — works on index.html spread-5 and team.html
     ------------------------------------------------------------ */
  function initJournal() {
    const entries = document.querySelectorAll('[data-journal-entry]');
    if (!entries.length) return;

    // Find the closest parent section for header trigger
    const spread = entries[0].closest('.spread') || entries[0].closest('.page-spread');
    const header = spread ? spread.querySelector('.journal__header, [data-split]') : null;

    // Split headline if present
    if (spread) {
      spread.querySelectorAll('[data-split]').forEach(el => {
        el.querySelectorAll('.char-wrap > span').forEach(span => {
          if (span.querySelector('.char')) return;
          const text = span.textContent;
          span.textContent = '';
          text.split('').forEach(char => {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = char;
            c.style.display = 'inline-block';
            span.appendChild(c);
          });
        });
      });

      // Header entrance
      ScrollTrigger.create({
        trigger: spread,
        start: 'top 70%',
        onEnter: () => {
          const chars = spread.querySelectorAll('[data-split] .char');
          if (chars.length) {
            gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, {
              yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: 'power3.out', overwrite: true,
            });
          }
        },
        once: true,
      });
    }

    // Timeline SVG line draw on scroll
    const track = document.querySelector('.journal__track');
    if (track) {
      const lineSvg = track.querySelector('.journal__line-svg');
      if (lineSvg) {
        const linePath = lineSvg.querySelector('path');
        if (linePath) {
          const length = linePath.getTotalLength();
          linePath.style.strokeDasharray = length;
          linePath.style.strokeDashoffset = length;
          gsap.to(linePath, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: 1,
            },
          });
        }
      }
    }

    // Entries slide in alternately
    entries.forEach((entry) => {
      const isLeft = entry.classList.contains('journal__entry--left');
      gsap.from(entry, {
        x: isLeft ? -80 : 80,
        opacity: 0,
        rotation: isLeft ? -8 : 8,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: entry,
          start: 'top 80%',
          once: true,
        },
      });
    });

    // Sticker animations
    if (spread) {
      spread.querySelectorAll('[data-sticker]').forEach(s => {
        gsap.from(s, {
          scale: 3, rotation: -25, filter: 'blur(4px)', opacity: 0,
          duration: 0.5, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: s, start: 'top 90%', once: true },
        });
      });
    }
  }

  /* ------------------------------------------------------------
     11. SPREAD 6: THE STAMPS
     ------------------------------------------------------------ */
  function initStamps() {
    const spread = document.getElementById('spread-6');
    if (!spread) return;

    // Split headline
    spread.querySelectorAll('[data-split]').forEach(el => {
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          span.appendChild(c);
        });
      });
    });

    // Header entrance
    ScrollTrigger.create({
      trigger: spread,
      start: 'top 70%',
      onEnter: () => {
        const chars = spread.querySelectorAll('.stamps__header .char');
        gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: 'power3.out', overwrite: true,
        });
      },
      once: true,
    });

    // Stamps appear one by one with stamp effect
    const stamps = spread.querySelectorAll('[data-stamp]');
    stamps.forEach((stamp, i) => {
      gsap.from(stamp, {
        scale: 3,
        rotation: gsap.utils.random(-30, 30),
        filter: 'blur(4px)',
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: spread,
          start: 'top 40%',
          once: true,
        },
        delay: i * 0.2,
      });
    });
  }

  /* ------------------------------------------------------------
     12. SPREAD 7: THE INVITATION
     ------------------------------------------------------------ */
  function initInvitation() {
    const spread = document.getElementById('spread-7');
    if (!spread) return;

    // Split headline
    spread.querySelectorAll('[data-split]').forEach(el => {
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          span.appendChild(c);
        });
      });
    });

    // Entrance timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: spread,
        start: 'top 60%',
        once: true,
      },
    });

    // Chars stagger in
    const chars = spread.querySelectorAll('.invitation__headline .char');
    tl.fromTo(chars, { yPercent: 120, opacity: 0 }, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.015,
      ease: 'power3.out',
    }, 0);

    // Robot slide in from left
    const robot = document.getElementById('invitation-robot');
    if (robot) {
      tl.to(robot, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, 0.4);
    }

    // CTA and socials
    const cta = spread.querySelector('.invitation__cta');
    if (cta) {
      tl.from(cta, {
        y: 40, opacity: 0, duration: 0.6, ease: 'power2.out',
      }, 0.6);
    }

    // Sticker
    spread.querySelectorAll('[data-sticker]').forEach((s, i) => {
      tl.from(s, {
        scale: 3, rotation: -25, filter: 'blur(4px)', opacity: 0,
        duration: 0.5, ease: 'back.out(1.7)',
      }, 0.8 + i * 0.15);
    });

    // Arrow draw
    spread.querySelectorAll('.doodle-svg .draw-path').forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
      }, 0.7);
    });
  }

  /* ------------------------------------------------------------
     13. GLOBAL STICKER ANIMATIONS
     ------------------------------------------------------------ */
  function initGlobalStickers() {
    document.querySelectorAll('[data-sticker]').forEach(s => {
      if (s.closest('.manifesto') || s.closest('.archive') || s.closest('.workshop') ||
          s.closest('.crew') || s.closest('.journal') || s.closest('.stamps') ||
          s.closest('.invitation')) return;
      gsap.from(s, {
        scale: 3, rotation: -25, filter: 'blur(4px)', opacity: 0,
        duration: 0.5, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: s, start: 'top 90%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------
     13b. TEAM WORKSTATIONS — scroll-triggered entrance
     ------------------------------------------------------------ */
  function initWorkstations() {
    document.querySelectorAll('[data-workstation]').forEach((ws, i) => {
      gsap.from(ws, {
        y: 60,
        opacity: 0,
        rotation: i % 2 === 0 ? -2 : 2,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ws,
          start: 'top 85%',
          once: true,
        },
        delay: i * 0.08,
      });
    });
  }

  /* ------------------------------------------------------------
     13c. WORK FOLDERS — scroll-triggered entrance
     ------------------------------------------------------------ */
  function initFolders() {
    document.querySelectorAll('.folder').forEach((folder, i) => {
      gsap.from(folder, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: folder,
          start: 'top 88%',
          once: true,
        },
        delay: i * 0.1,
      });
    });
  }

  /* ------------------------------------------------------------
     13d. GENERIC HEADLINE SPLIT — for pages without spread-specific init
     ------------------------------------------------------------ */
  function initGenericHeadlines() {
    document.querySelectorAll('[data-split]').forEach(el => {
      if (el.closest('.manifesto, .archive, .workshop, .crew, .journal, .stamps, .invitation')) return;
      el.querySelectorAll('.char-wrap > span').forEach(span => {
        if (span.querySelector('.char')) return;
        const text = span.textContent;
        span.textContent = '';
        text.split('').forEach(char => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = char;
          c.style.display = 'inline-block';
          span.appendChild(c);
        });
      });

      // Scroll-triggered reveal for this headline
      const chars = el.querySelectorAll('.char');
      if (chars.length) {
        gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        });
      }
    });
  }

  /* ------------------------------------------------------------
     14. WELCOME SCREEN
     ------------------------------------------------------------ */
  function initWelcome() {
    const screen = document.getElementById('welcome-screen');
    const tagline = document.getElementById('welcome-tagline');
    const enterBtn = document.getElementById('welcome-enter');
    if (!screen || !enterBtn) return;

    setTimeout(() => {
      if (tagline) {
        tagline.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        tagline.style.opacity = '1';
        tagline.style.transform = 'translateY(0)';
      }
    }, 600);

    setTimeout(() => {
      enterBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      enterBtn.style.opacity = '1';
      enterBtn.style.transform = 'translateY(0)';
    }, 900);

    function dismiss() {
      screen.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => { screen.style.display = 'none'; }, 600);
    }

    enterBtn.addEventListener('click', dismiss);
    screen.addEventListener('click', (e) => {
      if (e.target === screen) dismiss();
    });

    let scrolled = false;
    window.addEventListener('wheel', () => {
      if (!scrolled) { scrolled = true; dismiss(); }
    }, { passive: true });
  }

  /* ------------------------------------------------------------
     14b. PREMIUM PORTFOLIO EFFECTS (Seyi.dev / Portfolio redesign)
     ------------------------------------------------------------ */
  function initHeroParallax() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    gsap.to('.hero-title__line-left', {
      xPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero-title__line-right', {
      xPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  function initTerminalAnimation() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    const logs = [
      { text: "$ init agency_swarm_orchestrator", type: "input" },
      { text: "Loading custom LLM routing graph...", type: "info" },
      { text: "[OK] Core agent swarms initialized", type: "success" },
      { text: "$ compile ESP32 compiler --target=arm", type: "input" },
      { text: "Safety checks: MEMORY_SAFE_v3.0 is active", type: "info" },
      { text: "Sub-microsecond ISR latency achieved", type: "success" },
      { text: "$ inspect ROS2_Node /uav_swarm_sync", type: "input" },
      { text: "[WARN] Network packet jitter 3.5ms detected", type: "warning" },
      { text: "Syncing decentralized flight controllers...", type: "info" },
      { text: "[SUCCESS] Swarm synced. Latency: 42ms", type: "success" },
      { text: "$ deploy production_build_v2.4", type: "input" },
      { text: "Uploading WASM edge forecasts...", type: "info" },
      { text: "Starting multi-modal pipeline...", type: "info" },
      { text: "[SYSTEM OK] 100% active nodes green", type: "success" }
    ];

    let currentLogIndex = 0;

    function addLog() {
      if (currentLogIndex >= logs.length) {
        terminalBody.innerHTML = "";
        currentLogIndex = 0;
      }

      const log = logs[currentLogIndex];
      const logLine = document.createElement("div");
      logLine.className = "terminal-log";

      if (log.type === "input") {
        logLine.classList.add("terminal-log--input");
      } else if (log.type === "success") {
        logLine.classList.add("terminal-log--success");
      } else if (log.type === "warning") {
        logLine.classList.add("terminal-log--warning");
      }

      logLine.textContent = log.text;
      terminalBody.appendChild(logLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;

      currentLogIndex++;
      setTimeout(addLog, 1200 + Math.random() * 800);
    }

    addLog();
  }

  function initFooterClock() {
    const timeEl = document.querySelector('.time-clock');
    if (!timeEl) return;
    
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initAutoHeader() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    let timeout;
    document.addEventListener('mousemove', (e) => {
      if (e.clientY <= 80 || header.contains(e.target)) {
        clearTimeout(timeout);
        header.classList.add('is-hovered');
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (!header.matches(':hover')) {
            header.classList.remove('is-hovered');
          }
        }, 250);
      }
    });
  }

  function initHeaderThemeToggle() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    const darkSections = document.querySelectorAll('.spread--dark, .works-showcase, .premium-footer');
    darkSections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80px',
        end: 'bottom 80px',
        onEnter: () => header.classList.add('header-dark'),
        onLeave: () => header.classList.remove('header-dark'),
        onEnterBack: () => header.classList.add('header-dark'),
        onLeaveBack: () => header.classList.remove('header-dark')
      });
    });
  }

  /* ------------------------------------------------------------
     15. INIT
     ------------------------------------------------------------ */
  function init() {
    initWelcome();
    prepareDrawPaths();
    initEyeBlink();
    initManifesto();
    initArchive();
    initWorkshop();
    initCrew();
    initJournal();
    initStamps();
    initInvitation();
    initGlobalStickers();
    initWorkstations();
    initFolders();
    initGenericHeadlines();
    initHeroParallax();
    initTerminalAnimation();
    initFooterClock();
    initHeaderThemeToggle();
    initAutoHeader();
    addOpacitySafetyNet();

    // Refresh ScrollTrigger after all inits and layout settles
    ScrollTrigger.refresh();

    // Extra refresh after fonts/images load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(init);
    });
  } else {
    requestAnimationFrame(init);
  }

})();
