import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCategoryComponent } from './appointment-category.component';

describe('AppointmentCategoryComponent', () => {
  let component: AppointmentCategoryComponent;
  let fixture: ComponentFixture<AppointmentCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
