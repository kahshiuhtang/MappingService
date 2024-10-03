SELECT name, long, lat, xmin,ymin,xmax,ymax FROM 
            ((SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax 
            FROM 
            (SELECT name, ST_Transform(way, 4326) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
            FROM 
            (SELECT name, way FROM planet_osm_point WHERE name ILIKE '%' || $1 || '%' 
            AND ST_Contains(ST_MakeEnvelope($2,$3,$4,$5),ST_AsText(ST_Transform(way,4326))))
            AS sub2) AS sub3)

            UNION ALL
            (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax  
            FROM 
            (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
            FROM 
            (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_polygon WHERE name ILIKE '%' || $1 || '%') AS sub4) As sub5 
            WHERE ST_Contains(ST_MakeEnvelope($2,$3,$4,$5), center))
            UNION ALL
            (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax  
            FROM 
            (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
            FROM 
            (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_roads WHERE name ILIKE '%' || $1 || '%')AS sub6) As sub7 
            WHERE ST_Contains(ST_MakeEnvelope($2,$3,$4,$5), center))
            UNION ALL
            (SELECT name, ST_X(center) AS long, ST_Y(center) AS lat, ST_YMin(poly) as ymin, ST_YMax(poly) as ymax, ST_XMin(poly) as xmin, ST_XMax(poly) as xmax  
            FROM 
            (SELECT name, ST_Envelope(ST_AsText(shape)) AS poly, ST_AsText(ST_Centroid(ST_AsText(shape))) AS center
            FROM 
            (SELECT name, way, ST_Transform(way, 4326) AS shape FROM planet_osm_line WHERE name ILIKE '%' || $1 || '%')AS sub8) As sub9 
            WHERE ST_Contains(ST_MakeEnvelope($2,$3,$4,$5), center))) AS sub1
            ORDER BY ST_Distance(ST_Centroid(ST_MakeEnvelope($2,$3,$4,$5)),ST_MakePoint(lat, long)) ASC;