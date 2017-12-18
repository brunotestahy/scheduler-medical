import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Scheduler } from '../shared/models/scheduler';
import { Patient } from '../shared/models/patient';
import { EnumUserType } from '../shared/enums/user-type.enum';
import { RefreshService } from '../services/refresh.service';
import { Subscription } from 'rxjs/Subscription';
import { IdentificationPatientService } from '../services/identification-patient.service';
import { Observable } from 'rxjs/Observable';

declare const startApp: any;

const CARE_PLAN_APP_PATH: string = 'careplan://';
const IDENTIFICATION_APP_PATH: string = 'smartidentification://';
const SMART_APP_PATH: string = 'smarthosp://';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient-view.component.html',
  styleUrls: ['./patient-view.component.css']
})
export class PatientViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('refresher') refreshElement: ElementRef;

  patientId: string;
  patient: Patient;
  schedulerConfig: Scheduler = {
    practitioner: {
      thumbnail: {
        height: 'auto',
        width: '10rem',
        border: '5px solid #F2D6D3',
        photo: './assets/img/medico.png'
      }
    },
    newEventHeader: {
      active: true,
      patientName: ''
    },
    userType: EnumUserType.patient // Patient type
  };

  isLoading: boolean;

  // Subscriptions
  refreshSubscription: Subscription;
  autoRefreshSubscription: Subscription;

  // Practitioners linked to this patient
  practitioners: any;

  constructor(private renderer: Renderer2,
              private refreshService: RefreshService,
              private idtPatSrevice: IdentificationPatientService) {
  }

  ngOnInit() {
    this.loadPatient();
    this.loadGeneralListeners();

  }

  ngAfterViewInit() {
    this.addFontResizerAttribute();
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  addFontResizerAttribute() {
    // Add on greeting component on header
    const greetingElement = document.querySelector('.greeting-message');

    this.renderer.setAttribute(greetingElement,  'font-resizer', '');
    console.log(window.getComputedStyle(greetingElement, null).getPropertyValue('font-size'));
  }

  loadGeneralListeners() {
    this.refreshSubscription = this.refreshService.handleRefreshState$
      .subscribe((shouldRefresh: boolean) => {
        if (shouldRefresh) {
          this.renderer.addClass(this.refreshElement.nativeElement, 'refresher-disabled');
        } else {
          this.renderer.removeClass(this.refreshElement.nativeElement, 'rotating-refresher');
          this.renderer.removeClass(this.refreshElement.nativeElement, 'refresher-disabled');
        }
      });

    // Start auto refresh
    this.startAutoRefresh();
  }

  unloadGeneralListeners() {
    this.refreshSubscription.unsubscribe();
    this.autoRefreshSubscription.unsubscribe();
  }

  loadPatient() {
    const patientData: Patient = JSON.parse(sessionStorage.getItem('patient'))['dto'] || {
      id: '24281',
      name: 'Bruno'
    };
    this.patient = patientData;
    this.patientId = JSON.parse(sessionStorage.getItem('patient'))['dto'];
    this.patientId = this.patientId['id'];
    this.schedulerConfig.patientData = patientData;
    this.schedulerConfig.newEventHeader.patientName = patientData.name.split(' ')[0].charAt(0).toUpperCase() +
      patientData.name.split(' ')[0].slice(1).toLowerCase();
    this.schedulerConfig.onlineMode = true;
  }

  startAutoRefresh() {
    this.autoRefreshSubscription = this.autoRefresher()
      .subscribe(() => {
        this.refreshContent();
      });
  }

  restartAutoRefresh() {
    // Restart auto refresh
    this.autoRefreshSubscription.unsubscribe();
    this.startAutoRefresh();
  }

  refreshContent() {
    console.log(this.refreshElement);
    this.renderer.addClass(this.refreshElement.nativeElement, 'rotating-refresher');

    this.refreshService.emitRefreshState(true);
  }

  getCareProviders() {
    this.idtPatSrevice.getCareProviders(this.patientId)
      .subscribe(careProviders => {
          console.log(careProviders);
          this.practitioners = careProviders;
        },
        (error) => {
          console.error('Error trying to get the doctors for this patient => ', error);
        });
  }

  // Auto refresher each 30 minutes
  autoRefresher(): Observable<any> {
    const minutes = 30;
    const intervalTime = 1000 * 60 * minutes;
    return Observable.interval(intervalTime);
  }

  log(val: any) {
    console.log(val);
  }

  onEvaluationClick() {
    this.openIdentificationApp();
  }

  openApp(appPath: string) {
    startApp.set(appPath).start(
      function(){},
      function(error) {
        console.error(error);
      }
    );
  }

  openSmartApp() {
    return this.openApp(SMART_APP_PATH);
  }

  openCarePlanApp() {
    return this.openApp(CARE_PLAN_APP_PATH);
  }

  openIdentificationApp() {
    return this.openApp(IDENTIFICATION_APP_PATH);
  }
}
