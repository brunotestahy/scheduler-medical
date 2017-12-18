import { TestBed, inject } from '@angular/core/testing';

import { AppointmentService } from './appointment.service';
import { Http, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AppointmentService', () => {
  const _http: Http = new Http(new MockBackend(), new RequestOptions());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: _http },
        AppointmentService
      ]
    });
  });

  it('should be created', inject([AppointmentService], (service: AppointmentService) => {
    expect(service).toBeTruthy();
  }));
});
