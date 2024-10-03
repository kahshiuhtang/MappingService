UNION ALL 

 (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
 FROM (SELECT  "addr:housenumber" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
 ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
 FROM planet_osm_point
 WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10);
        
        SELECT name, long, lat, xmin,ymin,xmax,ymax
        FROM
        (
        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM
        (SELECT name, ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM
        (SELECT name, way FROM planet_osm_point WHERE name ILIKE '%' || $1 || '%') AS Sub2) 
        As Sub1) 
        
        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_polygon WHERE name ILIKE '%' || $1 || '%') AS Sub4) AS Sub5)

        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_line WHERE name ILIKE '%' || $1 || '%') AS Sub6) AS Sub7)
        
        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_roads WHERE name ILIKE '%' || $1 || '%') AS Sub8) AS Sub9)

        UNION ALL 

        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM (SELECT  "addr:housenumber" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
        ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM planet_osm_point
        WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

        UNION ALL 

        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM (SELECT  "addr:housenumber" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
        ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM planet_osm_line
        WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

        UNION ALL 

        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM (SELECT  "addr:housenumber" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
        ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM planet_osm_polygon
        WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

        UNION ALL 

        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM (SELECT  "addr:housenumber" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
        ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM planet_osm_roads
        WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)
        ) AS outer_sub 
        ORDER BY ST_Distance(ST_Centroid(ST_MakeEnvelope($2,$3,$4,$5)),ST_MakePoint(lat, long)) ASC;


        SELECT name, long, lat, xmin,ymin,xmax,ymax
        FROM
        (
        (SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
        FROM
        (SELECT name, ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
        FROM
        (SELECT name, way FROM planet_osm_point WHERE name ILIKE '%' || 'Chamber' || '%') AS Sub2) 
        As Sub1) 
        
        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_polygon WHERE name ILIKE '%' || 'Chamber' || '%') AS Sub4) AS Sub5)

        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_line WHERE name ILIKE '%' || 'Chamber' || '%') AS Sub6) AS Sub7)
        
        UNION ALL
        
        (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax
        FROM
        (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
        FROM
        (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_roads WHERE name ILIKE '%' || 'Chamber' || '%') AS Sub8) AS Sub9)
        ) AS outer_sub 
        ORDER BY ST_Distance(ST_Centroid(ST_MakeEnvelope(40,70,40,70)),ST_MakePoint(lat, long)) ASC;
 