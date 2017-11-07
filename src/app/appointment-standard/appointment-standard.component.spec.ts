import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStandardComponent } from './appointment-standard.component';

describe('AppointmentStandardComponent', () => {
  let component: AppointmentStandardComponent;
  let fixture: ComponentFixture<AppointmentStandardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentStandardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
