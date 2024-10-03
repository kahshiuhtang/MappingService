# Scalable Map Service

Setup of a scalable map service. Files to start your own Google Maps clone.

## Server

There is a mix of js and php for handling the requests from the user. This acts as the server side code.

## Ansible

I added back some ansible files for ease of creating the servers. They should work, but there may be some endpoints or server ips that need to be changed. All of the main services and the monitoring services are included.

## .conf

Here are some files used for configuring the microservices. The setup is tuned to meet a certain latency threshold.
