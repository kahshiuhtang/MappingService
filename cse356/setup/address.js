const express = require("express");
const { Readable } = require('stream');
const app = express();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://64.23.254.233:9200",
});
const index = "points,lines,multilinestrings,multipolygons,other_relations"; // Replace with your index name
app.use(express.json());
app.post("/api/address", async function(req, res) {
  const { lat, lon } = req.body;
  const result = await client.search({
	  index: "points",
    query: {
     bool:{
      filter:{
        geo_distance:{
          distance: "5m",
          "geometry.coordinates":[lon, lat]
        }
        
      }
     }
    },
    size: 1000,
  });
//console.log(result.hits.hits);
	var rest = result.hits.hits;
  function hstoreToJson(hstoreString) {
    hstoreString = hstoreString.slice(1, -1);
    const pairs = hstoreString.split('","').map(pair => pair.split('"=>"'));
    const obj = {};
    pairs.forEach(pair => {
        const key = pair[0];
        let value = pair[1];
        value = value.replace(/\\"/g, '"');
        obj[key] = value;
    });
    return obj;
}
  for(var i = 0; i < rest.length; i++){
    var st = rest[i]["_source"]["other_tags"]
	  if(st && st.length > 0){
      var ind = hstoreToJson(rest[i]["_source"]["other_tags"])
      if(ind["addr:city"] && ind["addr:housenumber"] && ind["addr:state"] && ind["addr:street"]){
        res.status(200).json({
          "number": ind["addr:housenumber"] ,
          "street": ind["addr:street"],
          "city": ind["addr:city"],
          "state": ind["addr:state"], 
          "country": "US"
        })
        return
      }
    }
}
res.status(200).json({
    "number": "",
    "street": "",
    "city": "",
    "state": "", 
    "country": "US"
  })
})

app.listen(25000, "0.0.0.0", async () => {
  console.log("search server started");
});

/*
{ lat: 40.91402010038242, lon: -73.13018149999999 }
{ natural: 'tree' }
NOT FOUND
{ lat: 40.918625813424754, lon: -73.12088112969158 }


*/