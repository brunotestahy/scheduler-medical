import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AbstractService } from 'front-end-common';
import { Careplan } from '../shared/models/careplan';
import { CareplanActivityTypes } from '../shared/models/careplan-activity-types';
import { CareplanActivityCategories } from '../shared/models/careplan-activity-categories';

@Injectable()
export class CareplanService extends AbstractService {
  private careplanPatientURL: string;
  private careplanActivityTypeURL: string;
  private careplanActivityCategoryURL: string;

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.careplan.baseURL;
    this.careplanPatientURL = environment.careplan.patientUrl;
    this.careplanActivityTypeURL = environment.careplan.activityTypeUrl;
    this.careplanActivityCategoryURL = environment.careplan.activityCategoryUrl;
  }

  getCareplanActivityTypes(): Observable<CareplanActivityTypes> {
    return super.get(this.careplanActivityTypeURL);
  }

  getCareplaneActivityCategories(): Observable<CareplanActivityCategories> {
    return super.get(this.careplanActivityCategoryURL);
  }

  getPatientCareplan(patientId: string): Observable<Careplan> {
    return super.get(this.careplanPatientURL + '?id=' + patientId + '&active=true');
  }
}
