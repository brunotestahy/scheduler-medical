import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppointmentType } from '../shared/models/appointment-type';
import { AbstractService } from 'front-end-common';

@Injectable()
export class AppointmentTypeService extends AbstractService {

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.appointment.baseURL + environment.appointment.typeUrl;
  }


  getTypes(): Observable<any> {
    return super.get('');
  }

  create(appointmentType: AppointmentType): Observable<any> {
    console.log(this.baseURL);
    return super.post(null, appointmentType);
  }

  update(id: string, appointmentType: AppointmentType): Observable<any> {
    return super.put(id, appointmentType);
  }

  deleteAppointmentType(requestOptions: RequestOptions): Observable<any> {
    return super.delete(null, requestOptions);
  }

}
