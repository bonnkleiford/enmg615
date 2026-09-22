/* =========================================================================
   ENMG 615 — Deterministic Optimization Models
   Small, optional page behaviors.
   -------------------------------------------------------------------------
   This file is intentionally short. Nothing here is required for the page
   to work — if you delete this file (and its <script> tag in index.html),
   the page still looks and reads fine. It just adds two nice-to-haves:

     1. Auto-updates the "last updated" year in the footer.
     2. Highlights the current section's link in the top navigation as
        you scroll down the page.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------------------------------------
     1. Footer year
     Looks for an element with id="current-year" and fills in today's year,
     so you never have to remember to update it by hand.
     ----------------------------------------------------------------------- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------------------
     2. Active navigation highlight
     As the visitor scrolls, this adds a class of "active" to the nav link
     that matches the section currently in view.
     ----------------------------------------------------------------------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.site-nav a');

  function highlightNav() {
    var scrollPos = window.scrollY + 120; // offset for sticky header

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');
      var link = document.querySelector('.site-nav a[href="#' + id + '"]');

      if (!link) return;

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNav);
  highlightNav();
});
