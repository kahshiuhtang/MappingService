# Scalable Map Service

Setup of a scalable map service. These are some files that can be used to create different services required for your mapping service.

## Background

This is a mapping service that allows users to view parts of a map, generate routes and search for points within a given space. Map data is stored inside Postgres as GIS data points. Varnish was the chosen load balancer and Apache HTTP server/ Node.js was used for business logic. In order to improve searching, Elasticsearch was integrated on top of the GIS data points.

## Server

There is a mix of js and php for handling the requests from the user. This acts as the server side code. There is monitoring done with Prometheus and Grafana.

## Ansible

I added back some ansible files for ease of creating the servers. They should work, but there may be some endpoints or server ips that need to be changed. All of the main services and the monitoring services are included.

## .conf

Here are some files used for configuring the microservices. The setup is tuned to meet a certain latency threshold.
