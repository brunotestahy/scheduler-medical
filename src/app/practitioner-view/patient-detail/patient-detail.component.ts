import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Scheduler } from '../../shared/models/scheduler';
import { Patient } from '../../shared/models/patient';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
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

  // Options to overwrite the default settings on schedule
  schedulerConfig: Scheduler = {
    newEventHeader: {
      active: false
    },
    userType: EnumUserType.practitioner,
    onlineMode: true
  };

  // State variables to control the loading and checkbox elements
  stateObjects = {
    isLoading: true,
    checkbox: {
      refeicao: false,
      disabled: true
    },
    isMessageButtonActive: false
  };

  birthDateFormat: string = 'dd/MM/y';

  patient: Patient;
  messageInput: string;

  // Subscriptions
  disableCheckboxState: Subscription;
  checkCheckboxState: Subscription;
  generalErrorState: Subscription;

  // General Errors
  requestError: boolean = false;

  constructor(private patientService: PatientService,
              private translateService: TranslateService,
              private scheduleService: ScheduleService,
              private router: Router,
              private change: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.fetchSelectedPatient();
    this.loadGeneralListeners();
    this.birthDateFormat = this.translateService.currentLang === 'pt' || 'es' ? this.birthDateFormat : 'MM/dd/y';
    setTimeout(() => {
      this.stateObjects.isLoading = false;
    }, 1000);
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  // Load the information about the selected patient by the practitioner
  fetchSelectedPatient() {
    this.patient = this.patientService.getSelectedPatient();
    this.schedulerConfig.patientData = this.patient;

    // Uncomment this only to see the employee information
    // if (JSON.parse(sessionStorage.getItem('employee')) && JSON.parse(sessionStorage.getItem('employee'))['dto']) {
    //   console.log(JSON.parse(sessionStorage.getItem('employee'))['dto']);
    // }
  }

  loadGeneralListeners() {
    // Listen the disable event on checkbox
    this.disableCheckboxState = this.scheduleService.handleDisableStandardCheckbox$
      .subscribe((state: boolean) => {
        this.stateObjects.checkbox.disabled = state;
        this.change.detectChanges();
      });

    // Capture Standard checkbox state
    this.checkCheckboxState = this.scheduleService.handleCheckStandardCheckbox$
      .subscribe((response: { checkBoxType: string, state: boolean }) => {
        if (response.checkBoxType === EnumEventCategory[EnumEventCategory.refeicao]) {
          this.stateObjects.checkbox.refeicao = response.state;
        }
      });

    // Listen general errors
    this.generalErrorState = this.scheduleService.handleGeneralError$
      .subscribe((isError: boolean) => {
        this.requestError = isError;
      });
  }

  // Remove all the listeners
  unloadGeneralListeners() {
    this.disableCheckboxState.unsubscribe();
    this.checkCheckboxState.unsubscribe();
    this.generalErrorState.unsubscribe();
  }

  // Back navigation
  backToPreviousPage() {
    this.router.navigate(['/practitioner/patient']);
  }

  // Emit the checkbox state changing event
  onStandardTimeChange(standardCategory: string) {
    this.scheduleService.emitDisableStandardCheckbox(true);

    switch (standardCategory) {
      case EnumEventCategory[EnumEventCategory.refeicao]: {
        this.scheduleService.emitAddStandardEvents(standardCategory, this.stateObjects.checkbox.refeicao);
        break;
      }
    }
  }

  // Emit this event to open the modal
  addNewEvent() {
    this.scheduleService.emitAddNewEvent();
  }

  // Emit this event to start the copy from yesterday feature
  copyEventsFromYesterday() {
    this.scheduleService.emitCopyEventsFromYesterday();
  }

  sendMessage() {
    console.log('Enter');
  }
}
