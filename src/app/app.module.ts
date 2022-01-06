import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BeginComponent } from './views/begin/begin.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ValidateComponent } from './views/validate/validate.component';

@NgModule( {
  declarations: [
    AppComponent,
    BeginComponent,
    ValidateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot()
  ],
  providers: [],
  bootstrap: [ AppComponent ]
} )
export class AppModule {
}
