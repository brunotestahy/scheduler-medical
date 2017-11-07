import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Http, HttpModule, ConnectionBackend, RequestOptions, XHRBackend  } from '@angular/http';
import { CustomHttp } from './custom-http';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ScheduleModule } from 'primeng/primeng';
import { RestScreenComponent } from './rest-screen/rest-screen.component';
import { CalendarComponent } from './patient-view/calendar/calendar.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { PatientListComponent } from './practitioner-view/patient-list/patient-list.component';
import { PatientDetailComponent } from './practitioner-view/patient-detail/patient-detail.component';
import { CalendarModule } from 'angular-calendar';
import { PractitionerViewComponent } from './practitioner-view/practitioner-view.component';
import { PatientViewComponent } from './patient-view/patient-view.component';
import { ScheduleService } from './services/schedule.service';
import {
  CardModule, DialogModule, HeaderModule, LoadingModule, PractitionerNameModule, SearchHeaderModule,
  SelectModule
} from 'front-end-common';
import { AppointmentCategoryComponent } from './appointment-category/appointment-category.component';
import { AppointmentCategoryService } from './services/appointment-category.service';
import { AppointmentTypeService } from './services/appointment-type.service';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { AppointmentService } from './services/appointment.service';
import { PatientCardsComponent } from './patient-cards/patient-cards.component';
import { PatientService } from './services/patient.service';
import { FormsModule } from '@angular/forms';
import { RulesCalendarComponent } from './practitioner-view/rules-calendar/rules-calendar.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { ClickOutsideDirective } from './shared/directives/click-outside.directive';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginService } from './services/login.service';
import { AppointmentStandardService} from './services/appointment-standard.service';
import { AppointmentStandardComponent } from './appointment-standard/appointment-standard.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentListService } from './services/appointment-list.service';
import { GreetingComponent } from './patient-view/greeting/greeting.component';
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

export function getCustomHttp(backend: ConnectionBackend, defaultOptions: RequestOptions) {
  return new CustomHttp(backend, defaultOptions);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RestScreenComponent,
    CalendarComponent,
    SchedulerComponent,
    PatientListComponent,
    PatientDetailComponent,
    PractitionerViewComponent,
    PatientViewComponent,
    AppointmentCategoryComponent,
    AppointmentTypeComponent,
    RulesCalendarComponent,
    AppointmentTypeComponent,
    AppointmentComponent,
    PatientCardsComponent,
    FilterPipe,
    OrderPipe,
    ClickOutsideDirective,
    AppointmentStandardComponent,
    AppointmentListComponent,
    GreetingComponent,
    AjustFontComponent,
    AlertsScopeComponent
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
    CalendarModule.forRoot(),
    HeaderModule,
    DialogModule,
    SearchHeaderModule,
    PractitionerNameModule,
    CardModule,
    LoadingModule,
    SelectModule,
    FormsModule
  ],
  providers: [{
    provide: Http,
    useFactory: getCustomHttp,
    deps: [XHRBackend, RequestOptions]
    },
    ScheduleService,
    AlertsScopeService,
    AppointmentCategoryService,
    AppointmentTypeService,
    AppointmentService,
    AppointmentStandardService,
    AppointmentListService,
    PatientService,
    LoginService,
    ConceptmapService,
    PermissionsService,
    RoomService,
    AuthGuard
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
}
