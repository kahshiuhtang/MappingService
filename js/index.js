const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const osrmTextInstructions = require("osrm-text-instructions")("v5");
const cluster = require("cluster");
const os = require("os");

const numCpu = os.cpus().length;
const app = express();
const port = 3000;
const NUM_PROCESSES = 12;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST handler for /api/route
app.post("/api/route", async (req, res) => {
  // Extract source and destination coordinates from the request body
  const { source, destination } = req.body;

  if (
    !source ||
    !destination ||
    !source.lat ||
    !source.lon ||
    !destination.lat ||
    !destination.lon
  ) {
    return res.status(400).send("Invalid request body");
  }

  try {
    // http://209.94.59.116:5000/route/v1/driving/-79.39882957084677,40.36502512530271;-70.21752653781331,46.90437046707393?steps=true
    // Construct the URL for the route request
    const routeUrl = `http://127.0.0.1:5000/route/v1/driving/${source.lon},${source.lat};${destination.lon},${destination.lat}?steps=true`; // Make a GET request to the route URL
    var response = null; //  console.log(response.data.routes)
    try {
      response = await axios.get(routeUrl, { timeout: 500 });
    } catch (error) {
      res.json({ error: "Timeout." });
      return;
    }
    if (response == null) {
      res.json({ error: "timeout" });
      return;
    }
    const routes = response.data.routes;
    const legs = response.data.routes[0].legs;
    const route = [];
    legs.forEach(function (leg) {
      leg.steps.forEach(function (step) {
        const description = osrmTextInstructions.compile("en", step);
        const distance = step.distance;

        const latitude = step["maneuver"]["location"][1];
        const longitude = step["maneuver"]["location"][0];
        const coordinates = { lat: latitude, lon: longitude };

        const turn = {
          description: description,
          coordinates: coordinates,
          distance: distance,
        }; //       console.log(turn)
        route.push(turn);
      });
    }); //   console.log(`Process ${process.pid} handled this request`) // Send the response received from the route service
    res.json(route);
  } catch (error) {
    console.error(error);
    res.status(200).send({ error });
  }
});

if (cluster.isMaster) {
  for (let i = 0; i < NUM_PROCESSES; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died with code ${code}`);
    cluster.fork();
  });
} else {
  // Start the Express server
  app.listen(port, () => {
    console.log(`Server ${process.pid} is listening on port ${port}`);
  });
}
