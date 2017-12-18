import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Appointment } from '../shared/models/appointment';
import { AbstractService } from 'front-end-common';


@Injectable()
export class AppointmentService extends AbstractService {
  private appointmentUrl: string;
  private patientAppointmentUrl: string;

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.appointment.baseURL;
    this.appointmentUrl = environment.appointment.appointmentUrl;
    this.patientAppointmentUrl = environment.appointment.patientUrl;
  }


  getAll(): Observable<any> {
    console.log(this.appointmentUrl);
    const options = new RequestOptions();
    const params: URLSearchParams = new URLSearchParams;
    params.set('context', 'schedule');
    options.search = params;
    return super.get(this.appointmentUrl, options);
  }

  getPatientAppointments(patientId: string): Observable<any> {
    console.log(this.appointmentUrl);
    const options = new RequestOptions();
    const params: URLSearchParams = new URLSearchParams;
    params.set('context', 'schedule');
    options.search = params;
    return super.get(this.patientAppointmentUrl + '/' + patientId, options);
  }

  getPatientAppointmentsByDate(patientId: string, date: string): Observable<any> {
    const options = new RequestOptions();
    const params: URLSearchParams = new URLSearchParams;
    params.set('date', date);
    params.set('context', 'schedule');
    options.search = params;
    console.log('busca com options.', options);
    return super.get(this.patientAppointmentUrl + '/' + patientId, options);
  }

  create(appointment: Appointment): Observable<any> {
    return super.post(null, appointment);
  }

  update(appointments: Appointment[]): Observable<any> {
    return super.putWithoutId(appointments);
  }

  /*   delete(appointments: String[]): Observable<any> {
   let requestOptions: RequestOptions = {body: appointments};

   // let requestOptions = new BaseRequestOptions();
   requestOptions.body = appointments;
   return super.delete(requestOptions);
   } */

  deleteAppointments(requestOptions: RequestOptions): Observable<any> {
    return super.delete(null, requestOptions);
  }

  createCollection(appointments: Appointment[]): Observable<any> {
    return super.post(null, appointments);
  }
}
