import { Component, OnDestroy, OnInit } from '@angular/core';
import { Scheduler } from '../../shared/models/scheduler';
import { Patient } from '../../shared/models/patient';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { Event } from '../../shared/models/event';
import { ScheduleService } from '../../services/schedule.service';
import { TranslateService } from '@ngx-translate/core';
import { EnumEventCategory } from '../../shared/enums/event-categories.enum';
import { EnumUserType } from '../../shared/enums/user-type.enum';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit, OnDestroy {

  schedulerConfig: Scheduler = {
    newEventHeader: {
      active: false
    },
    userType: EnumUserType.practitioner,
    onlineMode: true
  };

  stateObjects = {
    isLoading: true,
    checkbox: {
      refeicao: false,
      rotinaHospitalar: false,
      disabled: false
    },
    isMessageButtonActive: false
  };

  birthDateFormat: string = 'dd/MM/y';

  patient: Patient;
  currentDate: Date = new Date();
  messageInput: string;

  // Subscriptions
  disableCheckboxState: Subscription;
  checkCheckboxState: Subscription;

  constructor(private patientService: PatientService,
              private translateService: TranslateService,
              private scheduleService: ScheduleService,
              private router: Router) {
  }

  ngOnInit() {
    this.fetchSelectedPatient();
    this.loadEventsFromPatient();
    this.loadGeneralListeners();
    this.birthDateFormat = this.translateService.currentLang === 'pt' || 'es' ? this.birthDateFormat : 'MM/dd/y';
    setTimeout(() => {
      this.stateObjects.isLoading = false;
    }, 1000);
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  fetchSelectedPatient() {
    this.patient = this.patientService.getSelectedPatient();
  }

  loadGeneralListeners() {
    // Listen the disable event on checkbox
    this.disableCheckboxState = this.scheduleService.handleDisableStandardCheckbox$
      .subscribe((state: boolean) => {
        this.stateObjects.checkbox.disabled = state;
      });

    // Capture Standard checkbox state
    this.checkCheckboxState = this.scheduleService.handleCheckStandardCheckbox$
      .subscribe((response: { checkBoxType: string, state: boolean }) => {
        if (response.checkBoxType === EnumEventCategory[EnumEventCategory.refeicao]) {
          this.stateObjects.checkbox.refeicao = response.state;
        }
        if (response.checkBoxType === EnumEventCategory[EnumEventCategory.rotinahospitalar]) {
          this.stateObjects.checkbox.rotinaHospitalar = response.state;
        }
      });
  }

  unloadGeneralListeners() {
    this.disableCheckboxState.unsubscribe();
    this.checkCheckboxState.unsubscribe();
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

    const eventData: Array<Event> = [
      {
        title: 'Meeting Event',
        start: `${year}-${month}-${day}T06:00:00`,
        end: `${year}-${month}-${day}T08:00:00`,
        category: 4,
        owner: 'Patient/24281',
        description: 'O paracetamol é geralmente utilizado para o tratamento de gripes' +
        ' e de resfriados, sendo que as doses recomendadas são consideadas bastante seguras.',
        videoLink: 'https://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      },
      {
        title: 'Another Event',
        start: `${year}-${month}-${day}T06:00:00`,
        end: `${year}-${month}-${day}T07:00:00`,
        editable: false,
        category: 3,
        owner: 'Patient/24281'
      },
      {
        title: 'Evento o dia todo',
        start: `${year}-${month}-${day}T06:00:00`,
        allDay: true,
        category: 1,
        owner: 'Patient/24281'
      }
    ];

    this.schedulerConfig.initialEvents = eventData;
  }

  backToPreviousPage() {
    this.router.navigate(['/scheduler-practitioner/patient']);
  }

  onStandardTimeChange(standardCategory: string) {
    switch (standardCategory) {
      case EnumEventCategory[EnumEventCategory.refeicao]: {
        this.stateObjects.checkbox.refeicao = !this.stateObjects.checkbox.refeicao;
        this.scheduleService.emitAddStandardEvents(standardCategory, this.stateObjects.checkbox.refeicao);
        break;
      }
      case EnumEventCategory[EnumEventCategory.rotinahospitalar]: {
        this.stateObjects.checkbox.rotinaHospitalar = !this.stateObjects.checkbox.rotinaHospitalar;
        this.scheduleService.emitAddStandardEvents(standardCategory, this.stateObjects.checkbox.rotinaHospitalar);
        break;
      }
    }
    this.stateObjects.checkbox.disabled = true;
  }

  addNewEvent() {
    this.scheduleService.emitAddNewEvent();
  }

  copyEventsFromYesterday() {
    this.scheduleService.emitCopyEventsFromYesterday();
  }

  sendMessage() {
    console.log('Enter');
  }
}
