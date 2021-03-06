import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from 'front-end-common';


@Injectable()
export class AppointmentCategoryService extends AbstractService {
  private appointmentCategoryUrl: string;

    constructor(protected http: Http) {
        super(http);
        this.baseURL = environment.appointment.baseURL;
        this.appointmentCategoryUrl = environment.appointment.categoryUrl;
    }


  getCategories(): Observable<any> {
    return super.get(this.appointmentCategoryUrl);
  }
}
