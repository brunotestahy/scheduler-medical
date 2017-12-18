import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from 'front-end-common';

@Injectable()
export class RoomService extends AbstractService {
  private sectorURL;

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.room.baseURL;
    this.sectorURL = environment.room.sectorURL;
  }

  get(): Observable<any> {
    return super.get();
  }

  getSectors(): Observable<any> {
    return super.get(this.sectorURL);
  }
}
