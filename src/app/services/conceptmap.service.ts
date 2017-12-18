import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { AbstractService } from 'front-end-common';


@Injectable()
export class ConceptmapService extends AbstractService {

  constructor(protected http: Http) {
    super(http);

    this.baseURL = environment.conceptmap.baseURL;
  }

  get(system: string): Observable<any> {
    const options = new RequestOptions();
    options.params = new URLSearchParams();
    options.params.set('system', system.toString());

    return super.get(null, options);
  }
}
