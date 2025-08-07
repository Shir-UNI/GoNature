// services/facebookService.js
const axios = require('axios');

const PAGE_ID    = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

async function debugToken() {
  try {
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${PAGE_TOKEN}&access_token=${PAGE_TOKEN}`;
    const response = await axios.get(debugUrl);
    console.log('Token info:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Token debug error:', err.response?.data);
  }
}

async function postToFacebook(post) {
  const message =
    `${post.title}\n\n` +
    `${post.content.substring(0, 100)}…\n` +
    `${process.env.APP_URL}/posts/${post._id}`;

  try {
    const url = `https://graph.facebook.com/v17.0/${PAGE_ID}/feed`;
    const res = await axios.post(url, null, {
      params: { message, access_token: PAGE_TOKEN },
    });
    console.log('✅ Facebook post ID:', res.data.id);
  } catch (err) {
    console.error('❌ Error publishing to FB:', err.response?.data || err.message);
  }
}

module.exports = { postToFacebook };