import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientViewComponent } from './patient-view/patient-view.component';
import { AppointmentCategoryComponent } from './appointment-category/appointment-category.component';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { PractitionerViewComponent } from './practitioner-view/practitioner-view.component';
import { PatientListComponent } from './practitioner-view/patient-list/patient-list.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { PatientCardsComponent } from './patient-cards/patient-cards.component';
import { PatientDetailComponent } from './practitioner-view/patient-detail/patient-detail.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';
import {AppointmentStandardComponent} from './appointment-standard/appointment-standard.component';
import {AppointmentListComponent} from './appointment-list/appointment-list.component';


const routes: Routes = [
  {
    path: 'scheduler-patient', component:  PatientViewComponent
  },
  {
    path: 'scheduler-practitioner', component:  PractitionerViewComponent,
    children: [
      {
        path: 'patients', component: PatientListComponent
      },
      {
        path: 'patient/:id', component: PatientDetailComponent, canActivate: [AuthGuard]
      },
      {
        path: '**', redirectTo: 'patients'
      }
    ]
  },
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'appointment-category', component: AppointmentCategoryComponent
  },
  {
    path: 'appointment-type', component: AppointmentTypeComponent
  },
  {
    path: 'appointment', component: AppointmentComponent
  },
  {
    path: 'appointment-standard', component: AppointmentStandardComponent
  },
  {
    path: 'appointment-list', component: AppointmentListComponent
  },
  {
    path: 'patient-cards', component: PatientCardsComponent
  },
  {
    path: '**', redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
