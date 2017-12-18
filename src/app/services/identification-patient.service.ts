import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { AbstractService } from 'front-end-common';

@Injectable()
export class IdentificationPatientService extends AbstractService {

  private careProvidersURL: string;

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.identification.patientURL;
    this.careProvidersURL = environment.identification.careProvidersURL;
  }

  getCareProviders(id: string): Observable<any> {
    return super.get('/' + id + this.careProvidersURL, null);
  }
}
