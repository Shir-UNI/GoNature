const weatherService = require("../services/weatherService");

const getWeather = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "Missing lat or lon" });
  }

  try {
    const weather = await weatherService.getWeatherByCoords(lat, lon);
    res.json(weather);
  } catch (err) {
    if (typeof err === "object" && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: err.toString() });
  }
};

module.exports = { getWeather };
