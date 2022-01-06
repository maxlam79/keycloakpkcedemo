import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocalStorage, LocalStorageService } from 'ngx-webstorage';

import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: [ './validate.component.scss' ]
} )
export class ValidateComponent implements OnInit {

  @LocalStorage()
  keycloakStateStr: string;

  @LocalStorage()
  keycloakAuthCode: string;

  @LocalStorage()
  authCodeVerifier: string;

  @LocalStorage()
  authCodeChallenge: string;

  // Holder
  authCodePhaseQueryParamMap = new Map<string, any>();
  accessTokenPhaseValueMap = new Map<string, any>();

  // Indicators
  stateNotMatch = false;

  constructor( private router: Router,
               private route: ActivatedRoute,
               private authServ: AuthService,
               private localStorageServ: LocalStorageService ) {
  }

  ngOnInit(): void {

    /***
     * There will be some query parameters once the auth server calls the redirect url.
     */
    this.route.queryParams.subscribe( ( q ) => {

      /***
       * Phase 1: Obtaining Auth Code
       * If the query parameter consists of both the 'code' and the 'state' returned by Keycloak...
       */
      if ( q.code && q.state ) {

        // Need this for info display...
        this.authCodePhaseQueryParamMap.clear();

        for ( let k of Object.keys( q ) ) {
          this.authCodePhaseQueryParamMap.set( k, q[ k ] );
        }

        // Proceed to obtaining the access token
        this.phaseAuthCode();
      } else {
        // Something is not quit right...
      }
    } );
  }

  phaseAuthCode() {

    // See if the state string matches what was given
    if ( this.keycloakStateStr !== this.authCodePhaseQueryParamMap.get( 'state' ) ) {
      this.stateNotMatch = true;
      this.localStorageServ.clear();

      return;
    }

    // Proceed to obtain the access token.
    this.keycloakAuthCode = this.authCodePhaseQueryParamMap.get( 'code' );
    console.log( 'Auth Code obtained from Keycloak: ', this.keycloakAuthCode );

    this.phaseAccessToken();
  }

  /***
   * Phase 2: Obtain the access token
   */
  phaseAccessToken() {
    this.accessTokenPhaseValueMap.clear();

    this.authServ.obtainAccessToken()
      .subscribe( ( resp ) => {

        for ( let k of Object.keys( resp ) ) {
          this.accessTokenPhaseValueMap.set( k, resp[ k ] );
        }
      }, ( err ) => {
        console.log( err );
      } );
  }
}
