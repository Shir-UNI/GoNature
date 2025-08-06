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
          const result = {
            locationName: json.name, // ← הוספנו את זה
            description: json.weather?.[0]?.description,
            temperature: json.main?.temp,
            icon: json.weather?.[0]?.icon,
          };
          resolve(result);
        } catch (err) {
          reject("Failed to parse weather data");
        }
      });
    }).on("error", (err) => {
      reject("Error fetching weather data: " + err.message);
    });
  });
};


module.exports = { getWeatherByCoords };
