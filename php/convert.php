<?php
if($_SERVER["REQUEST_METHOD"] == "POST"){
	$jsonData = file_get_contents("php://input");
	$data = json_decode($jsonData, true);
	$lon = $data["long"];
	$lat = $data["lat"];
	$zoom =$data["zoom"];

	// echo "long: " . $lon . "\n";
	// echo "lat: " . $lat . "\n";
	// echo "zoom: " . $zoom . "\n";

	$xtile = floor((($lon + 180) / 360) * pow(2, $zoom));
	$ytile = floor((1 - log(tan(deg2rad($lat)) + 1 / cos(deg2rad($lat))) / pi()) /2 * pow(2, $zoom));
	$new_json = array();
        $new_json["x_tile"] = $xtile;
	$new_json["y_tile"] = $ytile;
	header('Content-Type: application/json');
        http_response_code(200);
        echo json_encode($new_json);
	die();
}
http_response_code(404);
echo "ERROR, ONLY POST REQUESTS ALLOWED";
die();
