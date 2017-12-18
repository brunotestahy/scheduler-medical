import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { AppointmentList } from '../shared/models/appointment-list';
import { AbstractService } from 'front-end-common';

@Injectable()
export class AppointmentListService extends AbstractService {
  private appointmentListByPatientUrl: string;

  constructor(protected  http: Http) {
    super(http);
    this.baseURL = environment.appointmentList.baseURL;
    this.appointmentListByPatientUrl = environment.appointmentList.patientUrl;
  }

  getAppointmentList(appointmentListId: string): Observable<AppointmentList> {
    return super.get('/' + appointmentListId);
  }

  getAppointmentListByPatient(patientId: string): Observable<AppointmentList> {
    return super.get(this.appointmentListByPatientUrl + '/' + patientId);
  }

  create(appointmentList: AppointmentList): Observable<any> {
    return super.post(null, appointmentList);
  }

  update(idAppointmentList: string, appointmentList: AppointmentList): Observable<any> {
    return super.put(idAppointmentList, appointmentList);
  }

  deleteAppointmentList(requestOptions: RequestOptions): Observable<any> {
    return super.delete(null, requestOptions);
  }
}
