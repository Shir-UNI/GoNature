// Debounce function to avoid sending too many requests
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/users/me", { credentials: "include" });
    if (!res.ok) return;
    const user = await res.json();

    const profileImg = document.getElementById("userProfileImage");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const profileLink = document.getElementById("profileLink");

    if (profileImg) profileImg.src = user.profileImage;
    if (usernameDisplay) usernameDisplay.textContent = user.username;
    if (profileLink) profileLink.href = `/users/${user._id}`;
  } catch (err) {
    console.error("Failed to load navbar user:", err.message);
  }

  //Logout button
  document.addEventListener("click", async (e) => {
    if (e.target.id === "logoutBtn") {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          window.location.href = "/login";
        } else {
          alert("Logout failed.");
        }
      } catch (err) {
        console.error("Logout error:", err.message);
        alert("An unexpected error occurred.");
      }
    }
  });
});

// Fetch matching users and groups based on search query
async function fetchSearchResults(query) {
  try {
    // Send request to search endpoint with session credentials
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Search failed");

    // Parse JSON response
    const data = await res.json();
    
    // Filter out soft-deleted users
    if (Array.isArray(data.users)) {
      data.groups = data.groups.filter(group => !group.isDeleted);
    }

    // Filter out soft-deleted groups
    if (Array.isArray(data.groups)) {
      data.groups = data.groups.filter(group => !group.isDeleted);
    }

    // Display the filtered results in the dropdown
    displaySearchDropdown(data);
  } catch (err) {
    // Log any errors that occur during fetch or processing
    console.error("Search error:", err.message);
  }
}

// Display dropdown with results
function displaySearchDropdown({ users, groups }) {
  let dropdown = document.getElementById("searchDropdown");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "searchDropdown";
    dropdown.className = "dropdown-menu show position-absolute w-100 mt-1";
    document.getElementById("searchQuery").parentNode.appendChild(dropdown);
  }

  if (users.length === 0 && groups.length === 0) {
    dropdown.innerHTML =
      '<span class="dropdown-item text-muted">No results</span>';
    return;
  }

  dropdown.innerHTML = "";
  users.forEach((u) => {
    const item = document.createElement("a");
    item.className = "dropdown-item";
    item.href = `/users/${u._id}`;
    item.textContent = `👤 ${u.username}`;
    dropdown.appendChild(item);
  });

  groups.forEach((g) => {
    const item = document.createElement("a");
    item.className = "dropdown-item";
    item.href = `/groups/${g._id}`;
    item.textContent = `👥 ${g.name}`;
    dropdown.appendChild(item);
  });
}

const searchInput = document.getElementById("searchQuery");
if (searchInput) {
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const query = e.target.value.trim();
      console.log("🔍 Searching for:", query); // ← הוסיפי שורה זו
      if (query.length > 1) {
        fetchSearchResults(query);
      } else {
        const dropdown = document.getElementById("searchDropdown");
        if (dropdown) dropdown.remove();
      }
    }, 300)
  );
}
