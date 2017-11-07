import { TestBed, inject } from '@angular/core/testing';

import { AppointmentTypeService } from './appointment-type.service';

describe('AppointmentTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentTypeService]
    });
  });

  it('should be created', inject([AppointmentTypeService], (service: AppointmentTypeService) => {
    expect(service).toBeTruthy();
  }));
});
