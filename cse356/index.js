const express = require("express");
const axios = require('axios');
const elasticsearchUrl = 'http://localhost:9200';
const app = express();
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
})
const index = 'lines,multilinestrings,multipolygons,other_relations'; // Replace with your index name
app.use(express.json());
app.post("/api/search", async function(req, res){
    const { bbox, onlyInBox, searchTerm } = req.body;
	const { minLat, minLon, maxLat, maxLon } = bbox;
    const centLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
    const centLon = (parseFloat(maxLon) + parseFloat(minLon)) / 2;
    var query = null;
    if(onlyInBox){
        query = {
            query: {
            bool:{
                should: [
                    {match: {name: searchTerm}},
                    {match: {place: searchTerm}}
                ],
                filter: {
                    geo_shape: {
                        geometry: {
                            shape: {
                                type: "envelope",
                                coordinates: [
                                    [parseFloat(minLon), parseFloat(maxLat)],
                                    [parseFloat(maxLon), parseFloat(minLat)]
                                ]
                            },
                            relation: "intersects"
                        }
                    }
                }
            }
            },
            _source: {
                includes: ["name", "geometry"]
            },
            sort: [
                {
                    geo_distance: {
                        coords: {
                            lat:centLat,
                            lon: centLon
                        },
                        order: "asc",
                        unit: "km",
                        distance_type: "arc"
                    }
                }
            ]
          };
    }else{
        query = {
            query: {
            bool:{
                should: [
                    {match: {name: searchTerm}},
                    {match: {place: searchTerm}}
                ],
            }
            },
            _source: {
                includes: ["name", "geometry"]
            },
            sort: [
                {
                    geo_distance: {
                        coords: {
                            lat:centLat,
                            lon: centLon
                        },
                        order: "asc",
                        unit: "km",
                        distance_type: "arc"
                    }
                }
            ]
          };
    }
query = {
    query: {
      bool: {
        should: [
          { match: { name: searchTerm } },
          { match: { place: searchTerm } }
        ]
      }
    },
    _source: {
      includes: ["name", "geometry"]
    },
    sort: [
      {
        _geo_distance: {
          "geometry.coordinates": [centLon, centLat], // [lon, lat]
          order: "asc",
          unit: "km",
          distance_type: "arc"
        }
      }
    ]
  };
    try {
        console.log(query);
        // const results = await client.search({
        //  index: "lines,multilinestrings,multipolygons,other_relations",
        //  body: query   
        // })
        const result = await client.search({
            index: 'lines,multilinestrings,multipolygons,other_relations',
            query: {
              match: {
                name: searchTerm
              }
            }
          })
    
        console.log(result.hits.hits); // Output Elasticsearch response
        const results = []
        for(var i = 0; i < results.hits.hits.length; i++){
            const curr = results.hits.hits[i];
            var centerLon = 0;
            var centerLat = 0;
            for(var j = 0; j < curr["_source"]["geometry"]["coordinates"].length; j++){
                var currPoint = curr["_source"]["geometry"]["coordinates"][j];
                centerLon += currPoint[0];
                centerLat += currPoint[1];
            }
            centerLat = centerLat / curr["_source"]["geometry"]["coordinates"].length;
            centerLon = centerLon / curr["_source"]["geometry"]["coordinates"].length;
            results.push({

            })
        }
        res.status(200).json(results);
      } catch (error) {
        console.error('Error fetching data from Elasticsearch:', error);
      }
})
  
  // Call the function to execute the search

  
app.listen(25000, "0.0.0.0", async () => {
	console.log("search server started");
});