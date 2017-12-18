import { TestBed, inject } from '@angular/core/testing';

import { AppointmentListService } from './appointment-list.service';
import { Http, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AppointmentListService', () => {
  const _http: Http = new Http(new MockBackend(), new RequestOptions());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: _http },
        AppointmentListService
      ]
    });
  });

  it('should be created', inject([AppointmentListService], (service: AppointmentListService) => {
    expect(service).toBeTruthy();
  }));
});
