const userService = require("../services/userService");
const postService = require("../services/postService");

const renderUserPage = async (req, res) => {
  const viewerId = req.session.userId;
  const profileUserId = req.params.id;

  try {
    const profileUser = await userService.getUserById(profileUserId);
    const viewer = await userService.getUserById(viewerId);

    const posts = await postService.getPostsByUser(profileUserId);

    res.render("userPage", {
      profileUser,
      viewer,
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load user page" });
  }
};

module.exports = { renderUserPage };
