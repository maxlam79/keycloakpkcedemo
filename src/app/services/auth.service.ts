import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LocalStorage } from 'ngx-webstorage';

import { environment as env } from '../../environments/environment';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {

  @LocalStorage()
  keycloakStateStr: string;

  @LocalStorage()
  keycloakAuthCode: string;

  @LocalStorage()
  authCodeVerifier: string;

  @LocalStorage()
  authCodeChallenge: string;

  protected readonly END_POINT_CONF_URL: string;

  constructor( private http: HttpClient ) {
    this.END_POINT_CONF_URL = `http://${ env.keycloakHost }:${ env.keycloakPort }/auth/realms/${ env.keycloakRealmName }/.well-known/openid-configuration`;
  }

  gotoAuthServer(): void {

    // Check on the Keycloak end-point config, we need the 'authorization_endpoint' url value.
    this.http.get( this.END_POINT_CONF_URL )
      .subscribe( ( resp ) => {

        // Generate a random string as the 'state' parameter. Need to store this for later comparison.
        this.keycloakStateStr = this.generateRandomString( 12 );

        // Generate the code verifier
        this.authCodeVerifier = this.generateRandomString( 48 );

        /***
         * Generate the SHA256 Hash of it and encode it as Base64Url (NOT Base64!!!)
         *
         * This is the code_challenge to be sent to keycloak.
         */
        this.sha256( this.authCodeVerifier )
          .then( ( a ) => {
            this.authCodeChallenge = this.base64URLEncode( a );

            const authUrl = ( resp as any ).authorization_endpoint
              + `?response_type=code`
              + `&client_id=${ env.keycloakClientId }`
              + '&redirect_uri=' + encodeURIComponent( `http://${ env.ngClientHost }:${ env.ngClientPort }/validate` )
              + '&scope=openid email profile'
              + '&state=' + encodeURIComponent( this.keycloakStateStr )
              + '&code_challenge=' + this.authCodeChallenge
              + '&code_challenge_method=S256';

            console.log( 'authUrl', authUrl );

            window.location.href = authUrl;
          } );

      }, ( err ) => {
        console.error( err );
      } );
  }

  obtainAccessToken(): Observable<any> {

    // Wrap it in an observer to obtain the last of the HttpClient Response
    return new Observable<any>( ( obs ) => {

      // Check on the Keycloak end-point config, we need the 'token_endpoint' url value.
      this.http.get( this.END_POINT_CONF_URL )
        .subscribe( ( resp ) => {
          const authUrl = ( resp as any ).token_endpoint;

          const payload = new HttpParams()
            .set( 'grant_type', 'authorization_code' )
            .set( 'client_id', env.keycloakClientId )
            .set( 'redirect_uri', `http://${ env.ngClientHost }:${ env.ngClientPort }/validate` )
            .set( 'code', this.keycloakAuthCode )
            .set( 'code_verifier', this.authCodeVerifier );

          /***
           * The POST request payload must be of Content-Type: x-www-form-urlencoded.
           * (not necessary to have header of Authorization: Bearer xxx)
           *
           * Reference: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
           */
          this.http.post( authUrl, payload.toString(), {
            headers: new HttpHeaders()
              .set( 'Content-Type', 'application/x-www-form-urlencoded' )
          } ).subscribe( ( resp2 ) => {
            obs.next( resp2 );
            obs.complete();
          }, ( err ) => {
            console.error( err );
            obs.error( err );
          } );
        } );
    } );
  }

  generateRandomString( length ): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
    }

    return result;
  }

  sha256( plain ): PromiseLike<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode( plain );

    return window.crypto.subtle.digest( 'SHA-256', data );
  }

  base64URLEncode( a ): string {

    /***
     * Convert the ArrayBuffer to string using Uint8 array.
     * btoa takes chars from 0-255 and base64 encodes.
     * Then convert the base64 encoded to base64url encoded.
     * (replace + with -, replace / with _, trim trailing =)
     *
     * Reference: https://base64.guru/standards/base64url
     */
    return btoa( String.fromCharCode.apply( null, new Uint8Array( a ) ) )
      .replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
  }
}
