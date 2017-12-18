import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PatientViewComponent } from './patient-view.component';

describe('PatientViewComponent', () => {
  let component: PatientViewComponent;
  let fixture: ComponentFixture<PatientViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PatientViewComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute the loadPatient method and define the patient data, name and set the online mode to true', () => {
    component.loadPatient();

    expect(component.schedulerConfig.patientData).toBeDefined();
    expect(component.schedulerConfig.newEventHeader.patientName).toBeDefined();
    expect(component.schedulerConfig.onlineMode).toBeTruthy();
  });
});
