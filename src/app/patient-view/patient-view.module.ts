import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientViewComponent } from './patient-view.component';
import { AjustFontComponent } from './ajust-font/ajust-font.component';
import { AlertsScopeComponent } from './alerts-scope/alerts-scope.component';
import { AlertsScopeService } from '../services/alerts-scope.service';
import { ProgressbarModule } from 'ngx-bootstrap';
import { CalendarModule as AngularCalendar } from 'angular-calendar';
import { GreetingModule, IdentificationModule } from 'front-end-common';
import { IdentificationPatientService } from '../services/identification-patient.service';
import { RestScreenComponent } from './rest-screen/rest-screen.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CarePlanListComponent } from './care-plan-list/care-plan-list.component';
import { CareplanService } from '../services/careplan.service';
import { RefreshService } from '../services/refresh.service';
import { DatePipe } from '../shared/pipes/date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: 'patient', component: PatientViewComponent
  },
  {
    path: '**', redirectTo: 'patient'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ProgressbarModule.forRoot(),
    AngularCalendar.forRoot(),
    IdentificationModule,
    GreetingModule,
    TranslateModule.forChild(),
    SharedModule,
  ],
  declarations: [
    AlertsScopeComponent,
    AjustFontComponent,
    CalendarComponent,
    CarePlanListComponent,
    DatePipe,
    PatientViewComponent,
    RestScreenComponent
  ],
  providers: [
    AlertsScopeService,
    CareplanService,
    IdentificationPatientService,
    RefreshService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class PatientViewModule { }
