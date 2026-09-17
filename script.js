(function(){
'use strict';

// Loading overlay
const overlay = document.getElementById('loadingOverlay');
const heroContent = document.getElementById('heroContent');
document.body.style.overflow = 'hidden';
setTimeout(function(){
  overlay.classList.add('hidden');
  setTimeout(function(){ heroContent.classList.add('animate'); initScrollReveal(); }, 500);
  setTimeout(function(){ overlay.style.display='none'; document.body.style.overflow=''; }, 900);
}, 2200);

// Hero slideshow
const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;
if (slides.length){
  setInterval(function(){
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide+1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 6000);
}

// Navbar scroll state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function(){
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Scroll-spy active nav link — now syncs BOTH desktop nav and the mobile drawer
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileLinks = document.querySelectorAll('.mobile-link');
const spy = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if (entry.isIntersecting){
      const href = '#' + entry.target.id;
      navLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('href') === href); });
      mobileLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('href') === href); });
    }
  });
}, { rootMargin:'-40% 0px -50% 0px' });
sections.forEach(function(s){ spy.observe(s); });

// Mobile menu
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
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
hamburger.addEventListener('click', toggleMenu);
mobileOverlay.addEventListener('click', toggleMenu);
if (mobileNavClose) mobileNavClose.addEventListener('click', toggleMenu);
document.querySelectorAll('.mobile-link').forEach(function(l){ l.addEventListener('click', toggleMenu); });
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) toggleMenu();
});

// Booking modal
const modal = document.getElementById('bookingModal');
function openModal(){ modal.classList.add('active'); document.body.style.overflow='hidden'; }
function closeModal(){ modal.classList.remove('active'); document.body.style.overflow=''; }
['navBookBtn','mobileBookBtn','bottomBookBtn','heroBookBtn'].forEach(function(id){
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', function(e){ e.preventDefault(); openModal(); });
});
document.querySelectorAll('.modal-option').forEach(function(btn){
  btn.addEventListener('click', function(){
    const propId = this.dataset.prop;
    if (!propId) return;
    window.open('https://hotels.cloudbeds.com/en/reservation/'+propId, '_blank');
    closeModal();
  });
});
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', function(e){ if (e.target===modal) closeModal(); });
document.addEventListener('keydown', function(e){ if (e.key==='Escape') closeModal(); });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if (target && !this.closest('.bottom-nav')){
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top:top, behavior:'smooth' });
    }
  });
});

// Scroll reveal (cards + carved rules) + count-up stats
function animateCount(el, target, suffix){
  const duration = 1200, start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/duration, 1);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = (target*eased).toFixed(target % 1 !== 0 ? 1 : 0) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function initScrollReveal(){
  const revealTargets = document.querySelectorAll('.dest-card, .direct-item, .g-item, .section-head, .review-comment, .carved-rule');
  const revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        setTimeout(function(){ entry.target.classList.add('reveal'); }, Math.random()*200);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -30px 0px' });
  revealTargets.forEach(function(t){ revealObs.observe(t); });

  document.querySelectorAll('.stat-number').forEach(function(el){
    if (el.hasAttribute('data-nocount')) return;
    const raw = el.textContent.trim();
    const target = parseFloat(raw);
    const suffix = raw.replace(/[0-9.]/g,'');
    const obs = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting){ animateCount(el, target, suffix); obs.disconnect(); }
    }, { threshold:0.5 });
    obs.observe(el);
  });
}

// Hero parallax — background drifts slightly slower than scroll for depth
(function(){
  const slideshow = document.querySelector('.hero-slideshow');
  if (!slideshow) return;
  let ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2){
        slideshow.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      }
      ticking = false;
    });
  }, { passive:true });
})();

// Cursor-tilt on destination and gallery cards — subtle, capped low
(function(){
  const tiltEls = document.querySelectorAll('.dest-card, .g-item');
  tiltEls.forEach(function(card){
    card.addEventListener('mousemove', function(e){
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateX(' + (y * -3.5) + 'deg) rotateY(' + (x * 3.5) + 'deg)';
    });
    card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
  });
})();

// Lightbox gallery
const items = document.querySelectorAll('.g-item');
const images = [];
items.forEach(function(item){
  const img = item.querySelector('img');
  if (img) images.push(img.src);
  item.addEventListener('click', function(){
    const idx = parseInt(this.dataset.index, 10);
    openLightbox(isNaN(idx) ? Array.from(items).indexOf(this) : idx);
  });
});
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let currentIndex = 0;
function openLightbox(i){
  if (!images.length) return;
  currentIndex = (i+images.length) % images.length;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function updateLightbox(){ lightboxImg.src = images[currentIndex]; }
function closeLightbox(){ lightbox.classList.remove('active'); document.body.style.overflow=''; }
document.getElementById('closeLightbox').addEventListener('click', closeLightbox);
document.getElementById('prevBtn').addEventListener('click', function(e){ e.stopPropagation(); currentIndex=(currentIndex-1+images.length)%images.length; updateLightbox(); });
document.getElementById('nextBtn').addEventListener('click', function(e){ e.stopPropagation(); currentIndex=(currentIndex+1)%images.length; updateLightbox(); });
document.addEventListener('keydown', function(e){
  if (!lightbox.classList.contains('active')) return;
  if (e.key==='Escape') closeLightbox();
  else if (e.key==='ArrowLeft'){ currentIndex=(currentIndex-1+images.length)%images.length; updateLightbox(); }
  else if (e.key==='ArrowRight'){ currentIndex=(currentIndex+1)%images.length; updateLightbox(); }
});

// Custom scrollbar
(function(){
  const wrapper = document.getElementById('scrollWrapper');
  const track = document.getElementById('scrollTrack');
  const thumb = document.getElementById('scrollThumb');
  if (!wrapper || !track || !thumb) return;

  let isDragging = false, dragStartY = 0, dragStartTop = 0;
  let viewportH = window.innerHeight, docH = document.documentElement.scrollHeight;
  let trackH = track.clientHeight, thumbH = 0, maxTop = 0;

  function recalc(){
    viewportH = window.innerHeight;
    docH = document.documentElement.scrollHeight;
    trackH = track.clientHeight;
    thumbH = Math.max(40, (viewportH / docH) * trackH);
    maxTop = trackH - thumbH;
    thumb.style.height = thumbH + 'px';
  }

  function sync(){
    if (isDragging) return;
    recalc();
    if (docH <= viewportH){ wrapper.style.opacity = '0'; return; }
    wrapper.style.opacity = '1';
    const maxScroll = docH - viewportH;
    const pct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    thumb.style.top = (pct * maxTop) + 'px';
    thumb.setAttribute('aria-valuenow', Math.round(pct * 100));
  }

  function startDrag(e){
    isDragging = true;
    dragStartY = e.clientY;
    dragStartTop = parseFloat(thumb.style.top) || 0;
    recalc();
    thumb.classList.add('dragging');
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    // override the page's smooth-scroll CSS while dragging — some browsers
    // still ease scrollTo() calls even with behavior:'auto' unless this is
    // forced, which is what causes the page to lag then jump/snap to catch
    // up with the cursor instead of tracking it 1:1.
    document.documentElement.style.scrollBehavior = 'auto';
    // pointer capture guarantees this element keeps receiving move/up events
    // even if the cursor leaves the thumb, the window, or moves very fast —
    // this is what prevents the thumb from "sticking" mid-drag.
    if (thumb.setPointerCapture) {
      try { thumb.setPointerCapture(e.pointerId); } catch(err) {}
    }
  }

  let rafId = null;
  let pendingClientY = null;

  function applyDrag(){
    rafId = null;
    if (!isDragging || pendingClientY === null) return;
    const newTop = Math.max(0, Math.min(maxTop, dragStartTop + (pendingClientY - dragStartY)));
    thumb.style.top = newTop + 'px';
    const pct = maxTop > 0 ? newTop / maxTop : 0;
    window.scrollTo({ top: pct * (docH - viewportH), behavior:'auto' });
    thumb.setAttribute('aria-valuenow', Math.round(pct * 100));
  }

  function duringDrag(e){
    if (!isDragging) return;
    pendingClientY = e.clientY;
    // coalesce rapid pointermove events into one update per animation frame —
    // this is what removes the micro-stutter on fast mice/trackpads
    if (rafId === null) rafId = requestAnimationFrame(applyDrag);
  }

  function endDrag(){
    if (!isDragging) return;
    isDragging = false;
    pendingClientY = null;
    if (rafId !== null){ cancelAnimationFrame(rafId); rafId = null; }
    thumb.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.documentElement.style.scrollBehavior = '';
    sync();
  }

  thumb.addEventListener('pointerdown', function(e){
    e.preventDefault();
    startDrag(e);
  });
  thumb.addEventListener('pointermove', duringDrag);
  thumb.addEventListener('pointerup', endDrag);
  thumb.addEventListener('pointercancel', endDrag);
  // belt-and-suspenders: also release if the pointer capture is somehow lost
  thumb.addEventListener('lostpointercapture', endDrag);

  track.addEventListener('click', function(e){
    if (e.target === thumb || isDragging) return;
    recalc();
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const targetTop = Math.max(0, Math.min(maxTop, clickY - thumbH/2));
    const pct = maxTop > 0 ? targetTop / maxTop : 0;
    window.scrollTo({ top: pct * (docH - viewportH), behavior:'smooth' });
  });
  thumb.addEventListener('keydown', function(e){
    const step = e.shiftKey ? 200 : 40;
    let delta = 0;
    if (e.key === 'ArrowUp') delta = -step;
    else if (e.key === 'ArrowDown') delta = step;
    else return;
    e.preventDefault();
    window.scrollTo({ top: window.scrollY + delta, behavior:'smooth' });
  });

  window.addEventListener('scroll', sync, { passive:true });
  window.addEventListener('resize', sync);
  setTimeout(sync, 200);
  window.addEventListener('load', function(){ setTimeout(sync, 300); });
  if (window.ResizeObserver) new ResizeObserver(sync).observe(document.body);
})();


function initHotelMap(){
  const mapContainer = document.getElementById('hotelMap');
  const mapLoading = document.getElementById('mapLoading');
  if (!mapContainer) return;
  const hotels = [
    { name:'Sonitori Riverside', lat:13.354810, lng:103.858515, street:'Street 25, Wat Bo Village, Siem Reap, Cambodia', contact:'+855 87 759 779', email:'sonitoririverside.info@gmail.com', color:'#038494', label:'S', link:'https://maps.app.goo.gl/k5sk6z2wDwDNrJue8' },
    { name:'Sonitori Phnom Penh', lat:11.597487, lng:104.937100, street:'No 33, St 122, Sangkat Boeung Keng Kang 1, Phnom Penh, Cambodia', contact:'+855 17 992 240', email:'reservation.sonitori@gmail.com', color:'#9C4A34', label:'P', link:'https://maps.app.goo.gl/qMuedTQveapqJjLG8' }
  ];
  function build(){
    try {
      const centerLat = (hotels[0].lat + hotels[1].lat)/2;
      const centerLng = (hotels[0].lng + hotels[1].lng)/2;
      const map = L.map(mapContainer, { zoomControl:false, scrollWheelZoom:false, doubleClickZoom:false, boxZoom:false, dragging:true, touchZoom:false }).setView([centerLat, centerLng], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 7
}).addTo(map);
      if (mapLoading) setTimeout(function(){ mapLoading.classList.add('hidden'); }, 300);
      hotels.forEach(function(h){
        const icon = L.divIcon({
          className:'hotel-pin',
          html:'<div style="background:'+h.color+';width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.25);border:2px solid #F8F4EA;"><span style="transform:rotate(45deg);color:#F8F4EA;font-weight:700;font-size:13px;font-family:Inter,sans-serif;">'+h.label+'</span></div>',
          iconSize:[40,40], iconAnchor:[20,40], popupAnchor:[0,-40]
        });
        const marker = L.marker([h.lat, h.lng], { icon:icon }).addTo(map);
        marker.bindPopup(
          '<div class="hotel-popup"><div class="popup-name" style="border-bottom-color:'+h.color+';">'+h.name+'</div>'+
          '<div class="popup-detail"><span class="label">Street</span><span>'+h.street+'</span></div>'+
          '<div class="popup-detail"><span class="label">Contact</span><span>'+h.contact+'</span></div>'+
          '<div class="popup-detail"><span class="label">Email</span><span><a href="mailto:'+h.email+'">'+h.email+'</a></span></div>'+
          '<a href="'+h.link+'" target="_blank" class="map-link-btn" style="border-color:'+h.color+';">Open in Google Maps</a></div>',
          { maxWidth:300, minWidth:220 }
        );
      });
      const bounds = L.latLngBounds([[hotels[0].lat,hotels[0].lng],[hotels[1].lat,hotels[1].lng]]);
      map.fitBounds(bounds, { padding:[60,60] });
      setTimeout(function(){ map.invalidateSize(); }, 400);
      window.addEventListener('resize', function(){ map.invalidateSize(); });
    } catch(err){ console.error('Map error:', err); }
  }
  if (typeof L !== 'undefined'){ build(); return; }
  const link = document.createElement('link');
  link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  const script = document.createElement('script');
  script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = build;
  document.head.appendChild(script);
}
window.addEventListener('load', function(){ setTimeout(initHotelMap, 500); });

})();