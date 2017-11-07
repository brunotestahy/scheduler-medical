import { Response, RequestOptions, ConnectionBackend } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from './../environments/environment';

import { HttpInterceptor } from './http-interceptor';
import { InterceptorConfig } from './http-interceptor';


export class CustomHttp extends HttpInterceptor {
  private loginURL = environment.baseURL + environment.login.ldapURL;
  private smartLoginURL = environment.baseURL + environment.login.smartURL;
  private patient = true;
  private login;
  private password;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions, new InterceptorConfig({ noTokenError: true }));
  }

  public doLogin(login: string, password: string): Observable<Response> {
    this.login = login;
    this.password = password;
    this.patient = false;

    const body = {};
    body['login'] = login;
    body['password'] = password;
    body['userType'] = 'employee';
    return super.post(this.loginURL, body, null, true);
  }

  public isPatient(): boolean {
    return this.patient;
  }

  public setPatient(isPatient: boolean): void {
    this.patient = isPatient;
  }

  public getToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      let token = localStorage.getItem('smart_token');
      if (!token) {
        token = null;
      }
      resolve(token);
    });
  }

  public saveToken(token: string): Promise<string> {
    return new Promise ((resolve, reject) => {
      localStorage.setItem('smart_token', token);
      resolve(token);
    });
  }

  protected refreshToken(): Observable<Response> {
    if (this.isPatient) {
      console.log(this.smartLoginURL);
      return super.post(this.smartLoginURL, {}, null, true);
    }
    const body = {};
    body['login'] = this.login;
    body['password'] = this.password;
    body['userType'] = 'employee';
    return super.post(this.loginURL, body, null, true);
  }
}
