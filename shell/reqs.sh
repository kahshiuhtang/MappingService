## Convert
apt update && apt install apache2 -y && apt install php libapache2-mod-php -y
174.138.70.2/convert.php
convert.php
/srv/osrm/osrm-backend
## Turn
http://138.197.25.138:25000/turn/41.7085,-76.9525/41.3655,-76.0271.png
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh
mkdir turn && cd turn 
npm init
npm install express axios nodemon sharp stream  @elastic/elasticsearch
npm install forever -g 
NODEMON START ("start": "nodemon index.js")
COPY INDEX.JS
forever start index.js

## Address
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && tset && nvm install --lts
mkdir address && cd address 
npm init -y
npm install express nodemon stream @elastic/elasticsearch
npm install forever -g
NODEMON START
COPY INDEX.JS
forever start index.js

## Search
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && tset && nvm install --lts
mkdir search && cd search 
npm init -y
npm install express nodemon stream @elastic/elasticsearch
npm install forever -g
NODEMON START
COPY INDEX.JS
forever start index.js

## Tiles
docker volume create osm-data
docker volume create osm-tiles
curl -OT  [LINK]
docker run \
    -v /root/us-northeast.osm.pbf:/data/region.osm.pbf \
    -v osm-data:/data/database/ \
    overv/openstreetmap-tile-server \
    import
docker run \
    -p 8080:80 \
    -p 5432:5432 \
    --memory=60g \
    -e THREADS=15 \
    --name "tileserver2" \
    -e "OSM2PGSQL_EXTRA_ARGS=-C 60000" \
    -v osm-data:/data/database/ \
    -v osm-tiles:/data/tiles/ \
    -d overv/openstreetmap-tile-server \
    run
docker run \
    -p 8080:80 \
    -p 5432:5432 \
    --name "tileserver" \
    -e THREADS=7 \
    -e "OSM2PGSQL_EXTRA_ARGS=-C 63000" \
    -v osm-data:/data/database/ \
    -v osm-tiles:/data/tiles/ \
    -d overv/openstreetmap-tile-server \
    run

search: 165.227.213.234
load-balancer: 143.198.19.157
varnish: 167.172.239.172
turn: 138.197.25.138
convert: 174.138.70.2
address: 104.131.173.167
routing-engine: 159.203.77.78
elasticsearch: 64.23.254.233
tiles: 146.190.141.61
email: 

# Load Balancer
apt update && apt install apache2 -y && apt install php libapache2-mod-php -y
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests rewrite headers
systemctl restart apache2
sudo a2ensite milestone.conf
rm 000-default.conf

// 
a2dismod php8.1
a2dismod mpm_prefork
a2dismod mpm_worker
sudo vi /etc/apache2/mods-available/mpm_worker.conf
FIND THIS SECTION AND REPLACE: 

<IfModule mpm_worker_module>
ServerLimit 250
StartServers 10
MinSpareThreads 75
MaxSpareThreads 250
ThreadLimit 64
ThreadsPerChild 32
MaxRequestWorkers 8000
MaxConnectionsPerChild 10000
</IfModule>

https://ubiq.co/tech-blog/increase-apache-requests-per-second/

## Varnish
https://stackoverflow.com/questions/70259212/varnish-max-threads-hit-backend-and-session-connections-issue

Docker Install:
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

Postgres TUNING:
https://pgtune.leopard.in.ua/#/

<IfModule mpm_worker_module>
ServerLimit 250
StartServers 10
MinSpareThreads 75
MaxSpareThreads 250
ThreadLimit 64
ThreadsPerChild 32
MaxRequestWorkers 8000
MaxConnectionsPerChild 10000
</IfModule>

max threads, 7400 to 15000
https://stackoverflow.com/questions/344203/maximum-number-of-threads-per-process-in-linux

 psql -h localhost -U renderer gis



SELECT osm_id, "addr:housename", "addr:housenumber" FROM planet_osm_polygon WHERE  tags->'addr:city' = 'Stony Brook' AND tags->'addr:street' = 'Nicolls Road';

osm2pgsql --slim -d gis --hstore --multi-geometry --number-processes 4 --tag-transform-script /home/osm/openstreetmap-carto/openstreetmap-carto.lua --style /home/osm/openstreetmap-carto/openstreetmap-carto.style -C 8400 /home/osm/us-northeast.osm.pbf

docker run \
    -p 8080:80 \
    -p 5432:5432 \
    --memory=60g \
    --name "tileserver2" \
    -e "OSM2PGSQL_EXTRA_ARGS=-C 1500" \
    -v osm-data:/data/database/ \
    -v osm-tiles:/data/tiles/ \
    -d overv/openstreetmap-tile-server \
    run
SELECT tags
FROM planet_osm_roads
WHERE ST_Intersects(ST_AsText(ST_Transform(way, 4326)), ST_AsText(ST_MakePoint(-73.12088112969158, 40.918625813424754), 4326));

SELECT tags, p1.point <-> ST_AsText(ST_MakePoint(-73.12088112969158, 40.918625813424754), 4326) AS dist
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point
FROM
  planet_osm_point points
) AS p1
WHERE
tags -> 'address' IS NOT NULL
ORDER BY dist ASC
LIMIT 100;
'41.29342817549477', "lon": '-70.04069691126233'}'
41.29342817549477', 'lon': '-70.04069691126233


/etc/apache2/conf.modules.d/10-worker.conf

<IfModule mpm_*_module>
    StartServers                4    #(Optional)
    MinSpareThreads             25
    MaxSpareThreads             75
    ThreadLimit                 64
    ThreadsPerChild             19
    MaxRequestWorkers           38
    MaxClients:5000
    MaxConnectionsPerChild      2000              #(Optional - Less for more buggy processes to manage memory leaks)
</IfModule>
'
SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            tags->'addr:number' AS housenumber,
            tags -> 'addr:street' AS street,
            tags -> 'addr:city' AS city,
            tags -> 'addr:state' AS state,
            tags -> 'addr:postcode' AS zip
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point
FROM
  planet_osm_point
) AS p1
WHERE (
p1.tags->'addr:street' ILIKE 'Polpis')

UNION ALL

SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            tags->'addr:number' AS housenumber,
            tags -> 'addr:street' AS street,
            tags -> 'addr:city' AS city,
            tags -> 'addr:state' AS state,
            tags -> 'addr:postcode' AS zip
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point
FROM
  planet_osm_roads
) AS p1
WHERE (
p1.tags->'addr:street' ILIKE 'Polpis')

ORDER BY dist ASC
LIMIT 100;

ways
rels 
lines 
roads
polygons

SELECT p1.point <-> ST_AsText(ST_MakePoint(-73.98566160671253, 40.74850923574858), 4326) AS dist, 
            tags->'addr:number' AS housenumber,
            tags -> 'addr:street' AS street,
            tags -> 'addr:city' AS city,
            tags -> 'addr:state' AS state,
            tags -> 'addr:postcode' AS zip
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
FROM
  planet_osm_polygon points
) AS p1
ORDER BY dist ASC
LIMIT 100;
addr:housename | addr:housenumber

SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            tags
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
FROM
  planet_osm_point points
) AS p1
WHERE (
p1.tags->'addr:street' ILIKE 'Polpis' OR 
p1.hn ILIKE 'Polpis' OR 
p1.hu ILIKE 'Polpis' )
ORDER BY dist ASC
LIMIT 100;

export PGPASSWORD=renderer
docker run -p 3000:3000 \
        -e PGPASSWORD \
        -e DATABASE_URL=postgresql://renderer@146.190.141.61:5432/gis \
        ghcr.io/maplibre/martin

wget https://github.com/maptiler/tileserver-gl/releases/download/v1.3.0/zurich_switzerland.mbtiles
docker run --memory 15g --rm -it -v $(pwd):/data -p 8080:8080 maptiler/tileserver-gl --file tiles.mbtiles
[in your browser, visit http://[server ip]:8080]
