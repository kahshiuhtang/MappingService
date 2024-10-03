vcl 4.0;

import directors;

backend server1 {
    .host = "104.131.79.137";
    .port = "80";
}

backend server2 {
    .host = "68.183.155.189";
    .port = "80";
}

backend server3 {
    .host = "162.243.184.81";
    .port = "80";
}

#backend oldserver1{
  #  .host = "146.190.141.61";
  #  .port = "8080";
#}
backend oldserver2{
    .host = "194.113.75.46";
    .port = "8080";
}

sub vcl_init {
    new bar = directors.round_robin();
    bar.add_backend(server1);
    bar.add_backend(server2);
    bar.add_backend(server3);

}

sub vcl_recv {
    # Happens before we check if we have this in cache already.
    #
    # Typically you clean up the request here, removing cookies you don't need,
    # rewriting the request, etc.
    #
    if(req.url ~ "^/tiles/17" || req.url ~ "^/tiles/16" || req.url ~ "^/tiles/15" || req.url ~ "^/tiles/14"  || req.url ~ "^/tiles/13"  || req.url ~ "^/tiles/12"){
         set req.url = regsub(req.url, "^/tiles/", "/tile/");
        set req.backend_hint = oldserver2;
        return (hash);
    }elseif (req.url ~ "^/tiles/") {
        set req.url = regsub(req.url, "^/tiles/", "/osm/");
        set req.backend_hint = bar.backend();
        return (hash);
    }else{
        set req.backend_hint = bar.backend();
    }
}

sub vcl_backend_fetch {
    # Check if the request URL matches the specified pattern
    if(bereq.url ~ "^/tiles/17" || bereq.url ~ "^/tiles/16" || bereq.url ~ "^/tiles/15" || bereq.url ~ "^/tiles/14"  || bereq.url ~ "^/tiles/13"  || bereq.url ~ "^/tiles/12"){
        # Rewrite the URL if it matches the pattern
        set bereq.url = regsub(bereq.url, "^/tiles/", "/osm/");
    }
    if(bereq.url ~ "^/tiles/17"){

    }elseif(bereq.url ~ "^/tiles/16"){

    }elseif (bereq.url ~ "^/tiles/") {
        set bereq.url = regsub(bereq.url, "^/tiles/", "/osm/");
    }
}

sub vcl_backend_response {
    if ( beresp.status == 404 ) {
    set beresp.ttl = 100s;
    set beresp.uncacheable = true;
    return (deliver);
    }
}

sub vcl_deliver {

}

sub vcl_backend_error {
    set beresp.http.Content-Type = "application/json";
    set beresp.status = 200;
    synthetic "{\"error\": \"backend_fetch_error\"}";
    return (deliver);
}
