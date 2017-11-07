import { Component, OnInit } from '@angular/core';
import { Scheduler } from '../shared/models/scheduler';
import { PatientService } from '../services/patient.service';
import { Event } from '../shared/models/event';
import { AppointmentService } from '../services/appointment.service';
import { Patient } from '../shared/models/patient';
import { Appointment } from '../shared/models/appointment';
import { EnumUserType } from '../shared/enums/user-type.enum';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css']
})
export class PatientViewComponent implements OnInit {

  schedulerConfig: Scheduler = {
    practitioner: {
      thumbnail: {
        height: '10%',
        width: '10%',
        border: '5px solid #F2D6D3',
        photo: 'https://www.portalaz.com.br/images/316328/2017%2F06%2F06%2F4ad031ac-f0ce-433a-805f-bcf3140ee1d8%2Ffile'
      }
    },
    newEventHeader: {
      active: true,
      patientName: 'Marcelo'
    },
    userType: EnumUserType.patient // Patient type
  };

  isLoading: boolean;

  constructor(private patientService: PatientService,
              private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.loadEventsFromPatient();
    this.loadPatient();
  }

  loadEventsFromPatient() {
    const currentDate = new Date();

    const year = currentDate.getFullYear().toString();

    const month = (currentDate.getUTCMonth() + 1) < 10 ?
      '0' + (currentDate.getUTCMonth() + 1) :
      (currentDate.getUTCMonth() + 1).toString();

    const day = currentDate.getDate() < 10 ?
      '0' + currentDate.getDate() :
      currentDate.getDate().toString();

    console.log(`${year}-${month}-${day}`);

    this.schedulerConfig.initialEvents = [
      {
        title: 'Meeting Event',
        start: `${year}-${month}-${day}T06:00:00`,
        end: `${year}-${month}-${day}T08:00:00`,
        category: 4,
        description: 'O paracetamol é geralmente utilizado para o tratamento de gripes' +
        ' e de resfriados, sendo que as doses recomendadas são consideadas bastante seguras.',
        videoLink: 'https://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      },
      {
        title: 'Another Event',
        start: `${year}-${month}-${day}T06:00:00`,
        end: `${year}-${month}-${day}T07:00:00`,
        editable: false,
        category: 3
      },
      {
        title: 'Evento o dia todo',
        start: `${year}-${month}-${day}T06:00:00`,
        allDay: true,
        category: 1
      }
    ];
  }

  loadPatient() {
    const patientData = JSON.parse(sessionStorage.getItem('patient'));
    this.schedulerConfig.userData = patientData;
    this.schedulerConfig.onlineMode = true;
    console.log(patientData);
    this.appointmentService.getPatientAppointments('24281')
      .subscribe((response) => {
          const events = response['dtoList'];
          console.log(events);
        },
        (error) => {
          console.error('Error trying to get patient appointments => ', error);
        });
  }
}
