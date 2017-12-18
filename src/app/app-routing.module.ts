import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientViewComponent } from './patient-view/patient-view.component';
import { PractitionerViewComponent } from './practitioner-view/practitioner-view.component';
import { PatientListComponent } from './practitioner-view/patient-list/patient-list.component';
import { PatientDetailComponent } from './practitioner-view/patient-detail/patient-detail.component';


const routes: Routes = [
  {
    path: 'patient', component:  PatientViewComponent
  },
  {
    path: 'practitioner', component:  PractitionerViewComponent,
    children: [
      {
        path: 'patients', component: PatientListComponent
      },
      {
        path: 'patient/:id', component: PatientDetailComponent
      },
      {
        path: '**', redirectTo: 'patients'
      }
    ]
  },
  {
    path: 'login', loadChildren: './login/login.module#LoginModule',
  },
  {
    path: '**', redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
