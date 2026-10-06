/**
 * WordHive Landing Page — Main Entry Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobile-menu-toggle');
  const links = document.querySelector('.navbar__links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('navbar__links--open');
    });
  }

  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
