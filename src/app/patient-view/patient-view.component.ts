import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Scheduler } from '../shared/models/scheduler';
import { Patient } from '../shared/models/patient';
import { EnumUserType } from '../shared/enums/user-type.enum';
import { RefreshService } from '../services/refresh.service';
import { Subscription } from 'rxjs/Subscription';
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

  // Options to overwrite the default settings on schedule
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

  // Loading
  isLoading: boolean;

  // Subscriptions
  refreshSubscription: Subscription;
  autoRefreshSubscription: Subscription;

  constructor(private renderer: Renderer2,
              private refreshService: RefreshService) {
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

  // Add the attribute on elements where the font size will suffer modification
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

    // Listen auto refresh
    this.startAutoRefreshListener();
  }

  // Remove all the listeners
  unloadGeneralListeners() {
    this.refreshSubscription.unsubscribe();
    this.autoRefreshSubscription.unsubscribe();
  }

  // Load all the information about the logged patient
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

  // Auto refresh listener
  startAutoRefreshListener() {
    this.autoRefreshSubscription = this.autoRefresher()
      .subscribe(() => {
        this.refreshContent();
      });
  }

  // Restart the refresher
  restartAutoRefresh() {
    // Restart auto refresh
    this.autoRefreshSubscription.unsubscribe();
    this.startAutoRefreshListener();
  }

  // Start the refresh state applying a rotate animation to the icon
  refreshContent() {
    console.log(this.refreshElement);
    this.renderer.addClass(this.refreshElement.nativeElement, 'rotating-refresher');

    this.refreshService.emitRefreshState(true);
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

  // Open the evaluation app only in IOS devices
  onEvaluationClick() {
    this.openIdentificationApp();
  }

  // Open the app only in IOS devices
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
