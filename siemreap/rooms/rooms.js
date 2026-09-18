/* ============================================
   SONITORI RIVERSIDE — ROOM PAGE SCRIPT
   Shared across all 4 room detail pages
   Auto-detects content per page
   ============================================ */

(function(){
  'use strict';

  const PROP_ID = 'To64hk';

  /* ============================================
     UTILITIES
     ============================================ */
  const pad2 = n => String(n).padStart(2, '0');
  const isoFrom = (y, m, d) => y + '-' + pad2(m + 1) + '-' + pad2(d);
  const todayISO = () => {
    const d = new Date();
    return isoFrom(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const parseISO = s => {
    const [y, m, d] = s.split('-').map(Number);
    return { y, m: m - 1, d };
  };
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = s => {
    const { y, m, d } = parseISO(s);
    return MONTHS_SHORT[m] + ' ' + d + ', ' + y;
  };
  const nightsBetween = (a, b) =>
    Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

  /* ============================================
     PAGE LOADER
     ============================================ */
  (function(){
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    let hidden = false;
    function hide(){
      if (hidden) return;
      hidden = true;
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden','true');
      setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
    }
    window.addEventListener('load', () => setTimeout(hide, 250));
    setTimeout(hide, 2500);
  })();

  /* ============================================
     FIXED NAV — shadow on scroll
     ============================================ */
  (function(){
    const nav = document.querySelector('.topnav');
    if (!nav) return;
    function onScroll(){
      if (window.scrollY > 10) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  })();

  /* ============================================
     CUSTOM SCROLLBAR — real-time drag
     ============================================ */
  (function(){
    const track = document.getElementById('customScrollbar');
    const thumb = document.getElementById('csThumb');
    if (!track || !thumb) return;

    const html = document.documentElement;
    let dragging = false;
    let dragStartY = 0;
    let dragStartScroll = 0;
    let hideTimer = null;

    function isBlocked(){
      const lb = document.getElementById('lightboxOverlay');
      const dm = document.getElementById('dateModalOverlay');
      const mm = document.getElementById('mobileMenu');
      if (lb && lb.classList.contains('open')) return true;
      if (dm && dm.classList.contains('open')) return true;
      if (mm && mm.classList.contains('open')) return true;
      return false;
    }

    function metrics(){
      const navH = parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 70;
      const trackH = window.innerHeight - navH;
      const docH = html.scrollHeight;
      const winH = window.innerHeight;
      const maxScroll = Math.max(docH - winH, 0);
      const thumbH = Math.max((winH / docH) * trackH, 40);
      const travel = trackH - thumbH;
      return { docH, winH, maxScroll, thumbH, travel };
    }

    function paintThumb(){
      const m = metrics();
      if (m.maxScroll < 20){
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
      if (hideTimer) clearTimeout(hideTimer);
      if (dragging) return;
      hideTimer = setTimeout(() => { if (!dragging) track.classList.remove('visible'); }, 1400);
    }

    function update(){
      if (isBlocked()){ track.classList.remove('visible'); return; }
      paintThumb();
      scheduleHide();
    }

    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);

    window.addEventListener('mousemove', (e) => {
      if (dragging) return;
      if (e.clientX > window.innerWidth - 40){
        track.classList.add('visible');
        paintThumb();
        if (hideTimer) clearTimeout(hideTimer);
      }
    });

    function startDrag(y){
      dragging = true;
      dragStartY = y;
      dragStartScroll = window.scrollY || html.scrollTop;
      html.classList.remove('smooth-scroll');
      track.classList.add('dragging');
      track.classList.add('visible');
      if (hideTimer) clearTimeout(hideTimer);
    }

    function moveDrag(y){
      if (!dragging) return;
      const m = metrics();
      if (m.travel <= 0) return;
      const deltaY = y - dragStartY;
      const scrollPerPixel = m.maxScroll / m.travel;
      let newScroll = dragStartScroll + deltaY * scrollPerPixel;
      if (newScroll < 0) newScroll = 0;
      if (newScroll > m.maxScroll) newScroll = m.maxScroll;
      window.scrollTo({ top: newScroll, left: 0, behavior: 'auto' });
    }

    function endDrag(){
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      scheduleHide();
    }

    /* Mouse */
    thumb.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientY); });
    window.addEventListener('mousemove', (e) => { if (dragging) moveDrag(e.clientY); });
    window.addEventListener('mouseup', endDrag);

    /* Touch */
    thumb.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startDrag(e.touches[0].clientY);
    }, { passive:true });

    thumb.addEventListener('touchmove', (e) => {
      if (!dragging || e.touches.length !== 1) return;
      moveDrag(e.touches[0].clientY);
      e.preventDefault();
    }, { passive:false });

    thumb.addEventListener('touchend', endDrag);
    thumb.addEventListener('touchcancel', endDrag);

    update();
  })();

  /* ============================================
     MOBILE MENU
     ============================================ */
  (function(){
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('mobileClose');
    if (!hamburger || !menu) return;

    let lastFocused = null;

    function toggle(forceClose){
      const isOpen = forceClose === true ? false : !menu.classList.contains('open');
      menu.classList.toggle('open', isOpen);
      menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        lastFocused = document.activeElement;
        const first = menu.querySelector('a, button');
        if (first) first.focus();
      } else if (lastFocused) {
        lastFocused.focus();
      }
    }

    hamburger.addEventListener('click', () => toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => toggle(true));
    menu.querySelectorAll('[data-close-menu]').forEach(el =>
      el.addEventListener('click', () => toggle(true))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) toggle(true);
    });
  })();

  /* ============================================
     LIGHTBOX
     ============================================ */
  (function(){
    const gallery = document.getElementById('roomGallery');
    const lightbox = document.getElementById('lightboxOverlay');
    if (!gallery || !lightbox) return;

    const lbImg = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const counter = document.getElementById('lightboxCounter');
    const thumbsContainer = document.getElementById('lightboxThumbs');

    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    const urls = items.map(it => {
      const img = it.querySelector('img');
      return img ? img.getAttribute('src') : null;
    }).filter(Boolean);
    if (!urls.length) return;

    let idx = 0;

    function buildThumbs(){
      thumbsContainer.innerHTML = '';
      urls.forEach((u, i) => {
        const th = document.createElement('img');
        th.src = u;
        th.className = 'thumb-item' + (i === idx ? ' active' : '');
        th.setAttribute('data-index', i);
        th.setAttribute('alt', '');
        th.addEventListener('click', (e) => { e.stopPropagation(); open(i); });
        thumbsContainer.appendChild(th);
      });
    }

    function open(i){
      if (i < 0) i = urls.length - 1;
      if (i >= urls.length) i = 0;
      idx = i;
      lbImg.src = urls[idx];
      counter.textContent = (idx + 1) + ' / ' + urls.length;
      thumbsContainer.querySelectorAll('.thumb-item').forEach((th, k) => {
        th.classList.toggle('active', k === idx);
      });
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    items.forEach((it, i) => it.addEventListener('click', () => open(i)));
    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); open(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); open(idx + 1); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && prevBtn) { prevBtn.click(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && nextBtn) { nextBtn.click(); e.preventDefault(); }
    });

    buildThumbs();
  })();

  /* ============================================
     DATE PICKER MODAL
     All .room-book / .room-book-dates buttons
     open the modal first. Cloudbeds opens only
     after both dates are selected + submitted.
     ============================================ */
  (function(){
    const overlay = document.getElementById('dateModalOverlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('dateModalClose');
    const errorEl = document.getElementById('dateModalError');
    const submitBtn = document.getElementById('dateModalSubmit');
    const titleEl = document.getElementById('dateModalTitle');
    const chipIn = document.getElementById('chipCheckin');
    const chipOut = document.getElementById('chipCheckout');
    const chipInVal = document.getElementById('chipCheckinValue');
    const chipOutVal = document.getElementById('chipCheckoutValue');
    const nightsEl = document.getElementById('dateNights');
    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');
    const calMonthLabel = document.getElementById('calMonthLabel');
    const calGrid = document.getElementById('calGrid');

    let currentAccType = '';
    let checkin = null, checkout = null, hover = null;
    let viewYear, viewMonth;

    function resetView(){
      const t = new Date();
      viewYear = t.getFullYear();
      viewMonth = t.getMonth();
    }

    function renderCal(){
      calMonthLabel.textContent = MONTHS[viewMonth] + ' ' + viewYear;
      const today = todayISO();
      const first = new Date(viewYear, viewMonth, 1);
      const startWd = first.getDay();
      const days = new Date(viewYear, viewMonth + 1, 0).getDate();

      const frag = document.createDocumentFragment();
      for (let i = 0; i < startWd; i++) {
        const b = document.createElement('span');
        b.className = 'cal-day cal-day-empty';
        frag.appendChild(b);
      }
      for (let d = 1; d <= days; d++) {
        const isoStr = isoFrom(viewYear, viewMonth, d);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-day';
        btn.textContent = String(d);
        btn.setAttribute('data-date', isoStr);

        const past = isoStr < today;
        const isToday = isoStr === today;
        const isIn = isoStr === checkin;
        const isOut = isoStr === checkout;
        let inRange = false;
        if (checkin && checkout && isoStr > checkin && isoStr < checkout) inRange = true;
        else if (checkin && !checkout && hover && isoStr > checkin && isoStr < hover) inRange = true;

        if (past) { btn.classList.add('is-disabled'); btn.disabled = true; }
        if (isToday) btn.classList.add('is-today');
        if (isIn) btn.classList.add('is-selected', 'is-range-start');
        if (isOut) btn.classList.add('is-selected', 'is-range-end');
        if (inRange) btn.classList.add('is-in-range');
        if (checkin && !checkout && hover && isoStr === hover && isoStr > checkin)
          btn.classList.add('is-hover-end');

        frag.appendChild(btn);
      }
      calGrid.innerHTML = '';
      calGrid.appendChild(frag);
      const now = new Date();
      calPrev.disabled = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    }

    function updateSummary(){
      if (checkin) { chipInVal.textContent = fmtDate(checkin); chipIn.classList.add('is-filled'); }
      else { chipInVal.textContent = 'Select date'; chipIn.classList.remove('is-filled'); }

      if (checkout) { chipOutVal.textContent = fmtDate(checkout); chipOut.classList.add('is-filled'); }
      else { chipOutVal.textContent = 'Select date'; chipOut.classList.remove('is-filled'); }

      if (checkin && checkout) {
        const n = nightsBetween(checkin, checkout);
        nightsEl.textContent = n + (n === 1 ? ' night' : ' nights');
        nightsEl.classList.add('is-visible');
        submitBtn.disabled = false;
        errorEl.textContent = '';
      } else {
        nightsEl.textContent = '';
        nightsEl.classList.remove('is-visible');
        submitBtn.disabled = true;
      }
    }

    function openModal(trigger){
      currentAccType = trigger.getAttribute('data-accommodation-type') || '';
      const name = trigger.getAttribute('data-room-name') || '';
      if (name && titleEl) titleEl.textContent = name;
      checkin = checkout = hover = null;
      errorEl.textContent = '';
      resetView();
      updateSummary();
      renderCal();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    /* Wire ALL booking buttons to open the date modal */
    document.querySelectorAll('.room-book, .room-book-dates').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(trigger);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    calPrev.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCal();
    });
    calNext.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCal();
    });

    calGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-day');
      if (!btn || btn.disabled || !btn.hasAttribute('data-date')) return;
      const isoStr = btn.getAttribute('data-date');
      if (!checkin || (checkin && checkout)) {
        checkin = isoStr; checkout = null; hover = null;
      } else if (checkin && !checkout) {
        if (isoStr > checkin) checkout = isoStr;
        else checkin = isoStr;
        hover = null;
      }
      updateSummary();
      renderCal();
    });

    calGrid.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('.cal-day');
      if (!btn || btn.disabled || !btn.hasAttribute('data-date')) return;
      if (checkin && !checkout) {
        const isoStr = btn.getAttribute('data-date');
        if (isoStr !== hover) { hover = isoStr; renderCal(); }
      }
    });

    /* Open Cloudbeds ONLY after both dates selected */
    submitBtn.addEventListener('click', () => {
      if (!checkin || !checkout) {
        errorEl.textContent = 'Please select both dates.';
        return;
      }
      let url = 'https://hotels.cloudbeds.com/en/reservation/' + PROP_ID
              + '/?currency=usd'
              + '&checkin=' + checkin
              + '&checkout=' + checkout;
      if (currentAccType) url += '&accommodation_types=' + currentAccType;
      window.open(url, '_blank', 'noopener');
      closeModal();
    });
  })();

  /* ============================================
     FOOTER YEAR
     ============================================ */
  (function(){
    const y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
  })();

})();