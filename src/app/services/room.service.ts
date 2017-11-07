import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { AbstractService } from './abstract.service';
import { Patient } from '../shared/models/patient';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RoomService extends AbstractService {
  private sectorURL;

  constructor(protected http: Http) {
    super(http);

    this.baseURL = environment.baseURL + environment.room.baseURL;
    this.sectorURL = environment.room.sectorURL;
  }

  get(): Observable<any> {
    return super.get();
  }

  getSectors(): Observable<any> {
    return super.get(this.sectorURL);
  }
}
