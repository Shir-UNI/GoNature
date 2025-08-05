document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorContainer = document.getElementById('errorContainer');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  const profileImageInput = document.getElementById('profileImage');

  // Create password strength indicator
  const strengthIndicator = document.getElementById('passwordStrength');

  // Evaluate password strength
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = getPasswordStrength(password);
    strengthIndicator.textContent = `Password strength: ${strength.label}`;
    strengthIndicator.style.color = strength.color;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const profileImage = profileImageInput.files[0];

    // Client-side validations
    if (!username || username.length < 3 || username.length > 20) {
      showError('Username must be between 3 and 20 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      confirmPasswordInput.value = '';
      return;
    }

    if (password.length < 6 || password.length > 50) {
      showError('Password must be between 6 and 50 characters');
      return;
    }

    const strength = getPasswordStrength(password);
    if (strength.label === 'Weak') {
      showError('Please choose a stronger password');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (profileImage) formData.append('profileImage', profileImage);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || data.message || 'Registration failed');
        return;
      }

      window.location.href = '/login';
    } catch (err) {
      showError('An error occurred while registering. Please try again.');
    }
  });

  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none');
    setTimeout(() => {
      errorContainer.classList.add('d-none');
      errorContainer.textContent = '';
    }, 4000);
  }

  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', color: 'red' };
    if (score === 3) return { label: 'Moderate', color: 'orange' };
    return { label: 'Strong', color: 'green' };
  }

  // Enable Bootstrap tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
