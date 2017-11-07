import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from './abstract.service';
import {AppointmentType} from '../shared/models/appointment-type';


@Injectable()
export class AppointmentTypeService extends AbstractService {
  private paginationURL: string;
  //private typeUrl: string;

    constructor(protected http: Http){
      super(http);
      this.baseURL = environment.baseURL + environment.appointment.baseURL + environment.appointment.typeUrl;
      //this.typeUrl = ;
    }


  getTypes(): Observable<any> {
    return super.get("");
  }

  create(appointmentType: AppointmentType): Observable<any> {
      console.log (this.baseURL);
      return super.post(appointmentType);
  }

  update(id: string, appointmentType: AppointmentType): Observable<any> {
      return super.put(id, appointmentType);
  }

  delete(requestOptions: RequestOptions): Observable<any> {
      return super.delete(requestOptions);
  }

}
