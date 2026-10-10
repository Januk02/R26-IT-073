/**
 * STUDYFYX (R26-IT-073) - Research Website Interactions
 * Lightweight vanilla JavaScript, no external dependencies.
 */

// Shared Google Drive folder for research documents and presentations.
const RESEARCH_FOLDER_URL = "https://drive.google.com/drive/folders/1j5qwz5YjAbGDTKUu_reXCLSNUxUxt5uj?usp=drive_link";

document.documentElement.classList.add('js');
let modalTrigger = null;

function openResearchDocument(title, meta, description) {
  const modal = document.getElementById('academicModal');
  if (!modal) {
    if (RESEARCH_FOLDER_URL.trim()) window.open(RESEARCH_FOLDER_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMeta').textContent = meta || 'Research Project R26-IT-073';
  document.getElementById('modalDesc').textContent = description || '';

  const cloudBtn = document.getElementById('modalCloudBtn');
  const note = document.getElementById('modalNote');
  if (RESEARCH_FOLDER_URL.trim()) {
    cloudBtn.style.display = '';
    if (note) note.style.display = 'none';
    cloudBtn.onclick = () => window.open(RESEARCH_FOLDER_URL, '_blank', 'noopener,noreferrer');
  } else {
    cloudBtn.style.display = 'none';
    if (note) note.style.display = '';
  }
  modalTrigger = document.activeElement;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close')?.focus();
}

function closeAcademicModal() {
  const modal = document.getElementById('academicModal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('modal-open');
  modalTrigger?.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile menu
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (navToggle && navMenu) {
    const closeMenu = () => { navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); };
    navMenu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && navMenu.classList.contains('open')) { closeMenu(); navToggle.focus(); } });
  }

  // 2. Milestone dropdown filter (Slide 11 requirement)
  const milestoneSelect = document.getElementById('milestoneFilter');
  if (milestoneSelect) {
    milestoneSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      document.querySelectorAll('.milestone-card').forEach((card) => {
        const match = value === 'all' || card.dataset.milestone === value;
        card.style.display = match ? '' : 'none';
        if (match) card.classList.add('in');
      });
    });
  }

  // 3. Modal close behaviour
  const modal = document.getElementById('academicModal');
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAcademicModal(); });
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeAcademicModal();
      if (e.key === 'Tab') {
        const buttons = [...modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => el.getClientRects().length && !el.disabled);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    });
  }

  // 4. Contact form (Slide 15 requirement)
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('subject').value.trim();
      const body = `Name: ${document.getElementById('fullName').value.trim()}\nEmail: ${document.getElementById('email').value.trim()}\n\n${document.getElementById('message').value.trim()}`;
      const emailLink = document.createElement('a');
      emailLink.className = 'arrow-link';
      emailLink.href = `mailto:studyfyx.research@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      emailLink.textContent = 'Open your email app to send';
      const message = document.createElement('p');
      message.className = 'form-success';
      message.textContent = 'Your email is ready. Send it from your email app. If no app opens, email studyfyx.research@gmail.com using the message above. ';
      message.appendChild(emailLink);
      formStatus.replaceChildren(message);

    });
  }

  // 5. Subtle scroll reveal
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }
});

// Track the section currently in view on the scrolling research homepage.
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.reference-hero')) return;
  const header = document.querySelector('.nav');
  const bar = document.createElement('div');
  bar.className = 'nav-progress';
  bar.setAttribute('aria-hidden', 'true');
  header.appendChild(bar);
  const navLinks = [...document.querySelectorAll('#navMenu a[href^="#"]')];
  const scopeLinks = [...document.querySelectorAll('.scope-sidebar nav a')];
  function updateLinks(links) {
    let current = null;
    links.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section && section.getBoundingClientRect().top <= 150) current = link;
    });
    links.forEach(link => {
      link.classList.toggle('active', link === current);
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let scheduled = false;
  const update = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${available > 0 ? Math.min(1, window.scrollY / available) : 0})`;
    updateLinks(navLinks); updateLinks(scopeLinks); scheduled = false;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
});
