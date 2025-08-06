
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
});


// Fetch matching users and groups
async function fetchSearchResults(query) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    displaySearchDropdown(data);
  } catch (err) {
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
    dropdown.innerHTML = '<span class="dropdown-item text-muted">No results</span>';
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
  searchInput.addEventListener("input", debounce((e) => {
    const query = e.target.value.trim();
    console.log("🔍 Searching for:", query); // ← הוסיפי שורה זו
    if (query.length > 1) {
      fetchSearchResults(query);
    } else {
      const dropdown = document.getElementById("searchDropdown");
      if (dropdown) dropdown.remove();
    }
  }, 300));
}
