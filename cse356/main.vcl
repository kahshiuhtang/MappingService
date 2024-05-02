vcl 4.0;

import directors;

backend main1{
    .host  = "142.93.67.111";
    .port = "25000";
}

backend route1{
    .host  = "209.94.59.116";
    .port = "3000";
}
backend route2{
    .host  = "209.94.58.219";
    .port = "3000";
}
backend route3{
    .host  = "209.151.155.70";
    .port = "3000";
}

backend smaller{
    .host  = "209.151.153.52";
    .port = "80";
}
backend ltile1{
    .host  = "174.138.68.225";
    .port = "80";
}
backend ltile2{
    .host  = "167.99.48.99";
    .port = "80";
}

backend btile1{
    .host  = "104.131.73.6";
    .port = "8080";
}
backend btile2{
    .host  = "104.236.11.202";
    .port = "8080";
}
backend btile3{
    .host  = "174.138.94.108";
    .port = "8080";
}


sub vcl_init {
    new bar = directors.round_robin();
    bar.add_backend(route1);
    bar.add_backend(route2);
    bar.add_backend(route3);

    new lowr = directors.round_robin();
    lowr.add_backend(ltile1);
    lowr.add_backend(ltile2);

    new highr = directors.round_robin();
    highr.add_backend(btile1);
    highr.add_backend(btile2);
    highr.add_backend(btile3);

}

sub vcl_recv {
    # Happens before we check if we have this in cache already.
    #
    # Typically you clean up the request here, removing cookies you don't need,
    # rewriting the request, etc.
    #
    if(req.url ~ "^/api/search" || req.url ~ "^/api/address" || req.url ~ "^/turn/"){
        set req.url = regsub(req.url, "^/tiles/", "/tile/");
        set req.backend_hint = main1;
    }elseif(req.url ~ "^/tiles/17" || req.url ~ "^/tiles/16" || req.url ~ "^/tiles/15" || req.url ~ "^/tiles/14"  || req.url ~ "^/tiles/13"  || req.url ~ "^/tiles/12"){
        set req.url = regsub(req.url, "^/tiles/", "/styles/basic-preview/256/");
        set req.backend_hint = highr.backend();
        return (hash);
    }elseif (req.url ~ "^/tiles/") {
        set req.url = regsub(req.url, "^/tiles/", "/osm/");
        set req.backend_hint = lowr.backend();
        return (hash);
    }elseif (req.url ~ "^/api/route") {
        set req.backend_hint = bar.backend();
    }else{
        set req.backend_hint = smaller;
    }
}

sub vcl_backend_fetch {
    if(bereq.url ~ "^/tiles/17" || bereq.url ~ "^/tiles/16" || bereq.url ~ "^/tiles/15" || bereq.url ~ "^/tiles/14"  || bereq.url ~ "^/tiles/13"  || bereq.url ~ "^/tiles/12"){
        # Rewrite the URL if it matches the pattern
        set bereq.url = regsub(bereq.url, "^/tiles/", "/styles/basic-preview/256/");
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
    synthetic( {"{ "error" : 503 }"} );
    return (deliver);
}

