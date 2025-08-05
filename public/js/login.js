document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorContainer = document.getElementById("errorContainer");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous error
    errorContainer.textContent = "";
    errorContainer.classList.add("d-none");

    const formData = new FormData(form);
    const data = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Login success - redirect to feed
        window.location.href = "/feed";
      } else {
        // Login failed - show error and clear password
        const result = await response.json();
        passwordInput.value = "";
        showError(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      passwordInput.value = "";
      showError("An unexpected error occurred. Please try again.");
    }
  });

  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("d-none");

    // Auto-remove error after 4 seconds
    setTimeout(() => {
      errorContainer.classList.add("d-none");
      errorContainer.textContent = "";
    }, 4000);
  }
});
