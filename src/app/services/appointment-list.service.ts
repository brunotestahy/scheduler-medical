import { Injectable } from '@angular/core';
import {AbstractService} from './abstract.service';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {AppointmentList} from '../shared/models/appointment-list';

@Injectable()
export class AppointmentListService extends AbstractService{
  private appointmentListByPatientUrl: string;
  constructor(protected  http: Http) {
    super(http);
    this.baseURL = environment.baseURL + environment.appointmentList.baseURL;
    this.appointmentListByPatientUrl = environment.appointmentList.patientUrl;
  }

  getAppointmentList(appointmentListId: string): Observable<AppointmentList> {
    return super.get('/' + appointmentListId);
  }
  getAppointmentListByPatient(patientId: string): Observable<AppointmentList> {
    return super.get(this.appointmentListByPatientUrl + '/' + patientId);
  }
  create(appointmentList: AppointmentList): Observable<any> {
    return super.post(appointmentList);
  }
  update(idAppointmentList: string,  appointmentList: AppointmentList): Observable<any> {
    return super.put(idAppointmentList, appointmentList);
  }
  delete(requestOptions: RequestOptions): Observable<any> {
    return super.delete(requestOptions);
  }
}
