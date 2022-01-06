#What is this
This is a demo web front end client that shows the necessary basic PKCE flow of an OIDC/OAuth2 authentication against Keycloak.

#How to setup
##Setup Keycloak
1. Just setup the keycloak server with the below (just spin up a docker container for this purpose - docker-compose.yaml):

> Note: using 14902 as the port for Keycloak

``
version: '3.7'
services:
  keycloak:
    image: jboss/keycloak:14.0.0
    container_name: keycloak
    restart: always
  ports:
    - 14902:8080
  environment:
    KEYCLOAK_USER: admin
    KEYCLOAK_PASSWORD: pwd1234
``

2. Login to Keycloak and create a Keycloak Realm: **"demo"**
3. Switch to the "demo" realm and create a client **"demopkce"**
4. Click on the **demopkce** client and have the settings below:
* Client Protocol: openid-connect
* Access Type: public
* Standard Flow Enabled: true
* Implicit Flow Enabled: false
* Direct Access Grants Enable: false
* Valid Redirect URIs: for web: https://localhost:4200/validate (for mobile, mobileappname://)
* Web Origins: '*'
* Advance Settings: Proof Key for Code Exchange Code Challenge Method: S256
5. Click on "Users" -> "Add User"

##Running this demo web client
1. For the demo web client, the environment setting is in src -> environments -> environments.ts
2. To run this client: ``ng serve``
3. Access "http://localhost:4200" and open up the development panel on the browser if needed.
4. Go through the flow to understand the authentication process. the "Validate" page will show all the necessary info on the access, id and refresh token.
5. Use [https://www.jstoolset.com/jwt](https://www.jstoolset.com/jwt) to decode the JWT tokens and inspect the contents.
