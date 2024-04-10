<?php

if ($_SERVER['REQUEST_METHOD'] == 'GET') {


    // Extracting numbers from "topleft"
    $topleftNumbers = explode(",", $_GET["topleft"]);

    // Extracting numbers from "bottomright"
    $bottomrightNumbers = explode(",", $_GET["bottomright"]);

    // Now you have the individual numbers in separate variables or arrays
    $tl_lat = $topleftNumbers[0]; // Top-left latitude
    $tl_lon = $topleftNumbers[1]; // Top-left longitude

    $br_lat = $bottomrightNumbers[0]; // Bottom-right latitude
    $br_lon = $bottomrightNumbers[1]; // Bottom-right longitude

    //    echo "Top-left coordinates: ($tl_lat, $tl_lon)\n";
    //  echo "Bottom-right coordinates: ($br_lat, $br_lon)\n";

    $center_lat = ($tl_lat + $br_lat) / 2;
    $center_lon = ($tl_lon + $br_lon) / 2;
    $zoom = 10;
    $xtile = floor((($center_lon + 180) / 360) * pow(2, $zoom));
    $ytile = floor((1 - log(tan(deg2rad($center_lat)) + 1 / cos(deg2rad($center_lat))) / pi()) / 2 * pow(2, $zoom));
    while (true) {
        if ($zoom > 22) {
            break;
        }
    }
    //echo "Center coordinates: ($center_lat, $center_lon)\n";

    // Initialize cURL session
    $ch = curl_init();

    // Set the URL
    /*
    $url = "http://209.151.153.52/convert";
    // Set the POST data
    $postData = [
        "lat" => $center_lat, "long" => $center_lon, "zoom" => 10
    ];
    // Encode the data as JSON
    $data_json = json_encode($postData);
    // Set options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    // // Set the request body
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_json);
    // // Set the content type header
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    //curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Execute the request
    $response = curl_exec($ch);
    // Check for errors
    if ($response === false) {
        echo 'cURL Error: ' . curl_error($ch);
    }

    curl_close($ch);
    */
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(200);
    //   echo json_encode($data);

} else {
}
//http_response_code(404);
