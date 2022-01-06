import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component( {
  selector: 'app-begin',
  templateUrl: './begin.component.html',
  styleUrls: [ './begin.component.scss' ]
} )
export class BeginComponent implements OnInit {

  constructor( private authServ: AuthService ) {
  }

  ngOnInit(): void {
  }

  // Navigation
  gotoKeycloakLogin() {
    this.authServ.gotoAuthServer();
  }
}
