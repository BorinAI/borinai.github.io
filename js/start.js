// --- START PAGE JAVASCRIPT ---

let currentStep = 1;
const totalSteps = 6;
let isAnimating = false;

const userData = {
  name: '',
  age: '',
  class: '',
  state: '',
  subjects: []
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateProgress();
  initializeInputs();
});

function setupEventListeners() {
  // Next buttons
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', handleNext);
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', handleBack);

  // Register button
  document.getElementById('registerBtn').addEventListener('click', handleRegister);

  // Subject checkboxes
  document.querySelectorAll('input[name="subject"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateSubjects);
  });
}

function initializeInputs() {
  document.getElementById('name').addEventListener('input', (e) => {
    userData.name = e.target.value;
  });

  document.getElementById('age').addEventListener('input', (e) => {
    userData.age = e.target.value;
  });

  document.getElementById('class').addEventListener('change', (e) => {
    userData.class = e.target.options[e.target.selectedIndex].text;
  });

  document.getElementById('state').addEventListener('change', (e) => {
    userData.state = e.target.options[e.target.selectedIndex].text;
  });
}

function handleNext() {
  if (isAnimating) return;

  // Validate current step
  if (!validateStep(currentStep)) {
    triggerError();
    return;
  }

  // Move to next step
  if (currentStep < totalSteps) {
    moveToStep(currentStep + 1);
  }
}

function handleBack() {
  if (isAnimating || currentStep === 1) return;
  moveToStep(currentStep - 1);
}

function moveToStep(stepNumber) {
  if (isAnimating) return;
  isAnimating = true;

  const oldStep = document.getElementById(`step-${currentStep}`);
  const newStep = document.getElementById(`step-${stepNumber}`);

  // Fade out old step
  oldStep.classList.remove('active');

  // Fade in new step after small delay
  setTimeout(() => {
    newStep.classList.add('active');
    currentStep = stepNumber;
    
    updateProgress();
    updateBackButton();

    // Update summary for final step
    if (currentStep === 6) {
      updateSummary();
    }

    // Scroll card to top smoothly
    const card = document.querySelector('.intro-card');
    card.scrollTop = 0;

    isAnimating = false;
  }, 150);
}

function validateStep(step) {
  switch(step) {
    case 1:
      const name = document.getElementById('name').value.trim();
      if (!name) {
        showError('Bitte gib deinen Namen ein!');
        return false;
      }
      return true;

    case 2:
      const age = document.getElementById('age').value;
      if (!age || age < 8 || age > 120) {
        showError('Bitte gib ein gültiges Alter ein!');
        return false;
      }
      return true;

    case 3:
      const classValue = document.getElementById('class').value;
      if (!classValue) {
        showError('Bitte wähle deine Klasse!');
        return false;
      }
      return true;

    case 4:
      const state = document.getElementById('state').value;
      if (!state) {
        showError('Bitte wähle dein Bundesland!');
        return false;
      }
      return true;

    case 5:
      return true;

    default:
      return true;
  }
}

function updateProgress() {
  const percentage = (currentStep / totalSteps) * 100;
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.setProperty('--progress', percentage + '%');
  
  // Update via pseudo-element
  const root = document.documentElement;
  root.style.setProperty('--progress-width', percentage + '%');
}

function updateBackButton() {
  const backBtn = document.getElementById('backBtn');
  backBtn.style.display = currentStep === 1 ? 'none' : 'block';
}

function updateSubjects() {
  userData.subjects = [];
  document.querySelectorAll('input[name="subject"]:checked').forEach(checkbox => {
    userData.subjects.push(checkbox.value);
  });
}

function updateSummary() {
  document.getElementById('summary-name').textContent = userData.name || '--';
  document.getElementById('summary-age').textContent = userData.age || '--';
  document.getElementById('summary-class').textContent = userData.class || '--';
  document.getElementById('summary-state').textContent = userData.state || '--';
}

function handleRegister() {
  // Save user data to localStorage
  localStorage.setItem('borinai_user_profile', JSON.stringify(userData));

  // Redirect to register page
  window.location.href = 'register.html?from=intro';
}

function triggerError() {
  const card = document.querySelector('.intro-card');
  card.style.animation = 'shake 0.5s ease-in-out';

  setTimeout(() => {
    card.style.animation = 'none';
  }, 500);
}

function showError(message) {
  // Show error toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(239, 68, 68, 0.5);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideUp 0.4s ease-out;
    font-weight: 500;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideUp 0.4s ease-out reverse';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !isAnimating) {
    const activeStep = document.querySelector('.step.active');
    if (activeStep && currentStep < totalSteps) {
      handleNext();
    } else if (currentStep === totalSteps) {
      handleRegister();
    }
  }
});

// Inject CSS variable for progress bar
document.documentElement.style.setProperty('--progress-width', '16.7%');
