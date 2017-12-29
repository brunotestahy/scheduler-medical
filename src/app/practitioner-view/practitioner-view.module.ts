import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './patient-list/patient-list.component';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { OrderPipe } from '../shared/pipes/order.pipe';
import { RulesCalendarComponent } from './rules-calendar/rules-calendar.component';
import { PractitionerViewComponent } from './practitioner-view.component';
import { PractitionerNameModule, SearchHeaderModule } from 'front-end-common';
import { PermissionsService } from '../services/permissions.service';
import { ConceptmapService } from '../services/conceptmap.service';
import { RoomService } from '../services/room.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '', component: PractitionerViewComponent,

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
  }
];

@NgModule({
  imports: [
    PractitionerNameModule,
    RouterModule.forChild(routes),
    SearchHeaderModule,
    SharedModule,
    TranslateModule.forChild()
  ],
  declarations: [
    FilterPipe,
    OrderPipe,
    PatientDetailComponent,
    PatientListComponent,
    PractitionerViewComponent,
    RulesCalendarComponent
  ],
  providers: [
    ConceptmapService,
    PermissionsService,
    RoomService
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class PractitionerViewModule { }
