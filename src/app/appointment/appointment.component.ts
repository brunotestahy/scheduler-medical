import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../shared/models/appointment';
import { Period } from '../shared/models/period';
import { CustomHttp } from './../custom-http';
import { BaseRequestOptions, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {

  constructor(private appointmentService: AppointmentService) {
  }

  allAppointments: Appointment[];
  patientAppointments: Appointment[];
  countItems: number;
  countPatientItems: number;
  patientId: string = '446124';

  createAppointments(appointments: Appointment[]) {
    this.appointmentService
      .createCollection(appointments)
      .subscribe(response => {
        console.log('Mensagem do create: ', response);
      });
  }

  deleteAppointments(appointments: string[]) {
    let requestOptions = new BaseRequestOptions();
    requestOptions.body = appointments;
    this.appointmentService
      .delete(requestOptions)
      .subscribe(response => {
        console.log('Mensagem do delete: ', response);
      });
  }

  getAllAppointments(): void {
    this.appointmentService
      .getAll()
      .subscribe(allAppointments => {
        this.countItems = allAppointments.length;
        this.allAppointments = allAppointments.dtoList;
        console.log(this.allAppointments);
      });
  }

  updateAppointments(appointments: Appointment[]): void {
    this.appointmentService
      .update(appointments)
      .subscribe(response => {
      });
  }

  getPatientAppointments(idPatient: string): void {
    this.appointmentService
      .getPatientAppointments(idPatient)
      .subscribe(patientAppopintments => {
        this.countPatientItems = patientAppopintments.length;
        this.patientAppointments = patientAppopintments.dtoList;
      });
  }

  getPatientAppointmentsByDate(idPatient: string, date: string): void {
    this.appointmentService
      .getPatientAppointmentsByDate(idPatient, date)
      .subscribe(patientAppopintments => {
        this.countPatientItems = patientAppopintments.length;
        this.patientAppointments = patientAppopintments.dtoList;
      });
  }


  ngOnInit() {
    let period: Period = {
      startDate: {
        dateTime: '2007-12-03T12:00:00+0200',
      },
      endDate: {
        dateTime: '2007-12-04T12:10:00+0200'
      }
    };


    let appointment: Appointment[] = [{
      status: 'proposed',
      description: 'Tomar 1 comprimido de Losartana 25mg',
      comment: 'Via oral com dois copos d´água',
      type: 'medicamento',
      patientId: this.patientId,
      period: period
    }];

    let appointmentCollection: Appointment[] = [
      {
        status: 'proposed',
        description: 'Tomar 50 GOTAS de Advil 200mg',
        comment: 'Via oral',
        type: 'cafedamanha',
        patientId: this.patientId,
        period: period
      },
      {
        status: 'proposed',
        description: 'Tomar 30 GOTAS de Advil 400mg',
        comment: 'Via oral ',
        type: 'tomarcomprimido',
        patientId: this.patientId,
        period: period
      }
    ];

    let appointmentUpdate: Appointment[] = [{
      id: '447983',
      status: 'proposed',
      description: 'Tomar 1 comprimido de Cimetidina 400mg',
      comment: 'Via oral com 1 copo de água',
      type: 'medicamento',
      patientId: this.patientId,
      period: period
    },
      {
        id: '447979',
        status: 'proposed',
        description: 'Tomar 1 comprimido de Cimetidina 800mg',
        comment: 'Via oral com 1 copo de água',
        type: 'medicamento',
        patientId: this.patientId,
        period: period
      }];

    //this.createAppointments(appointment);
    //this.createAppointments(appointmentCollection);
    // let appointmentIds: string[] = ["447984"];
    // this.deleteAppointments(appointmentIds);
    //this.updateAppointments(appointmentUpdate);
    //this.getAllAppointments();
    //this.getPatientAppointments(this.patientId);
    this.getPatientAppointmentsByDate(this.patientId, '2017-09-07');
  }

}
