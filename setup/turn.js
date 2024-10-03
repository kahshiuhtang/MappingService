const express = require("express");
const axios = require("axios");
const sharp = require('sharp');
const { Readable } = require('stream');
const app = express();

app.use(express.json());

app.get("/turn/:l/:r", async function (req, res) {
  var top_left = req.params.l;
  var bottom_right = req.params.r;
  //console.log("top_left");
  //console.log(top_left);
  //console.log("bottom_right")
  //console.log(bottom_right);
  var tl_coords = top_left.split(",");
  var br_coords = bottom_right.split(",");
  br_coords[1] = br_coords[1].slice(0, -4);
  //console.log(br_coords);
  tl_coords[0] = parseFloat(tl_coords[0]);
  tl_coords[1] = parseFloat(tl_coords[1]);
  br_coords[0] = parseFloat(br_coords[0]);
  br_coords[1] = parseFloat(br_coords[1]);
  var center_x = (tl_coords[1] + br_coords[1]) / 2;
  var center_y = (tl_coords[0] + br_coords[0]) / 2;
  var zoom = 1;
  function lon2tile(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }
  function lat2tile(lat, zoom) {
    return Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    );
  }
  //console.log(center_x);
  //console.log(center_y);
  zoom=16;
  var tileX = lon2tile(center_x, zoom);
  var tileY = lat2tile(center_y, zoom);
  var route = `http://167.172.239.172/tile/${zoom}/${tileX}/${tileY}.png`;
  //console.log(route);
  const response = await axios.get(route, {
    responseType: "arraybuffer", // Set the response type to array buffer
  });

  const resizedImageBuffer = await sharp(response.data)
      .resize({ width: 100, height: 100 })
      .toBuffer();

  const readableStream = new Readable();
      readableStream.push(resizedImageBuffer);
      readableStream.push(null);

  // Set the response content type to image/png
  res.setHeader("Content-Type", "image/png");

  // Send the image as response
  //res.send(Buffer.from(response.data, "binary"));
  readableStream.pipe(res);
});

app.listen(25000, "0.0.0.0", async () => {
  console.log("turn server started");
});