SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            tags
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
FROM
  planet_osm_polygon points
) AS p1
WHERE p1.tags->'addr:street' IS NOT NULL
ORDER BY dist ASC
LIMIT 100;

SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            tags,
            p1.hn,
            p1.hu
FROM 
(SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
FROM
  planet_osm_road points
) AS p1
WHERE dist = 0
ORDER BY dist ASC
LIMIT 100;

SELECT *
FROM (
    SELECT p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            p1.tags,
            p1.hn,
            p1.hu
    FROM (
        SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
        FROM planet_osm_polygon points
    ) AS p1
) AS subquery
WHERE dist = 0
ORDER BY dist ASC
LIMIT 100;




SELECT *
FROM (
    SELECT  p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            p1.tags AS tags,
            p1.hn,
            p1.hu
    FROM (
        SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
        FROM planet_osm_line points
    ) AS p1
) AS subquery
WHERE tags->'addr:street' = 'Polpis Road' AND tags->'addr:state' = 'MA'
ORDER BY dist ASC
LIMIT 100;

SELECT *
FROM (
    SELECT  p1.point <-> ST_AsText(ST_MakePoint(-70.04069691126233, 41.29342817549477), 4326) AS dist, 
            p1.tags AS tags,
            p1.hn,
            p1.hu
    FROM (
        SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, 'addr:housename' AS hn, 'addr:housenumber' AS hu
        FROM planet_osm_line points
    ) AS p1
) AS subquery
WHERE tags->'addr:housenumber' = '180'
ORDER BY dist ASC
LIMIT 100;

SELECT * FROM planet_osm_line;