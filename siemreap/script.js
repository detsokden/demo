(function(){
'use strict';

/* ---------- Loader + hero entrance ---------- */
const overlay   = document.getElementById('loadingOverlay');
const wordmark  = document.getElementById('heroWordmark');
const annotA    = document.getElementById('annotA');
const annotB    = document.getElementById('annotB');
const heroVideo = document.getElementById('heroVideo');

document.body.classList.add('no-scroll');

let dismissed = false;

function dismissLoader(){
  if (dismissed) return;
  dismissed = true;

  overlay.classList.add('hidden');

  setTimeout(function(){
    wordmark.classList.add('animate');
    setTimeout(function(){ annotA.classList.add('animate'); }, 250);
    setTimeout(function(){ annotB.classList.add('animate'); }, 420);
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

const contactBtn = document.getElementById('contactBtn');
if (contactBtn) contactBtn.addEventListener('click', function(){
  window.location.href = 'mailto:sonitoririverside.info@gmail.com';
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
  const targets = document.querySelectorAll(
    '.concept-statement, .concept-thumb, .cs-main, .cs-chip, .collage-single, .exp-card, ' +
    '.bento-card, .amenity-node, .review-card, .guide-card, .gallery-bento img'
  );
  const obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        setTimeout(function(){ entry.target.classList.add('reveal'); }, Math.random()*180);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
  targets.forEach(function(t){ obs.observe(t); });
}
if (document.readyState !== 'loading') initReveal();
else document.addEventListener('DOMContentLoaded', initReveal);

})();