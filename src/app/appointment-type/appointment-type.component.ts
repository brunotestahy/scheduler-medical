import { Component, OnInit } from '@angular/core';
import { AppointmentTypeService } from  '../services/appointment-type.service';
import { AppointmentType } from '../shared/models/appointment-type'
import {BaseRequestOptions} from '@angular/http';

@Component({
  selector: 'app-appointment-type',
  templateUrl: './appointment-type.component.html',
  styleUrls: ['./appointment-type.component.css']
})
export class AppointmentTypeComponent implements OnInit {

  constructor(
    private appointmentTypeService: AppointmentTypeService
  )
   {

   }

   appointmentTypes: AppointmentType[];
   countItems: number;

   getAll(): void {
    this.appointmentTypeService
      .getTypes()
      .subscribe(appointmentTypes => {
        this.countItems = appointmentTypes.length;
        this.appointmentTypes = appointmentTypes.values;
      });
  }

  createAppointmentType(appointmentType: AppointmentType){
     console.log("CREATE APPOINTMENT TYPE", appointmentType);
     this.appointmentTypeService
       .create(appointmentType)
       .subscribe(response => {
         console.log("Mensagem do create AppointmentType:", response);
       })
  }

  deleteAppointmentTypes(appointmentTypes: string[]) {
    let requestOptions = new BaseRequestOptions();
    requestOptions.body = appointmentTypes;
    this.appointmentTypeService
      .delete(requestOptions)
      .subscribe(response => {
        console.log("AppointmentType delete:", response);
      })
  }

  ngOnInit() {
    this.getAll();

    let appointmentType: any;

    appointmentType = {
      'display': 'Limpeza da Cavidade Cerebral',
      'unusable': false,
      'definition': 'Requer assistência de um profissional.',
      'system': 'rdsl:model:set:appointment:type',
      'allDayLong': false,
      'videoLink': 'https://www.youtube.com/embed/zpOULjyy-n8?rel=0',
      'category': {
        'system': 'rdsl:model:set:appointment:category',
        'code': 'rotinahospitalar'
      },
      'standardPeriod': {
        'startDate': {
          'dateTime': null  //'2017-11-03T15:40:00-03:00',
        },
        'endDate': {
          'dateTime': null //'2017-11-04T16:40:00.000-03:00'
        }
      }
    };

   // this.createAppointmentType(appointmentType);

  }

}
