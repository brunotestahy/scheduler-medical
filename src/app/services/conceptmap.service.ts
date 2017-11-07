import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from './abstract.service';
import { environment } from '../../environments/environment';


@Injectable()
export class ConceptmapService extends AbstractService {

  constructor(protected http: Http) {
    super(http);

    this.baseURL = environment.baseURL + environment.conceptmap.baseURL;
  }

  get(system: string): Observable<any> {
    const options = new RequestOptions();
    options.params = new URLSearchParams();
    options.params.set('system', system.toString());

    return super.get(null, options);
  }
}
