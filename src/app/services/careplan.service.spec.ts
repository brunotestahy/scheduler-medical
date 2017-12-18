import { TestBed, inject } from '@angular/core/testing';

import { CareplanService } from './careplan.service';

describe('CareplanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CareplanService]
    });
  });

  it('should be created', inject([CareplanService], (service: CareplanService) => {
    expect(service).toBeTruthy();
  }));
});
