document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/feed'; // Redirect to feed if login is successful
    } else {
      document.getElementById('errorMessage').textContent = data.message || 'Login failed';
      document.getElementById('errorMessage').style.display = 'block';
    }
  } catch (err) {
    document.getElementById('errorMessage').textContent = 'Something went wrong';
    document.getElementById('errorMessage').style.display = 'block';
  }
});
