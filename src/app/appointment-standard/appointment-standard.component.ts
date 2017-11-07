import { Component, OnInit } from '@angular/core';
import {AppointmentStandardService} from '../services/appointment-standard.service';
import {AppointmentStandard} from '../shared/models/appointment-standard';
import {forEach} from '@angular/router/src/utils/collection';
import {AppointmentType} from '../shared/models/appointment-type';

@Component({
  selector: 'appointment-standard',
  templateUrl: './appointment-standard.component.html',
  styleUrls: ['./appointment-standard.component.css']
})
export class AppointmentStandardComponent implements OnInit {

  constructor(
    private appointmentStandardService: AppointmentStandardService
  ) {

  }


  appointmentStandard: AppointmentType[] = [];

  getStandard(): void {
    this.appointmentStandardService
      .getAll()
      .subscribe( result => {
        let appointmentTypes: AppointmentType[] =  result.values


        const events: Event[] = [];
        appointmentTypes.forEach((appointmentType) => {
          if (appointmentType.standardPeriod != null) {
            this.appointmentStandard.push(appointmentType);
          }

        });
        console.log("AppointmentStandards!!! ", this.appointmentStandard);
      })
  }

  ngOnInit() {
    this.getStandard();
  }

}
