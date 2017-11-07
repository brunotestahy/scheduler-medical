import { TestBed, inject } from '@angular/core/testing';

import { AppointmentStandardService } from './appointment-standard.service';

describe('AppointmentStandardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentStandardService]
    });
  });

  it('should be created', inject([AppointmentStandardService], (service: AppointmentStandardService) => {
    expect(service).toBeTruthy();
  }));
});
