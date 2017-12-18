import { TestBed, inject } from '@angular/core/testing';

import { AppointmentTypeService } from './appointment-type.service';
import { Http, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AppointmentTypeService', () => {
  const _http: Http = new Http(new MockBackend(), new RequestOptions());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: _http },
        AppointmentTypeService
      ]
    });
  });

  it('should be created', inject([AppointmentTypeService], (service: AppointmentTypeService) => {
    expect(service).toBeTruthy();
  }));
});
