# Videos API Project

Project to showcase using NodeJS and Postgres to create APIs to manage a simple Videos library.

## Overview
Video management backend system, exposing APIs, to allow users to add and view videos in the Videos catalog. Authorised users will have some simple management capabilities to manage the Videos catalog.

## Features
The system provides API endpoints that will enable the following features:
- User Management:
    - Registering a user (POST /user/register): Registers a user into the system as an authorised user. An API Key will be generated to needs to be kept secure and supplied when intending to use a feature that requires authorisation. The same username cannot be reused once it has been registered.
    - Unregister a user (PUT /user/{username}/unregister): To unregister/disable a user. Can only be done by the user themselves or an admin of the system.
    - Retrieve the list of users (GET /user/all): Retrieves the list of users in the system. Can only be requested by an admin of the system.
    - Retrieve the details of a given users (GET /user/{username}): Retrieve the details of a given username from the system. Can only be done by the user themselves or an admin of the system.
- Video Management:
    - Add a new video to the catalog (POST /video/): Allows any user to add a new video to the catalog. However, only authorised users can add a private (not publicly accessible) video.
    - Retrieve a list of videos (GET /video/list): Gets a list of videos from the catalog. By default the list will only contain public videos. Only authorised users can include private videos that belong to them in the list or an admin can include all private videos in the list. The list can also be filtered to only showing the popular videos (ie. viewed more than 42 times).
    - Retrieve the details of a video (GET /video/{video_id}): Gets the details of a video based on the given id. The public can only view the details of a public video, while only authorised users can view the details of their own private videos. Admins can view the details of any private video.
    - Delete a video from the catalog (DELETE /video/{video_id}): Allows an authorised user to delete their own videos from the catalog. Admins have the authority to delete any videos.
    - Update the details of a video (PUT /video/{video_id}/update): Allows an authorised user to update the details of this own video. An admin can update the details of any video.


The Swagger documentation of the available API endpoints can be accessed here once the container is running: http://localhost:8080/docs

## Design

### Architecture
Simple architecture diagram giving an overview of the core components of the system:
[![](https://mermaid.ink/img/pako:eNp1kktugzAQhq-CZpVI8QVYRGpKF62iqmqkbiALFw_FkrEjP1JVUe5eY5eGAGYzw883T-YCtWIIOTRCfdct1Tbbv1cy808tOEq7enh7zh6Du466cZ9fmp7a7NVHvhyiGD6gPqO-vTsvEK2cRW3KYE0exOONOXOGagYF9TjJ1FLJRE8NTiLZAreYr_PtC1NGk8g1YaZ54sSEbMejLi9ggIamEsMRQkbNLVS6W1hij__YvNi9nqo2o8bbCBhKFmw8El9w9PMnA20_-uBiV66CkxW7dVzhtMoSCBvoUHeUM3-jlz6sAttihxXk3mXYUCdsBZW8etSdGLX4xLhVGvKGCoMboM6qw4-sIbfa4QAVnPor7v6o6y95IgDi)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNp1kktugzAQhq-CZpVI8QVYRGpKF62iqmqkbiALFw_FkrEjP1JVUe5eY5eGAGYzw883T-YCtWIIOTRCfdct1Tbbv1cy808tOEq7enh7zh6Du466cZ9fmp7a7NVHvhyiGD6gPqO-vTsvEK2cRW3KYE0exOONOXOGagYF9TjJ1FLJRE8NTiLZAreYr_PtC1NGk8g1YaZ54sSEbMejLi9ggIamEsMRQkbNLVS6W1hij__YvNi9nqo2o8bbCBhKFmw8El9w9PMnA20_-uBiV66CkxW7dVzhtMoSCBvoUHeUM3-jlz6sAttihxXk3mXYUCdsBZW8etSdGLX4xLhVGvKGCoMboM6qw4-sIbfa4QAVnPor7v6o6y95IgDi)

### Database Model
Database design of the system:
[![](https://mermaid.ink/img/pako:eNptkstqwzAQRX9l0Mab9Ae8K6TdBEqgNCtvxtbYHipLQQ-XEPLvHflRB1MvhDSPqzPXuqvGaVKlIn9k7DwOlQVIgTzc8y5_IXq23RS0OBCcT2smJdaAVz7RDSr12jQUAnzLAUPgzpKG6ICw6WfF1nnAFHvnOUgOp_pK7e7xzlBWWyUwAHHspb_IKgWISoF6YFtsvbWTLrTA4UiGorRV6t1glwG0nL2UE3ALOKNwkOsjj5TVNAesDelZ7pGXkTW5zYJpUNY70uzG3iRvdpHYp6G2yOZrS220Z88jxjzvcaUMM-ZMIJzXpQStBuviYhsLMNQ3idiXJ0_zcE-Wso0QeaBwYfqZTPkQGpnftXP876JebK6JLHgSbhpXN_55AJNJ6qAG4UXW8ngmnyolP0myqpStphaTiVkjl6arlhHeNEfnVdmiCXRQgu0-b7ZRZfSJ1qLlGS5Vj1-DH-N4)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNptkstqwzAQRX9l0Mab9Ae8K6TdBEqgNCtvxtbYHipLQQ-XEPLvHflRB1MvhDSPqzPXuqvGaVKlIn9k7DwOlQVIgTzc8y5_IXq23RS0OBCcT2smJdaAVz7RDSr12jQUAnzLAUPgzpKG6ICw6WfF1nnAFHvnOUgOp_pK7e7xzlBWWyUwAHHspb_IKgWISoF6YFtsvbWTLrTA4UiGorRV6t1glwG0nL2UE3ALOKNwkOsjj5TVNAesDelZ7pGXkTW5zYJpUNY70uzG3iRvdpHYp6G2yOZrS220Z88jxjzvcaUMM-ZMIJzXpQStBuviYhsLMNQ3idiXJ0_zcE-Wso0QeaBwYfqZTPkQGpnftXP876JebK6JLHgSbhpXN_55AJNJ6qAG4UXW8ngmnyolP0myqpStphaTiVkjl6arlhHeNEfnVdmiCXRQgu0-b7ZRZfSJ1qLlGS5Vj1-DH-N4)

## Usage
This system has been implemented using Docker. Please make sure `Docker` and `docker-compose` are installed and running.

- run `docker-compose build` or `docker-compose build video`
- run `docker-compose up` or `docker-compose up video`

## Authentication
This system uses a simple API Key mechanism to determine whether a user has authorised access and the user's role to determine the level of authoriy.

There are 3 types of users:
- Admin:
    - User that is an administrator of the system.
    - The built-in admin user has the following access credentials:
        - Username: admin
        - API Key: b7db324f-e3ce-4f8e-a0e8-f73f35f1060c
- User:
    - User that has registered to the system and is supplied with an API Key.
    - User will have to provide the `username` and `API Key` when making any API request to be able to use the authorised features
- Public:
    - Any user that is not registered in the system, including those that have unregistered.
    - Only have access to view public videos.


## Tests

Tests for this project has been thought of but not implemented.
