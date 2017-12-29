import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'patient', loadChildren: './patient-view/patient-view.module#PatientViewModule'
  },
  {
    path: 'practitioner', loadChildren: './practitioner-view/practitioner-view.module#PractitionerViewModule'
  },
  {
    path: 'login', loadChildren: './login/login.module#LoginModule'
  },
  {
    path: '**', redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
