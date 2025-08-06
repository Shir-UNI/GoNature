const https = require("https");

const getWeatherByCoords = (lat, lon) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          if (res.statusCode >= 400) {
            const message =
              json?.message || "Weather API returned an error";
            return reject({ status: res.statusCode, message });
          }

          const result = {
            description: json.weather?.[0]?.description,
            temperature: json.main?.temp,
            icon: json.weather?.[0]?.icon,
          };
          resolve(result);
        } catch (err) {
          reject({ status: 500, message: "Failed to parse weather data" });
        }
      });
    }).on("error", (err) => {
      reject({ status: 500, message: "Error fetching weather data: " + err.message });
    });
  });
};

module.exports = { getWeatherByCoords };
