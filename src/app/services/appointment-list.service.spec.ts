import { TestBed, inject } from '@angular/core/testing';

import { AppointmentListService } from './appointment-list.service';

describe('AppointmentListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentListService]
    });
  });

  it('should be created', inject([AppointmentListService], (service: AppointmentListService) => {
    expect(service).toBeTruthy();
  }));
});
