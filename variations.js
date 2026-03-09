'use strict';

/* ==========================================
   Shared utilities
   ========================================== */

const coverLabels = ['₹10L', '₹25L', '₹50L', '₹1Cr'];
const coverValues = [1000000, 2500000, 5000000, 10000000];

function calcPremium(age, coverIdx) {
  const base = 7000;
  const ageFactor = Math.max(0, (age - 25)) * 120;
  const coverFactor = coverIdx * 800;
  return Math.round(base + ageFactor + coverFactor);
}

function formatRs(n) {
  if (n >= 100000) {
    const l = n / 100000;
    return '₹\u2009' + (Number.isInteger(l) ? l : l.toFixed(1)) + '\u2009L';
  }
  return '₹\u2009' + n.toLocaleString('en-IN');
}

function setSliderProgress(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty('--progress', pct + '%');
}

function isValidPhone(val) {
  return /^[6-9]\d{9}$/.test(val);
}

/* ==========================================
   Tab switcher (shared)
   ========================================== */

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.calculator-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ==========================================
   VARIATION A — Mandatory phone in form
   ========================================== */

(function () {
  const ageSlider = document.getElementById('a-ageSlider');
  const coverSlider = document.getElementById('a-coverSlider');
  const ageValue = document.getElementById('a-ageValue');
  const coverValue = document.getElementById('a-coverValue');
  const phone = document.getElementById('a-phone');
  const phoneWrapper = document.getElementById('a-phoneWrapper');
  const phoneError = document.getElementById('a-phoneError');
  const cta = document.getElementById('a-cta');
  const premiumAmount = document.getElementById('a-premiumAmount');
  const premiumSubtitle = document.getElementById('a-premiumSubtitle');
  const locked = document.getElementById('a-locked');
  const revealed = document.getElementById('a-revealed');
  const ageImpact = document.getElementById('a-ageImpact');
  const coverImpact = document.getElementById('a-coverImpact');

  function updateSliders() {
    ageValue.textContent = ageSlider.value;
    coverValue.textContent = coverLabels[coverSlider.value];
    setSliderProgress(ageSlider);
    setSliderProgress(coverSlider);
  }

  ageSlider.addEventListener('input', updateSliders);
  coverSlider.addEventListener('input', updateSliders);

  phone.addEventListener('input', () => {
    phoneWrapper.classList.remove('error');
    phoneError.classList.remove('visible');
  });

  cta.addEventListener('click', () => {
    const valid = isValidPhone(phone.value);
    if (!valid) {
      phoneWrapper.classList.add('error');
      phoneError.classList.add('visible');
      phone.focus();
      return;
    }

    const age = parseInt(ageSlider.value);
    const ci = parseInt(coverSlider.value);
    const premium = calcPremium(age, ci);
    const ageFact = Math.max(0, (age - 25)) * 120;
    const coverFact = ci * 800;

    premiumAmount.textContent = formatRs(premium);
    premiumSubtitle.textContent = 'is your estimated annual premium';
    ageImpact.textContent = formatRs(ageFact);
    coverImpact.textContent = formatRs(coverFact);

    locked.style.display = 'none';
    revealed.style.display = 'block';
  });

  updateSliders();
})();

/* ==========================================
   VARIATION B — Results first + WhatsApp
   ========================================== */

(function () {
  const ageSlider = document.getElementById('b-ageSlider');
  const coverSlider = document.getElementById('b-coverSlider');
  const ageValue = document.getElementById('b-ageValue');
  const coverValue = document.getElementById('b-coverValue');
  const premiumAmount = document.getElementById('b-premiumAmount');
  const ageImpact = document.getElementById('b-ageImpact');
  const coverImpact = document.getElementById('b-coverImpact');
  const waBtn = document.getElementById('b-waBtn');
  const waPhone = document.getElementById('b-phone');
  const waSuccess = document.getElementById('b-waSuccess');

  function recalc() {
    const age = parseInt(ageSlider.value);
    const ci = parseInt(coverSlider.value);
    const premium = calcPremium(age, ci);
    const ageFact = Math.max(0, (age - 25)) * 120;
    const coverFact = ci * 800;
    premiumAmount.textContent = formatRs(premium);
    ageImpact.textContent = formatRs(ageFact);
    coverImpact.textContent = formatRs(coverFact);
    ageValue.textContent = age;
    coverValue.textContent = coverLabels[ci];
    setSliderProgress(ageSlider);
    setSliderProgress(coverSlider);
  }

  ageSlider.addEventListener('input', recalc);
  coverSlider.addEventListener('input', recalc);

  waBtn.addEventListener('click', () => {
    if (!isValidPhone(waPhone.value)) {
      waPhone.parentElement.classList.add('error');
      return;
    }
    waPhone.parentElement.classList.remove('error');
    // In production: POST to your backend / open wa.me link
    const age = ageSlider.value;
    const ci = parseInt(coverSlider.value);
    const premium = calcPremium(parseInt(age), ci);
    const waMsg = encodeURIComponent(
      `Hi! My estimated health premium is ${formatRs(premium)}/yr (Age: ${age}, Cover: ${coverLabels[ci]}). Please send me plans.`
    );
    window.open(`https://wa.me/91${waPhone.value}?text=${waMsg}`, '_blank');
    waSuccess.style.display = 'flex';
    setTimeout(() => { waSuccess.style.display = 'none'; }, 5000);
  });

  waPhone.addEventListener('input', () => {
    waPhone.parentElement.classList.remove('error');
  });

  recalc();
})();

/* ==========================================
   VARIATION C — Popup gate before result
   ========================================== */

(function () {
  const ageSlider = document.getElementById('c-ageSlider');
  const coverSlider = document.getElementById('c-coverSlider');
  const ageValue = document.getElementById('c-ageValue');
  const coverValue = document.getElementById('c-coverValue');
  const cta = document.getElementById('c-cta');
  const premiumAmount = document.getElementById('c-premiumAmount');
  const locked = document.getElementById('c-locked');
  const revealed = document.getElementById('c-revealed');
  const ageImpact = document.getElementById('c-ageImpact');
  const coverImpact = document.getElementById('c-coverImpact');

  const modal = document.getElementById('c-modal');
  const modalClose = document.getElementById('c-modalClose');
  const modalSubmit = document.getElementById('c-modalSubmit');
  const modalSkip = document.getElementById('c-skip');
  const phone = document.getElementById('c-phone');
  const phoneWrapper = document.getElementById('c-phoneWrapper');
  const phoneError = document.getElementById('c-phoneError');

  function updateSliders() {
    ageValue.textContent = ageSlider.value;
    coverValue.textContent = coverLabels[coverSlider.value];
    setSliderProgress(ageSlider);
    setSliderProgress(coverSlider);
  }

  ageSlider.addEventListener('input', updateSliders);
  coverSlider.addEventListener('input', updateSliders);

  function showResult() {
    const age = parseInt(ageSlider.value);
    const ci = parseInt(coverSlider.value);
    const premium = calcPremium(age, ci);
    const ageFact = Math.max(0, (age - 25)) * 120;
    const coverFact = ci * 800;
    premiumAmount.textContent = formatRs(premium);
    ageImpact.textContent = formatRs(ageFact);
    coverImpact.textContent = formatRs(coverFact);
    locked.style.display = 'none';
    revealed.style.display = 'block';
  }

  function openModal() {
    phone.value = '';
    phoneWrapper.classList.remove('error');
    phoneError.classList.remove('visible');
    modal.style.display = 'flex';
    setTimeout(() => phone.focus(), 300);
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  cta.addEventListener('click', openModal);

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modalSubmit.addEventListener('click', () => {
    if (!isValidPhone(phone.value)) {
      phoneWrapper.classList.add('error');
      phoneError.classList.add('visible');
      return;
    }
    closeModal();
    showResult();
  });

  modalSkip.addEventListener('click', () => {
    closeModal();
    showResult();
  });

  phone.addEventListener('input', () => {
    phoneWrapper.classList.remove('error');
    phoneError.classList.remove('visible');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  updateSliders();
})();
