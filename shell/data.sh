osm2pgsql --slim -d gis --hstore --multi-geometry --number-processes 4 --tag-transform-script /home/osm/openstreetmap-carto/openstreetmap-carto.lua --style /home/osm/openstreetmap-carto/openstreetmap-carto.style -C 8000 /home/osm/us-northeast.osm.pbf

curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt install fonts-liberation fonts-dejavu

sudo apt install fonts-noto-cjk fonts-noto-cjk-extra fonts-noto-hinted fonts-noto-unhinted fonts-unifont

render_list -m default -a -z 9 -Z 11 --num-threads=4