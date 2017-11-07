import { TestBed, inject } from '@angular/core/testing';

import { PatientCardsService } from './patient.service';

describe('PatientCardsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatientCardsService]
    });
  });

  it('should be created', inject([PatientCardsService], (service: PatientCardsService) => {
    expect(service).toBeTruthy();
  }));
});
