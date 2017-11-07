import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from './abstract.service';
import { CustomHttp } from '../custom-http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LoginService extends AbstractService {
  private meURL = environment.baseURL + environment.login.meURL;
  private customHttp = this.http as CustomHttp;
  private isLogged: BehaviorSubject<boolean> = new BehaviorSubject(false);

  fetchLoginState$: Observable<boolean> = this.isLogged.asObservable();

  constructor(protected http: Http) {
    super(http);
  }

  login(login: string, password: string): Observable<Response> {
    return this.customHttp.doLogin(login, password);
  }

  saveToken(token: string): Promise<string> {
    return this.customHttp.saveToken(token);
  }

  public isPatient(): boolean {
    return this.customHttp.isPatient();
  }

  public setPatient(isPatient: boolean): void {
    this.customHttp.setPatient(isPatient);
  }

  public setLoginState(state: boolean) {
    this.isLogged.next(state);
  }

  me(): Observable<any> {
    return this.http.get(this.meURL).map(this.extractData).catch(this.handleError);
  }
}
