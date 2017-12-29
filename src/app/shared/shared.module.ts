import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Http, HttpModule, RequestOptions, XHRBackend } from '@angular/http';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule, CheckboxModule, GrowlModule, ScheduleModule } from 'primeng/primeng';

import {
CardModule,
DialogModule,
FrontEndConfigProvider,
FrontEndHttpFactory,
HeaderModule,
LoadingModule,
LoginModule,
MenuModule,
SelectModule
} from 'front-end-common';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentStandardService } from '../services/appointment-standard.service';
import { AppointmentListService } from '../services/appointment-list.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppointmentCategoryService } from '../services/appointment-category.service';
import { AppointmentTypeService } from '../services/appointment-type.service';
import { PatientService } from '../services/patient.service';
import { ScheduleService } from '../services/schedule.service';
import { WarningComponent } from './warning/warning.component';
import { environment } from '../../environments/environment';
import { SchedulerComponent } from './scheduler/scheduler.component';

@NgModule({
  imports: [
    CalendarModule,
    CardModule,
    CheckboxModule,
    CommonModule,
    DialogModule,
    FormsModule,
    GrowlModule,
    HeaderModule,
    HttpClientModule,
    HttpModule,
    MenuModule,
    LoadingModule,
    LoginModule,
    SelectModule,
    ScheduleModule,
    TranslateModule.forChild()
  ],
  declarations: [
    ClickOutsideDirective,
    SchedulerComponent,
    WarningComponent
  ],
  providers: [
    AppointmentCategoryService,
    AppointmentTypeService,
    AppointmentListService,
    AppointmentService,
    AppointmentStandardService,
    MessageService,
    PatientService,
    ScheduleService,
    {provide: FrontEndConfigProvider, useValue: environment},
    {
      provide: Http,
      useFactory: FrontEndHttpFactory,
      deps: [XHRBackend, RequestOptions, FrontEndConfigProvider, Router]
    }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  exports: [
    CalendarModule,
    CardModule,
    CheckboxModule,
    CommonModule,
    ClickOutsideDirective,
    DialogModule,
    FormsModule,
    HeaderModule,
    HttpClientModule,
    HttpModule,
    LoadingModule,
    LoginModule,
    MenuModule,
    ScheduleModule,
    SchedulerComponent,
    SelectModule,
    WarningComponent
  ]
})
export class SharedModule {
}
