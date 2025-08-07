import {
  loadCurrentUser,
  loadUserProfile,
  renderFollowedUsers,
  updateActionButtons,
  handleFollowAction,
  initSidebarEvents,
} from "./userPageSideBar.js";

import { loadUserPosts } from "./userPagePosts.js"; // ניצור בהמשך

import {
  renderMonthlyBarChart,
  loadMonthlyStats
} from "./chartUtils.js";

// --- Internal state ---
let currentUser = null;
let targetUser = null;

// --- State accessors ---
export const getCurrentUser = () => currentUser;
export const getTargetUser = () => targetUser;
export const setCurrentUser = (user) => currentUser = user;
export const setTargetUser = (user) => targetUser = user;

// --- Main logic ---
document.addEventListener("DOMContentLoaded", async () => {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const userId = pathParts[pathParts.length - 1];

  try {
    await loadCurrentUser();
    await loadUserProfile(userId);
    await loadUserPosts(userId);
    await renderFollowedUsers(userId);
    initSidebarEvents(userId);

    try {
      const stats = await loadMonthlyStats(userId);
      renderMonthlyBarChart(stats, "userStatsChart");
    } catch (err) {
      console.log("Stats not available:", err.message);
    }
  } catch (err) {
    console.error("Failed to load user page:", err.message);
    document.getElementById("user-posts").innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error loading page: ${err.message}
      </div>
    `;
  }
});
