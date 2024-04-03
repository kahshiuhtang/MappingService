<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents("php://input");

    error_log("Hello\n");
    // Establish database connection
    $dbconn = pg_connect("host=localhost dbname=gis user=renderer password=renderer port=50000");
    $pdo = new PDO("pgsql:host=localhost;dbname=gis;user=tegola;password=tegola");


    if (!$dbconn) {
        error_log("Cant connect\n");
    }


    // echo "Conn: " . $dbconn;

    if ($postData) {
        // Decode the JSON data
        $userData = json_decode($postData, true);

        // Check if decoding was successful
        if ($userData === null && json_last_error() !== JSON_ERROR_NONE) {
            // Handle JSON decoding error
            $response = array('status' => 'error', 'message' => 'Error decoding JSON data');
            header('Content-Type: application/json');
            echo json_encode($response);
        } else {
            // Access individual fields
            $searchTerm = $userData['searchTerm'];
            $bbox = $userData['bbox'];
            $minLat = $bbox['minLat'];
            $maxLat = $bbox['maxLat'];
            $minLon = $bbox['minLon'];
            $maxLon = $bbox['maxLon'];
            $onlyInBox = $userData['onlyInBox'];

            error_log("searchTerm: " . $searchTerm . "\n");
            error_log("minLat: " . $minLat . "\n");
            error_log("maxLat: " . $maxLat . "\n");
            error_log("minLon: " . $minLon . "\n");
            error_log("maxLon: " . $maxLon . "\n");
            error_log("onlyInBox: " . $onlyInBox . "\n");

            $result = NULL;

$sql_query =   "
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
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_point
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_line
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_polygon
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_roads
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)
) AS outer_sub 
ORDER BY ST_Distance(ST_Centroid(ST_MakeEnvelope($2,$3,$4,$5)),ST_MakePoint(lat, long)) ASC;
                    ";
            if ($onlyInBox) {
		    $sql_query = "
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
			";
			error_log("Trying to find only In Box");		
    		    $result = pg_query_params($dbconn, $sql_query, array($searchTerm, $minLon, $minLat, $maxLon, $maxLat));
                if (!$result) {
                    echo "An error occurred.\n";
                    exit;
                }
                $ans = [];
                while ($row = pg_fetch_row($result)) {
                    $new_json = array();
                    $new_json["name"] = $row[0];
                    $new_json["coordinates"] = array("lat" => $row[2], "long" => $row[1]);
                    //$new_json["bbox"] =  $bbox;
                    $new_json["bbox"] =  array("minLat" => $row[4], "minLon" => $row[3], "maxLat" => $row[6], "maxLon" => $row[5]);
                    array_push($ans, $new_json);
                }
                header('Content-Type: application/json');
                http_response_code(200);
                echo json_encode($ans);
                die();
	    } else {
		    error_log("Trying to find NOT only in box");
                $result = pg_query_params($dbconn, $sql_query, array($searchTerm, $minLon, $minLat, $maxLon, $maxLat));
                if (!$result) {
                    echo "An error occurred.\n";
                    exit;
                }
                $ans = [];
                while ($row = pg_fetch_row($result)) {
                    $new_json = array();
                    $new_json["name"] = $row[0];
                    $new_json["coordinates"] = array("lat" => $row[2], "long" => $row[1]);
                    $new_json["bbox"] =  array("minLat" => $row[4], "minLon" => $row[3], "maxLat" => $row[6], "maxLon" => $row[5]);
                    array_push($ans, $new_json);
                }
                header('Content-Type: application/json');
                http_response_code(200);
                echo json_encode($ans);
                die();
            }
        }
    } else {
        // Handle case where no data was received
        $response = array('status' => 'ERROR', 'message' => 'No data received');
        header('Content-Type: application/json');
        http_response_code(200);
        echo json_encode($response);
    }
} else {
    // Return an error if the request method is not POST
    $data = array("html" => "Not a post request");
    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode($data);
}
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
$sql_query =   "
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
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_point
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_line
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_polygon
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)

UNION ALL 

(SELECT name, ST_X(shape) AS long, ST_Y(shape) AS lat, ST_Y(shape) as ymin, ST_Y(shape) as ymax, ST_X(shape) as xmin, ST_X(shape) as xmax
FROM (SELECT  \"addr:housenumber\" || (' ')|| (tags->'addr:street') || (', ') || (tags->'addr:city') || (', ')|| (tags->'addr:state') || (', ') || (tags->'addr:postcode') AS name,
ST_AsText(ST_Centroid(ST_AsText(ST_Transform(way, 4326)))) AS shape, ST_Envelope(ST_AsText(ST_Transform(way,4326))) AS poly
FROM planet_osm_roads
WHERE tags ? 'addr:street' AND tags ->'addr:street' ILIKE '%' || 'Taylor' ||  '%') AS Sub10)
) AS outer_sub 
ORDER BY ST_Distance(ST_Centroid(ST_MakeEnvelope($2,$3,$4,$5)),ST_MakePoint(lat, long)) ASC;
                    ";

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
 