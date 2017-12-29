import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-practitioner-view',
  templateUrl: './practitioner-view.component.html',
  styleUrls: ['./practitioner-view.component.css']
})
export class PractitionerViewComponent implements OnInit {

  practitionerName: string;

  constructor() {
  }

  ngOnInit() {
    // Catching the practitioner's name to display on the view
    this.practitionerName = JSON.parse(sessionStorage.getItem('employee')) &&
    JSON.parse(sessionStorage.getItem('employee'))['dto'] ?
      JSON.parse(sessionStorage.getItem('employee'))['dto']['fullName'] : '';
  }

  // Links to open the specific pages on menu

  getCarePlanPath() {
    return environment.carePlanPage;
  }

  getSmartPath() {
    return environment.smartPage;
  }

  getIdentificationPath() {
    return environment.identificationPage;
  }
}
