import { TestBed, inject } from '@angular/core/testing';

import { AppointmentCategoryService } from './appointment-category.service';

describe('AppointmentCategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentCategoryService]
    });
  });

  it('should be created', inject([AppointmentCategoryService], (service: AppointmentCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
