import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCardsComponent } from './patient-cards.component';

describe('PatientCardsComponent', () => {
  let component: PatientCardsComponent;
  let fixture: ComponentFixture<PatientCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
