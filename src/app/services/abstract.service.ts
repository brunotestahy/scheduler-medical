import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';


@Injectable()
export abstract class AbstractService {
  protected baseURL: string;

  protected constructor(protected http: Http) {
  }

  protected get(appendURL?: string, options?: RequestOptions): Observable<any> {
    let url = this.baseURL;
    if (appendURL) {
      url += appendURL;
    }
    return this.http.get(url, options).map(this.extractData).catch(this.handleError);
  }

  protected getForId(id: string, options?: RequestOptions): Observable<any> {
    return this.http.get(this.baseURL + '/' + id, options).map(this.extractData).catch(this.handleError);
  }

  protected getForPatient(patientURL: string, patientId: string, options?: RequestOptions): Observable<any> {
    if (!options || options === null) {
      options = new RequestOptions();
      options.params = new URLSearchParams();
    }
    options.params.set('id', patientId);
    return this.http.get(this.baseURL + patientURL, options).map(this.extractData).catch(this.handleError);
  }

  protected getForCarePlan(planId: string, options?: RequestOptions): Observable<any> {
    if (!options || options === null) {
      options = new RequestOptions();
      options.params = new URLSearchParams();
    }
    options.params.set('carePlanId', planId);
    return this.http.get(this.baseURL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  protected post(body: any, options?: RequestOptions): Observable<any> {
    console.log("fazendo acesso à baseURL: ", this.baseURL);
    return this.http.post(this.baseURL, body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  protected put(id: string, body: any, options?: RequestOptions): Observable<any> {
    return this.http.put(this.baseURL + '/' + id, body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  protected putWithoutId(body: any, options?: RequestOptions): Observable<any> {
    return this.http.put(this.baseURL, body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  protected delete(options?: RequestOptions): Observable<any> {
    return this.http.delete(this.baseURL, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  protected extractData(res: Response) {
    return res.json() || {};
  }

  protected handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = err;
    } else {
      errMsg = error.message ? JSON.stringify(error.message) : JSON.stringify(error);
    }
    return Observable.throw(errMsg);
  }
}
