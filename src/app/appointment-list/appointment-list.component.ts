import { Component, OnInit } from '@angular/core';
import {AppointmentListService} from '../services/appointment-list.service';
import {AppointmentList} from '../shared/models/appointment-list';

@Component({
  selector: 'appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {

  constructor(private appointmentListService: AppointmentListService ) {  }

  patientAppointmentList: AppointmentList;
  appointmentList: AppointmentList;

  getAppointmentList(idAppointmentList: string): void {
    this.appointmentListService
      .getAppointmentList(idAppointmentList)
      .subscribe(appointmentList => {
        this.appointmentList = appointmentList;
        console.log('APPOINTMENT LIST', this.appointmentList);
      });
  }

  getAppointmentListByPatient(idPatient: string): void {
    this.appointmentListService
      .getAppointmentListByPatient(idPatient)
      .subscribe( appointmentList => {
        this.patientAppointmentList = appointmentList;
        console.log('PATIENTAPPOINTMENT LIST', this.patientAppointmentList);
    });
  }

  createAppointmentList(appointmentList: AppointmentList) {
    this.appointmentListService
      .create(appointmentList)
      .subscribe( response => {
          console.log('Criação de Appointment List: ', response);
        });
  }

  updateAppointmentList(idAppointmentList: string, appointmentList: AppointmentList){
    this.appointmentListService
      .update(idAppointmentList, appointmentList)
      .subscribe( response => {
        console.log('Update de AppointmentList', response);
      });
  }

  ngOnInit() {
    let appointmentCreateListExample: AppointmentList = {
      'title': 'Appointment List com internação de Adilson Xavier',
      'patientId': '22465',
      'status': 'current',
      'date': {
        'dateTime': '2017-10-19T21:30:00-03:00',
      },
      'orderedBy': 'entry-date',
      'mode': 'working',
      'hisAdtId': '999',
      'entries': [
        'Appointment/292362',
        'Appointment/292363',
        'Appointment/292364'
      ],
      'note': 'Lista de appointments de Adilson Xavier com suas categorias de appointments padrão.',
      'followingCategoryDefault': [
        'refeicao'
      ]
    };


    let appointmentUpdateListExample = {
      'id': '292366',
      'title': 'Appointment List com internação de Adilson Xavier - editada',
      'patientId': '22465',
      'status': 'current',
      'date': {
        'dateTime': '2017-10-19T21:30:00-03:00',
      },
      'orderedBy': 'entry-date',
      'mode': 'working',
      'hisAdtId': '999',
      'entries': [
        'Appointment/292364'
      ],
      'note': 'Lista de appointments de Adilson Xavier editada com suas categorias de appointments padrão.',
      'followingCategoryDefault': [
        'rotinahospitalar'
      ]
    };

    // Exemplos de get AppointmentList por id da lista, por id do paciente, create e update.
    // this.getAppointmentList(this.appointmentListId);
    // this.getAppointmentListByPatient(this.patientId);
    // this.createAppointmentList(appointmentCreateListExample);
    // this.updateAppointmentList('292366', appointmentUpdateListExample);
  }

}
