/**
 * STUDYFYX (R26-IT-073) - Research Website Interactions
 * Lightweight vanilla JavaScript, no external dependencies.
 */

// Paste the shared OneDrive / Google Drive folder link here to enable document buttons.
const ONEDRIVE_MASTER_URL = ""; // e.g. "https://1drv.ms/f/s!..."

document.documentElement.classList.add('js');

function openResearchDocument(title, meta, description) {
  const modal = document.getElementById('academicModal');
  if (!modal) {
    if (ONEDRIVE_MASTER_URL.trim()) window.open(ONEDRIVE_MASTER_URL, '_blank');
    return;
  }
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMeta').textContent = meta || 'Research Project R26-IT-073';
  document.getElementById('modalDesc').textContent = description || '';

  const cloudBtn = document.getElementById('modalCloudBtn');
  const note = document.getElementById('modalNote');
  if (ONEDRIVE_MASTER_URL.trim()) {
    cloudBtn.style.display = '';
    if (note) note.style.display = 'none';
    cloudBtn.onclick = () => window.open(ONEDRIVE_MASTER_URL, '_blank');
  } else {
    cloudBtn.style.display = 'none';
    if (note) note.style.display = '';
  }
  modal.classList.add('open');
}

function closeAcademicModal() {
  const modal = document.getElementById('academicModal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile menu
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAcademicModal(); });
  }

  // 4. Contact form (Slide 15 requirement)
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = original;
        formStatus.innerHTML = '<div class="form-success"><strong>Message sent.</strong> Thank you for contacting the R26-IT-073 research group — we will reply shortly.</div>';
        setTimeout(() => { formStatus.innerHTML = ''; }, 8000);
      }, 700);
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
