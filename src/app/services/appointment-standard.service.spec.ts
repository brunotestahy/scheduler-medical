import { TestBed, inject } from '@angular/core/testing';

import { AppointmentStandardService } from './appointment-standard.service';
import { Http, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AppointmentStandardService', () => {
  const _http: Http = new Http(new MockBackend(), new RequestOptions());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: _http },
        AppointmentStandardService
      ]
    });
  });

  it('should be created', inject([AppointmentStandardService], (service: AppointmentStandardService) => {
    expect(service).toBeTruthy();
  }));
});
