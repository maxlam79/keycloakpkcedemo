import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeginComponent } from './views/begin/begin.component';
import { ValidateComponent } from './views/validate/validate.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'begin' },
  { path: 'begin', component: BeginComponent },
  { path: 'validate', component: ValidateComponent }
];

@NgModule( {
  imports: [ RouterModule.forRoot( routes ) ],
  exports: [ RouterModule ]
} )
export class AppRoutingModule {
}
