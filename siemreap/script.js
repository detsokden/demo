(function(){
'use strict';

/* ---------- Loader + hero entrance ---------- */
const overlay   = document.getElementById('loadingOverlay');
const wordmark  = document.getElementById('heroWordmark');
const heroVideo = document.getElementById('heroVideo');

document.body.classList.add('no-scroll');

let dismissed = false;

function dismissLoader(){
  if (dismissed) return;
  dismissed = true;

  overlay.classList.add('hidden');

  setTimeout(function(){
    wordmark.classList.add('animate');
    initReveal();
  }, 300);

  setTimeout(function(){
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }, 800);
}

/* Safety net — never trap the guest longer than 10s,
   even if the video fails or the connection is terrible. */
const MAX_WAIT = 10000;
const maxWaitTimer = setTimeout(dismissLoader, MAX_WAIT);

/* Central "video is ready and playing" handler.
   Dismiss the loader only once the video is genuinely on screen. */
function onVideoReady(){
  clearTimeout(maxWaitTimer);
  setTimeout(dismissLoader, 300);
}

if (heroVideo) {

  /* Fade the video in over the poster once it's actually playing */
  heroVideo.style.transition = 'opacity .8s ease';
  heroVideo.style.opacity = '0';

  /* Try to kick off playback as soon as possible */
  function attemptPlay(){
    const p = heroVideo.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function(){
        /* Autoplay rejected by browser — still dismiss the loader so
           the guest sees the poster + page, and retry on first interaction. */
        onVideoReady();

        const retry = function(){
          heroVideo.play().catch(function(){});
          document.removeEventListener('touchstart', retry);
          document.removeEventListener('click', retry);
          document.removeEventListener('scroll', retry);
        };
        document.addEventListener('touchstart', retry, { once:true, passive:true });
        document.addEventListener('click',      retry, { once:true });
        document.addEventListener('scroll',     retry, { once:true, passive:true });
      });
    }
  }

  /* Video is actually rendering frames → fade in + dismiss loader */
  heroVideo.addEventListener('playing', function(){
    heroVideo.style.opacity = '1';
    onVideoReady();
  });

  /* If already playing (cached, or autoplay fired instantly) */
  if (!heroVideo.paused && heroVideo.readyState >= 2) {
    heroVideo.style.opacity = '1';
    onVideoReady();
  } else {
    /* Fire playback attempts at each buffering milestone — whichever
       lands first wins. This is what fixes the "first visit stuck" bug. */
    heroVideo.addEventListener('loadeddata', attemptPlay, { once:true });
    heroVideo.addEventListener('canplay',    attemptPlay, { once:true });

    /* Also try immediately — helps on fast / cached loads */
    attemptPlay();
  }

  /* If the video errors entirely, don't hang the guest */
  heroVideo.addEventListener('error', function(){
    clearTimeout(maxWaitTimer);
    dismissLoader();
  }, { once:true });

} else {
  /* No video element — dismiss after a short beat */
  setTimeout(dismissLoader, 800);
}

/* ---------- Nav scrolled state ---------- */
const navbar = document.getElementById('navbar');
let navTicking = false;
window.addEventListener('scroll', function(){
  if (!navTicking) {
    requestAnimationFrame(function(){
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      navTicking = false;
    });
    navTicking = true;
  }
}, { passive: true });

/* ---------- Scroll-spy ---------- */
const navLinks = document.querySelectorAll('.nav-pill-group a');
const spySections = document.querySelectorAll('section[id]');
const spy = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if (entry.isIntersecting){
      const href = '#' + entry.target.id;
      navLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('href') === href); });
    }
  });
}, { rootMargin:'-45% 0px -50% 0px' });
spySections.forEach(function(s){ spy.observe(s); });

/* ---------- Mobile drawer ---------- */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');
function toggleMenu(){
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
  mobileOverlay.classList.toggle('active');
  const isOpen = mobileNav.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.body.classList.toggle('no-scroll', isOpen);
}
hamburger.addEventListener('click', toggleMenu);
mobileOverlay.addEventListener('click', toggleMenu);
if (mobileNavClose) mobileNavClose.addEventListener('click', toggleMenu);
document.querySelectorAll('.mobile-link').forEach(function(l){ l.addEventListener('click', toggleMenu); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && mobileNav.classList.contains('open')) toggleMenu(); });

/* ---------- Hero cursor glow ---------- */
(function(){
  const hero = document.getElementById('hero');
  const glow = document.getElementById('heroGlow');
  if (!hero || !glow) return;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover) return;

  let rafId = null;
  let latestX = 0, latestY = 0;

  hero.addEventListener('mousemove', function(e){
    const rect = hero.getBoundingClientRect();
    latestX = e.clientX - rect.left;
    latestY = e.clientY - rect.top;
    if (rafId === null) {
      rafId = requestAnimationFrame(function(){
        glow.style.transform = 'translate3d(' + (latestX - 210) + 'px,' + (latestY - 210) + 'px,0)';
        rafId = null;
      });
    }
  }, { passive: true });
})();

/* ---------- Pause hero video when tab is hidden ---------- */
(function(){
  const video = document.getElementById('heroVideo') || document.querySelector('.hero-media video');
  if (!video) return;
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { video.pause(); } else { video.play().catch(function(){}); }
  });
})();

/* =====================================================
   Booking CTA wiring
   - #navBookBtn, #mobileBookBtn, #bottomBookBtn → Cloudbeds
   - .bc-book (optional per-room book buttons)  → Cloudbeds
   - .bc-link (View Room links)                 → normal navigation
   ===================================================== */
const SIEM_REAP_PROP_ID = 'To64hk';

function buildCloudbedsUrl(accommodationType){
  let url = 'https://hotels.cloudbeds.com/en/reservation/' + SIEM_REAP_PROP_ID + '?currency=usd';
  if (accommodationType) url += '&accommodation_types=' + accommodationType;
  return url;
}
function goToCloudbeds(accommodationType){
  window.open(buildCloudbedsUrl(accommodationType), '_blank', 'noopener');
}

/* Only the three Book Now buttons open Cloudbeds directly.
   Room cards (.bc-link) are left alone so they navigate to the room page. */
document.querySelectorAll('#navBookBtn, #mobileBookBtn, #bottomBookBtn').forEach(function(btn){
  btn.addEventListener('click', function(e){
    e.preventDefault();
    goToCloudbeds();
  });
});

/* Optional: per-room Book buttons inside the cards */
document.querySelectorAll('.bc-book').forEach(function(btn){
  btn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    goToCloudbeds(btn.getAttribute('data-accommodation-type') || '');
  });
});

const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if (target){
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 90, behavior:'smooth' });
    }
  });
});
const conceptCta = document.getElementById('conceptCta');
if (conceptCta) conceptCta.addEventListener('click', function(){
  const el = document.querySelector('#rooms');
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
});
const guideDiscoverBtn = document.getElementById('guideDiscoverBtn');
if (guideDiscoverBtn) guideDiscoverBtn.addEventListener('click', function(){
  const el = document.querySelector('#guide');
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
});

/* ---------- Experience card cycler (tours) ---------- */
(function(){
  const data = [
    {
      img:   'uploads/section3/temple.webp',
      title: 'Sunrise at Angkor Wat, the world\'s most iconic temple.',
      loc:   '6–7 hours',
      dist:  'From $19 per tuk-tuk'
    },
    {
      img:   'uploads/section3/pub-street.webp',
      title: 'Floating village on the Tonle Sap — a life built on the water.',
      loc:   '4 hours',
      dist:  'From $21 per person'
    },
    {
      img:   'uploads/section3/old market.webp',
      title: 'Khmer street food after dark, through the night markets.',
      loc:   '3 hours',
      dist:  'From $14 per person'
    }
  ];

  const img   = document.getElementById('expImg');
  const title = document.getElementById('expTitle');
  const loc   = document.getElementById('expLoc');
  const dist  = document.getElementById('expDist');
  const prev  = document.getElementById('expPrev');
  const next  = document.getElementById('expNext');
  if (!img) return;

  let idx = 0;
  function render(i){
    idx = (i + data.length) % data.length;
    const d = data[idx];
    img.style.opacity = 0;
    setTimeout(function(){ img.src = d.img; img.alt = d.title; img.style.opacity = 1; }, 220);
    title.textContent = d.title;
    loc.textContent   = d.loc;
    dist.textContent  = d.dist;
  }

  if (prev) prev.addEventListener('click', function(e){ e.preventDefault(); render(idx - 1); });
  if (next) next.addEventListener('click', function(e){ e.preventDefault(); render(idx + 1); });
})();

/* ---------- Scroll reveal ---------- */
function initReveal(){
  /* Elements that already have bespoke tilted/offset compositions in CSS —
     leave their reveal fully class-driven so their designed resting
     position (rotation, staggered height, etc.) isn't clobbered. */
  const simpleTargets = document.querySelectorAll(
    '.concept-thumb, .cs-main, .cs-chip, .collage-single, .amenity-node'
  );

  /* Everything else gets the livelier, direction-varied pop-in:
     alternating sweep left / sweep right / rise+zoom / drop+settle,
     each with a soft blur-to-sharp finish instead of a flat float-up. */
  const dynamicTargets = document.querySelectorAll(
    '.concept-statement, .bento-card, .exp-card, .review-card, .guide-card, .gallery-bento img'
  );

  const variants = [
    { x: -90, y: 26, s: .82, r: -5, b: 11 },  // sweeps in from the left
    { x:  90, y: 26, s: .82, r:  5, b: 11 },  // sweeps in from the right
    { x:   0, y: 74, s: .76, r:  0, b: 14 },  // rises up while zooming in
    { x:   0, y: -55, s: .88, r:  0, b: 8  }  // drops down and settles
  ];

  /* Cycle the variant by an element's position among siblings sharing its
     parent, so neighbours in the same grid row/column alternate direction
     instead of every card doing the same thing. */
  const counters = new WeakMap();
  dynamicTargets.forEach(function(el){
    const key = el.parentElement || document.body;
    const i = counters.get(key) || 0;
    counters.set(key, i + 1);
    const v = variants[i % variants.length];
    const delay = (i % 4) * 0.08;

    el.style.opacity = '0';
    el.style.transform = 'translate3d(' + v.x + 'px,' + v.y + 'px,0) scale(' + v.s + ') rotate(' + v.r + 'deg)';
    el.style.filter = 'blur(' + v.b + 'px)';
    el.style.transition =
      'opacity 1.05s cubic-bezier(.16,1,.3,1) ' + delay + 's, ' +
      'transform 1.05s cubic-bezier(.16,1,.3,1) ' + delay + 's, ' +
      'filter 1s ease-out ' + delay + 's';
    el.style.willChange = 'transform, opacity, filter';
  });

  const targets = document.querySelectorAll(
    '.concept-statement, .concept-thumb, .cs-main, .cs-chip, .collage-single, .exp-card, ' +
    '.bento-card, .amenity-node, .review-card, .guide-card, .gallery-bento img'
  );
  const obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        const el = entry.target;
        setTimeout(function(){
          el.classList.add('reveal');
          if (el.style.transform){
            /* dynamic target: settle to identity transform + full clarity */
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0,0,0) scale(1) rotate(0deg)';
            el.style.filter = 'blur(0px)';
          }
        }, Math.random()*160);
        obs.unobserve(el);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
  targets.forEach(function(t){ obs.observe(t); });
}
if (document.readyState !== 'loading') initReveal();
else document.addEventListener('DOMContentLoaded', initReveal);

/* ============================================
   CUSTOM SCROLLBAR — drag, auto-hide (smooth)
   ============================================ */
(function(){
  const track = document.getElementById('customScrollbar');
  const thumb = document.getElementById('csThumb');
  if(!track || !thumb) return;

  const html = document.documentElement;
  let dragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;
  let hideTimer = null;

  function isBlocked(){
    const mm = document.getElementById('mobileNav');
    const lo = document.getElementById('loadingOverlay');
    if(mm && mm.classList.contains('open')) return true;
    if(lo && !lo.classList.contains('hidden')) return true;
    if(document.body.classList.contains('no-scroll')) return true;
    return false;
  }

  function metrics(){
    const trackH = track.clientHeight || window.innerHeight;
    const docH = html.scrollHeight;
    const winH = window.innerHeight;
    const maxScroll = Math.max(docH - winH, 0);
    const thumbH = Math.max((winH / docH) * trackH, 40);
    const travel = trackH - thumbH;
    return { trackH, docH, winH, maxScroll, thumbH, travel };
  }

  function paintThumb(){
    const m = metrics();
    if(m.maxScroll < 20){
      track.classList.remove('visible');
      thumb.style.height = '0px';
      return;
    }
    const scrollTop = window.scrollY || html.scrollTop;
    const ratio = m.maxScroll > 0 ? scrollTop / m.maxScroll : 0;
    const y = m.travel * ratio;
    thumb.style.height = m.thumbH + 'px';
    thumb.style.transform = 'translateY(' + y + 'px)';
    track.classList.add('visible');
  }

  function scheduleHide(){
    if(hideTimer) clearTimeout(hideTimer);
    if(dragging) return;
    hideTimer = setTimeout(function(){
      if(!dragging) track.classList.remove('visible');
    }, 1400);
  }

  function update(){
    if(isBlocked()){ track.classList.remove('visible'); return; }
    paintThumb();
    scheduleHide();
  }

  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);

  window.addEventListener('mousemove', function(e){
    if(dragging) return;
    if(e.clientX > window.innerWidth - 40){
      track.classList.add('visible');
      paintThumb();
      if(hideTimer) clearTimeout(hideTimer);
    }
  });

  function startDrag(clientY){
    dragging = true;
    dragStartY = clientY;
    dragStartScroll = window.scrollY || html.scrollTop;
    /* Kill smooth-scroll so drag tracks the cursor 1:1 */
    html.style.scrollBehavior = 'auto';
    track.classList.add('dragging');
    track.classList.add('visible');
    if(hideTimer) clearTimeout(hideTimer);
  }

  function moveDrag(clientY){
    if(!dragging) return;
    const m = metrics();
    if(m.travel <= 0) return;

    const deltaY = clientY - dragStartY;
    const scrollPerPixel = m.maxScroll / m.travel;
    let newScroll = dragStartScroll + deltaY * scrollPerPixel;

    if(newScroll < 0) newScroll = 0;
    if(newScroll > m.maxScroll) newScroll = m.maxScroll;

    window.scrollTo(0, newScroll);
  }

  function endDrag(){
    if(!dragging) return;
    dragging = false;
    html.style.scrollBehavior = '';
    track.classList.remove('dragging');
    scheduleHide();
  }

  thumb.addEventListener('mousedown', function(e){ e.preventDefault(); startDrag(e.clientY); });
  window.addEventListener('mousemove', function(e){ if(dragging) moveDrag(e.clientY); });
  window.addEventListener('mouseup', endDrag);

  thumb.addEventListener('touchstart', function(e){
    if(e.touches.length !== 1) return;
    startDrag(e.touches[0].clientY);
  }, { passive:true });

  thumb.addEventListener('touchmove', function(e){
    if(!dragging) return;
    if(e.touches.length !== 1) return;
    moveDrag(e.touches[0].clientY);
    e.preventDefault();
  }, { passive:false });

  thumb.addEventListener('touchend', endDrag);
  thumb.addEventListener('touchcancel', endDrag);

  update();
})();

})();