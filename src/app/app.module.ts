import { environment } from '../environments/environment';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Http, HttpModule, RequestOptions, XHRBackend } from '@angular/http';
import { ProgressbarModule } from 'ngx-bootstrap';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, CheckboxModule, GrowlModule, ScheduleModule } from 'primeng/primeng';
import { RestScreenComponent } from './rest-screen/rest-screen.component';
import { CalendarComponent } from './patient-view/calendar/calendar.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { PatientListComponent } from './practitioner-view/patient-list/patient-list.component';
import { PatientDetailComponent } from './practitioner-view/patient-detail/patient-detail.component';
import { CalendarModule as AngularCalendar } from 'angular-calendar';
import { PractitionerViewComponent } from './practitioner-view/practitioner-view.component';
import { PatientViewComponent } from './patient-view/patient-view.component';
import { ScheduleService } from './services/schedule.service';
import {
  CardModule, DialogModule, HeaderModule, LoadingModule, PractitionerNameModule, SearchHeaderModule,
  SelectModule, LoginModule, FrontEndConfigProvider, MenuModule, FrontEndHttpFactory, GreetingModule, IdentificationModule, UiLogModule
} from 'front-end-common';
import { AppointmentCategoryService } from './services/appointment-category.service';
import { AppointmentTypeService } from './services/appointment-type.service';
import { AppointmentService } from './services/appointment.service';
import { PatientService } from './services/patient.service';
import { FormsModule } from '@angular/forms';
import { RulesCalendarComponent } from './practitioner-view/rules-calendar/rules-calendar.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { DatePipe } from './shared/pipes/date.pipe';
import { ClickOutsideDirective } from './shared/directives/click-outside.directive';
import { AppointmentStandardService } from './services/appointment-standard.service';
import { AppointmentListService } from './services/appointment-list.service';
import { AjustFontComponent } from './ajust-font/ajust-font.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OrderPipe } from './shared/pipes/order.pipe';
import { AlertsScopeComponent } from './alerts-scope/alerts-scope.component';
import { AlertsScopeService } from './services/alerts-scope.service';
import { RoomService } from './services/room.service';
import { ConceptmapService } from './services/conceptmap.service';
import { PermissionsService } from './services/permissions.service';
import { CarePlanListComponent } from './patient-view/care-plan-list/care-plan-list.component';
import { Router } from '@angular/router';
import { CareplanService } from './services/careplan.service';
import { RefreshService } from './services/refresh.service';
import { WarningComponent } from './warning/warning.component';
import { IdentificationPatientService } from './services/identification-patient.service';
import { MessageService } from 'primeng/components/common/messageservice';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

export class MyHammerConfig extends HammerGestureConfig  {
  overrides = {
    'swipe': {velocity: 0.4, threshold: 20} // override default settings
  };
}

@NgModule({
  declarations: [
    AppComponent,
    RestScreenComponent,
    CalendarComponent,
    SchedulerComponent,
    PatientListComponent,
    PatientDetailComponent,
    PractitionerViewComponent,
    PatientViewComponent,
    RulesCalendarComponent,
    FilterPipe,
    DatePipe,
    OrderPipe,
    ClickOutsideDirective,
    AjustFontComponent,
    AlertsScopeComponent,
    CarePlanListComponent,
    WarningComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ScheduleModule,
    ProgressbarModule.forRoot(),
    AngularCalendar.forRoot(),
    HeaderModule,
    DialogModule,
    SearchHeaderModule,
    PractitionerNameModule,
    MenuModule,
    CardModule,
    LoadingModule,
    SelectModule,
    FormsModule,
    LoginModule,
    CheckboxModule,
    GreetingModule,
    IdentificationModule,
    CalendarModule,
    GrowlModule,
    UiLogModule
  ],
  providers: [
    ScheduleService,
    AlertsScopeService,
    AppointmentCategoryService,
    AppointmentTypeService,
    AppointmentService,
    AppointmentStandardService,
    AppointmentListService,
    PatientService,
    ConceptmapService,
    PermissionsService,
    RoomService,
    CareplanService,
    RefreshService,
    IdentificationPatientService,
    MessageService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig
    },
    {provide: FrontEndConfigProvider, useValue: environment},
    {
      provide: Http,
      useFactory: FrontEndHttpFactory,
      deps: [XHRBackend, RequestOptions, FrontEndConfigProvider, Router]
    },
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
}
