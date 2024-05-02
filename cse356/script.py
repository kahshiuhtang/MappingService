import re

def find_pattern_in_file(file_path):
    pattern = r'/tiles/(\d+)/(\d+)/(\d+)\.png'
    matches_list = []
    with open(file_path, 'r') as file:
        for line_number, line in enumerate(file, start=1):
            matches = re.findall(pattern, line)
            if matches:
                for match in matches:
                    # Extracting numbers from the match and storing as a tuple
                    match_tuple = tuple(map(int, match))
                    matches_list.append(match_tuple)
    return matches_list

# Example usage
file_path = './setup/s'  # Replace 'example_file.txt' with your file path
all_matches = find_pattern_in_file(file_path)
sor = sorted(all_matches)
file_path = "sorted.txt"
with open(file_path, 'w') as file:
    for tuple_item in sor:
        line = ' '.join(str(item) for item in tuple_item)
        file.write(line + '\n')

osm2pgsql --slim -d gis --hstore --multi-geometry --number-processes 4 --tag-transform-script /home/osm/openstreetmap-carto/openstreetmap-carto.lua --style /home/osm/openstreetmap-carto/openstreetmap-carto.style -C 8000 /home/osm/us-northeast.osm.pbf

<VirtualHost *:80>
    ServerName 162.243.184.81
    LogLevel info
    Include /etc/apache2/conf-available/renderd.conf

</VirtualHost>

curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt install fonts-liberation fonts-dejavu

 sudo apt install fonts-noto-cjk fonts-noto-cjk-extra fonts-noto-hinted fonts-noto-unhinted fonts-unifont

render_list -m default -a -z 9 -Z 11 --num-threads=4