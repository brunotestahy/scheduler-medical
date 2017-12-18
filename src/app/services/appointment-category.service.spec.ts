import { TestBed, inject } from '@angular/core/testing';

import { AppointmentCategoryService } from './appointment-category.service';
import { Http, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('AppointmentCategoryService', () => {
  const _http: Http = new Http(new MockBackend(), new RequestOptions());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: _http },
        AppointmentCategoryService
      ]
    });
  });

  it('should be created', inject([AppointmentCategoryService], (service: AppointmentCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
