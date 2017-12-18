import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarePlanListComponent } from './care-plan-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProgressbarModule } from 'ngx-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateStore } from '@ngx-translate/core/src/translate.store';

describe('CarePlanListComponent', () => {
  let component: CarePlanListComponent;
  let fixture: ComponentFixture<CarePlanListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarePlanListComponent ],
      imports: [
        ProgressbarModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        TranslateStore
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarePlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
