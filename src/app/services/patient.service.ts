import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Patient } from '../shared/models/patient';
import { Subject } from 'rxjs/Subject';
import { AbstractService } from 'front-end-common';

@Injectable()
export class PatientService extends AbstractService {
  private patientsURL: string;
  localPatient: any;
  private searchURL: string;
  private searchPaginatedURL: string;
  private selectedPatient: Patient;
  private hisURL: string;
  private paginationURL: string;
  private his: string;
  private activitySource = new Subject<any>();

  constructor(protected http: Http) {
    super(http);
    this.baseURL = environment.patientSchedule.baseURL;
    this.patientsURL = environment.patientSchedule.patientUrl;
    this.searchURL = environment.patientSchedule.searchURL;
    this.his = environment.his;
    this.searchPaginatedURL = environment.patientSchedule.searchPaginatedURL;
  }

  setLocalPatient(patient) {
    this.localPatient = patient;
  }

  getLocalPatient() {
    return this.localPatient;
  }

  getSelectedPatient(): Patient {
    this.selectedPatient = JSON.parse(sessionStorage.getItem('patient-selected'));
    return this.selectedPatient;
  }

  setSelectedPatient(patient: Patient) {
    this.selectedPatient = patient;
    sessionStorage.setItem('patient-selected', JSON.stringify(this.selectedPatient));
  }

  getAll(): Observable<any> {
    return super.get(this.patientsURL);
  }

  searchPatients(names?: string, room?: string, full?: boolean, his?: string, admitted?: boolean): Observable<any> {
    const options = this.createSearchParams(names, room, full, his, admitted);
    return super.get(this.searchURL, options);
  }

  searchPatientsPaginated(names?: string, room?: string, full?: boolean, his?: string, admitted?: boolean): Observable<any> {
    const options = this.createSearchParams(names, room, full, his, admitted);
    return super.get(this.searchPaginatedURL, options);
  }

  getAdmittedPatientsByHIS(his: string): Observable<any> {
    const options = new RequestOptions();
    options.params = new URLSearchParams();
    options.params.set('system', his || this.his);
    return super.get(this.hisURL, options);
  }

  getPatientsByHIS(his: string): Observable<any> {
    const options = new RequestOptions();
    options.params = new URLSearchParams();
    options.params.set('system', his || this.his);
    return super.get(this.hisURL, options);
  }

  paginate(url: string): Observable<any> {
    const options = new RequestOptions();
    options.params = new URLSearchParams();
    options.params.set('url', url);
    return super.get(this.paginationURL, options);
  }

  announceActivity(activities: any) {
    this.activitySource.next(activities);
  }

  private createSearchParams(names?: string, room?: string, full?: boolean, his?: string, admitted?: boolean): RequestOptions {
    const options = new RequestOptions();
    options.params = new URLSearchParams();

    if (names !== null) {
      options.params.set('names', names);
    }
    if (room !== null) {
      options.params.set('room', room);
    }
    if (full !== null) {
      options.params.set('full', JSON.stringify(full));
    }
    options.params.set('system', his || this.his);
    if (admitted !== null) {
      options.params.set('admitted', JSON.stringify(admitted));
    }
    return options;
  }
}
