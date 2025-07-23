const fs = require("fs");
const axios = require("axios");

// Percorso del tuo file di input
const inputFile = "eventi.json";
const outputFile = "eventi_con_coordinate.json";

// Funzione per ottenere lat/lon da un nome città
async function geocoding(cityName) {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: cityName,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "OcchioAlBorgo/1.0",
        },
      }
    );

    if (response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    } else {
      return { lat: null, lon: null };
    }
  } catch (error) {
    console.error(`❌ Errore con "${cityName}":`, error.message);
    return { lat: null, lon: null };
  }
}

(async () => {
  const rawData = fs.readFileSync(inputFile);
  const eventi = JSON.parse(rawData);

  for (const evento of eventi) {
    if (!evento.City) {
      console.warn(`⚠️ Evento senza campo 'City':`, evento);
      evento.lat = null;
      evento.lon = null;
      continue;
    }

    const { lat, lon } = await geocoding(evento.City);
    evento.lat = lat;
    evento.lon = lon;

    console.log(`📍 ${evento.City} → ${lat}, ${lon}`);
  }

  fs.writeFileSync(outputFile, JSON.stringify(eventi, null, 2));
  console.log(`✅ File salvato: ${outputFile}`);
})();
