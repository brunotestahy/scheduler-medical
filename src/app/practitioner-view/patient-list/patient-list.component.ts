import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Patient } from '../../shared/models/patient';
import { fadeAnimationTrigger } from '../../shared/animations/fade-animation';
import { PatientService } from '../../services/patient.service';
import { Subject } from 'rxjs/Subject';
import { EnumEventCategory } from '../../shared/enums/event-categories.enum';
import { AppointmentCategory } from '../../shared/models/appointment-category';
import { AppointmentCategoryService } from '../../services/appointment-category.service';
import { AppointmentType } from '../../shared/models/appointment-type';
import { AppointmentTypeService } from '../../services/appointment-type.service';
import { Permissions } from '../../shared/models/permissions';
import { PermissionsService } from '../../services/permissions.service';
import { RoomService } from '../../services/room.service';
import { environment } from '../../../environments/environment';
import { ConceptmapService } from '../../services/conceptmap.service';
import * as Flickity from 'flickity';
import { LoginService } from 'front-end-common';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
  animations: [
    fadeAnimationTrigger({duration: '200ms'}) // Params => {duration: '100ms'}
  ]
})
export class PatientListComponent implements OnInit {
  permVec;
  requestError: boolean;
  isloaded: boolean;
  isLoadedSearch: boolean;
  isLoadedProcessing: boolean;
  roomSectors: any;
  roomAll: any;
  scheduleTypes;
  scheduleCategories;
  conceptmapResult: Array<any>;
  selectedRoomSectorDisplay: string;
  selectedRoomSectorObject: any;

  hasGeneralError: boolean;
  emptySearch: boolean;

  patients: Array<Patient> = [];
  /*
   fakePatients: any = {'LORRAINE DA ROCHA FERREIRA': 'LORRAINE FERRARA',
   'GABRIEL GIALLUISI DA SILVA SA': 'GABRIEL SILVEIRA',
   'JUDILETE FERREIRA FERNANDES FILHA': 'JUDITH FERREIRA',
   'VERA LUCIA BASTOS AZEVEDO': 'VERA LUCIA ACORES',
   'JORGE ALEXANDRE RODRIGUES': 'JORGE ROCHSTEIN',
   'HELENA GOLDENZOL BEKHOR': 'HELENA GOLDSTEIN',
   'FREDERICO GARCIA DINIZ': 'FREDERICO GARCA',
   'PACIENTE TESTE SOULMV': 'JOSE DO PATROCINIO',
   'ESTHER SERRUYA AZULAY': 'ESTHER AZZURRE',
   'DOUGLAS VIEGA CARDOSO': 'DOUGLAS VEGAS',
   'MARCIA THEREZA ABUD GIANNINI': 'MARCIA TEREZINHA DA SILVA',
   'ALFREDO VICENTE DO VALLE FRAGELLI': 'ALFREDO FRAGOSO',
   'YURI LEITE SAN TIAN SUN': 'YUKA SHIMIZORI',
   'LUCIA MARIA CAMARA': 'LUCY MARIA FERREIRA',
   'LUCIANO POZZI': 'LUCIANO PESSINI',
   'ANA CLAUDIA JUCA CARSALADE': 'ANA CLAUDIA CASALES',
   'ANGELA MARIA PEREIRA MOREIRA': 'ANGELA MARIA PEDROSA',
   'MARIA HELENA DE BRITO RODRIGUES': 'MARIA HELENA RODRIGUEZ',
   'MOEMA DE OLIVEIRA DELORENZI': 'MOEMA OLIVER',
   'AIDA CECILIANO JORDAO': 'AIDA JORGE',
   'HERCILIO DE ALMEIDA COUTINHO': 'HERCILIO COUTO',
   'LUIZ ODILON GOMES BANDEIRA': 'LUIS GOMEZ BANDIERA',
   'INAYA SALGUEIRO MARIA TEIXEIRA': 'INAIA SIMONE'
   };
   */


  birthDateFormat: string = 'dd/MM/y';

  isLoading: boolean = true;
  isAsyncError: boolean = false;

  patientSearchSubject: Subject<any> = new Subject();
  searchDebounceTime: number = 1000;

  // Search header element
  @ViewChild('searchHeader') searchHeaderElement: ElementRef;

  // Select boxes
  orderBySelectValue: string = JSON.parse(sessionStorage.getItem('order-select')) || 'room';
  searchHeaderValue: string = JSON.parse(sessionStorage.getItem('filter-input')) || '';
  filterBySelectValue: string = JSON.parse(sessionStorage.getItem('filter-select')) || undefined;

  appointmentsCategory: AppointmentCategory[] = [];

  // Dialog options
  modalConfig = {
    active: false,
    // Category event style
    categoryEventStyle: {
      activeCategoryClass: 'category-active-',
      selectedCategory: EnumEventCategory[EnumEventCategory.refeicao]
    }
  };

  // Input variables
  inputModels = {
    title: '',
    description: '',
    videoLink: '',
    category: null
  };

  // Permision to create appointment type
  canCreateAppointmentType: boolean = false;

  // Carousel variable
  flkty: Flickity;

  constructor(private translateService: TranslateService,
              private router: Router,
              private patientService: PatientService,
              private roomService: RoomService,
              private conceptmap: ConceptmapService,
              private appointmentCategoryService: AppointmentCategoryService,
              private appointmentTypeService: AppointmentTypeService,
              private permissions: PermissionsService,
              private renderer: Renderer2,
              private loginService: LoginService) {
  }

  ngOnInit() {
    this.setPermissionToCreate();
    this.fetchInitialData();

    // Catch the saved input value during a previous search
    this.searchHeaderElement['inputElement']['nativeElement']['value'] = this.searchHeaderValue;

  }

  // Set permission to create a new appointment type
  setPermissionToCreate() {
    this.canCreateAppointmentType = this.loginService.hasPermission('SCHEDULE', 'WRITE');
  }

  fetchInitialData() {
    const perms: Permissions[] = [
      {
        type: 'READ',
        name: 'CAREPLAN_ACTIVITY_TYPE'
      },
      {
        type: 'WRITE',
        name: 'CAREPLAN_ACTIVITY_TYPE'
      }
    ];

    this.permVec = this.permissions.hasPermissions(perms);

    this.requestError = false;
    this.isloaded = false;
    this.isLoadedSearch = true;

    // Patient searcher using Observable
    this.patientSearchSubject
      .debounceTime(this.searchDebounceTime)
      .switchMap(() => {
        return this.getAllPatientCards();
      })
      .subscribe(
        allPatients => {
          /*Traduz para nomes fake
           allPatients.forEach(patient => {
           if (this.fakePatients[patient.fullName] !== undefined) {
           patient.fullName = this.fakePatients[patient.fullName];
           } else {
           // patient.fullName = 'Indefinido';
           }
           }) ;
           */

          this.patients = allPatients.filter((patient: Patient) => {
            return patient.fullName.toUpperCase().includes(this.searchHeaderValue.toUpperCase()) ||
              patient.room.toUpperCase().includes(this.searchHeaderValue.toUpperCase());
          });
          this.afterSearchProcessing();
          this.calculatePatientAge();
          this.isLoading = false;
        },
        error => {
          console.error('Error trying to fetch the patients => ', error);
          this.generalErrorHandle();
        });

    // All other services called together
    Observable.zip(
      this.roomService.getSectors(),
      this.roomService.get(),
      this.conceptmap.get(environment.mappings.roomToSectorMap),
      this.appointmentCategoryService.getCategories(),
      this.appointmentTypeService.getTypes()
    )
      .subscribe(([
                    sectorsResponse,
                    roomsResponse,
                    conceptResponse,
                    categoriesResponse,
                    typeResponse
                  ]) => {
          this.scheduleTypes = typeResponse.values;
          this.scheduleCategories = categoriesResponse.values;
          this.appointmentsCategory = categoriesResponse.values;
          sessionStorage.setItem('scheduleTypes', JSON.stringify(this.scheduleTypes));
          sessionStorage.setItem('scheduleCategories', JSON.stringify(this.scheduleCategories));

          this.roomSectors = sectorsResponse.values;
          // remove all sectors that are not in care plan
          this.roomSectors = this.roomSectors.filter(val => {
              return val.display.indexOf('Ala') > -1;
            }
          );
          this.roomSectors.splice(this.roomSectors.length - 1, 1);
          this.roomAll = roomsResponse.values;
          this.conceptmapResult = conceptResponse.map;

          this.selectedRoomSectorDisplay = this.roomSectors[0].display;
          this.selectedRoomSectorObject = this.roomSectors[0];
          this.isloaded = true;

          // Call the Patient searcher immediately, but only in the first time
          this.patientSearchSubject.next();
        },
        error => {
          console.error('Error during other services call => ', error);
          this.generalErrorHandle();
        });
  }

  // Bring all the patients
  getAllPatientCards() {
    return this.patientService.searchPatients(null, null, null, null, true);
  }

  // Open the modal dialog and pass the instructions
  openDialog() {
    setTimeout(() => {
      this.carouselLoader();
    });

    this.clearEventForm();

    // Add class to avoid body scroll when the modal is opened
    this.renderer.addClass(document.body, 'modal-open');
  }

  // Close the modal dialog
  closeDialog() {
    this.modalConfig.active = false;

    // Remove class to avoid body scroll when the modal is opened
    this.renderer.removeClass(document.body, 'modal-open');

    // Destroy carousel element
    this.flkty.destroy();
  }

  // Load the carousel
  carouselLoader() {
    const elem = document.querySelector('.main-carousel');
    this.flkty = new Flickity(elem, {
      // options
      cellAlign: 'center',
      contain: true,
      pageDots: false
    });

    // Catch navigation button events
    this.flkty.on('select', () => {
      let categoryCode: string = '';
      this.appointmentsCategory.forEach((category, index) => {
        if (index === this.flkty.selectedIndex) {
          categoryCode = category.code;
        }
      });

      this.modalConfig.categoryEventStyle.selectedCategory = categoryCode;
    });

    // Find index to select the slide on carousel
    const newIndex: number = this.appointmentsCategory
      .findIndex(category => category.code === this.modalConfig.categoryEventStyle.selectedCategory);

    this.goToSlide(newIndex, this.modalConfig.categoryEventStyle.selectedCategory);

    const wrapperElement = document.querySelector('.flickity-viewport');

    this.renderer.setStyle(wrapperElement, 'padding-top', '20px');
  }

  // Navigate to the correct slide
  goToSlide(index: number, category: AppointmentCategory) {
    this.modalConfig.categoryEventStyle.selectedCategory = category.code;
    this.flkty.select(index);
  }

  // Clear all the modal dialog form inputs
  clearEventForm() {
    this.inputModels.title = '';
    this.inputModels.description = '';
    this.inputModels.videoLink = '';
    this.modalConfig.active = true;
  }

  // Reload the patient cards when an error occurred
  retryAsyncOpertion() {
    this.isAsyncError = false;
    this.isLoading = true;
    this.getAllPatientCards();
  }

  // Format the patient's age to display on the view
  calculatePatientAge() {
    this.patients.forEach(patient => {
      if (patient.birthDate.dateTime) {
        const timeDiff = Math.abs(
          Date.now() - Date.parse(patient.birthDate.dateTime)
        );
        // Used Math.floor instead of Math.ceil
        // so 26 years and 140 days would be considered as 26, not 27.
        patient.birthDate.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
        this.birthDateFormat =
          this.translateService.currentLang === 'pt' || 'es'
            ? this.birthDateFormat
            : 'MM/dd/y';
      }
    });
  }

  // Navigate to the patient detail page
  showPatientDetail(patient: Patient) {
    // Save the input value on search header
    sessionStorage.setItem('filter-input', JSON.stringify(this.searchHeaderElement['inputElement']['nativeElement']['value']));

    this.patientService.setSelectedPatient(patient);
    this.router.navigate(['/practitioner/patient', patient.id]);
  }

  // Emit a new search passing the new parameters
  updateSuggestions() {
    this.isLoading = true;
    this.requestError = false;
    this.isloaded = false;
    this.isLoadedSearch = true;
    this.emptySearch = false;
    this.searchHeaderValue = this.searchHeaderElement['inputElement']['nativeElement']['value'];
    this.patientSearchSubject.next();
  }

  // Submit the standard appointment type form
  createStandardAppointmentType() {
    this.inputModels.category = this.modalConfig.categoryEventStyle.selectedCategory;

    const newAppointmentType = this.buildStandardAppointmentTypeObject();

    console.log(newAppointmentType);
    this.appointmentTypeService.create(newAppointmentType).subscribe(
      response => {
        console.log(response);
        this.closeDialog();
      },
      error => {
        console.error('Error trying to create a new standard appointment type => ', error);
      }
    );
  }

  // Create an appointment type object
  buildStandardAppointmentTypeObject(): AppointmentType {
    return {
      display: this.inputModels.title,
      unusable: false,
      definition: this.inputModels.description,
      videoLink: this.inputModels.videoLink,
      category: {
        system: 'rdsl:model:set:appointment:category',
        code: this.inputModels.category
      },
      standardPeriod: null
    };
  }

  // Process all the information about rooms, sectors and update every patient, but only once
  afterSearchProcessing() {
    this.hasGeneralError = false;
    this.isLoadedProcessing = false;
    this.emptySearch = false;

    if (this.patients.length === 0) {
      this.emptySearch = true;
      this.isLoadedSearch = true;
      this.isLoadedProcessing = true;
    }

    // apenas faz o trabalho se houver resposta
    if (!this.emptySearch) {
      // transforma o timestamp de cada paciente em uma data legivel
      for (let i = 0; i < this.patients.length; i++) {
        this.patients[i].birthDate.age = this.getAge(this.patients[i].birthDate.dateTime);
        // faz o campo de busca, juntando quarto e nome
        this.patients[i].searchfield = this.patients[i].fullName + ' ' + this.patients[i].room;
      }

      // adiciona o roomId e RoomDisplay ao paciente
      for (let i = 0; i < this.roomAll.length; i++) {
        for (let j = 0; j < this.patients.length; j++) {
          if (this.roomAll[i].display.toUpperCase() === this.patients[j].room.toUpperCase()) {
            this.patients[j].roomId = this.roomAll[i].code;
            this.patients[j].sectorId = this.conceptmapResult[this.patients[j].roomId];
            for (let k = 0; k < this.roomSectors.length; k++) {
              if (this.roomSectors[k].code === this.patients[j].sectorId) {
                this.patients[j].sectorDisplay = this.roomSectors[k].display;
              }
            }
            break;
          }
        }
      }
      // Relaciona o ID da Ala - Com o display
      for (let j = 0; j < this.patients.length; j++) {
        for (let k = 0; k < this.roomSectors.length; k++) {
          if (this.patients[j].room === this.roomSectors[k].code) {
            this.patients[j].sectorDisplay = this.roomSectors[k].display;
            break;
          }
        }
      }
    }
  }

  // General error handling during http calls
  generalErrorHandle() {
    // this.patients = this.fakeData.dtoList;
    this.calculatePatientAge();
    this.isLoading = false;
    // this.isAsyncError = true;
    this.hasGeneralError = true;
  }

  // Return the patient's age from his date of birth
  getAge(birthday: string): number {
    const today = new Date();
    const birthdayDate: Date = new Date(birthday);
    let thisYear = 0;
    if (today.getMonth() < birthdayDate.getMonth()) {
      thisYear = 1;
    } else if (
      today.getMonth() === birthdayDate.getMonth() &&
      today.getDate() < birthdayDate.getDate()
    ) {
      thisYear = 1;
    }
    return today.getFullYear() - birthdayDate.getFullYear() - thisYear;
  }

  // Save the filter options on session storage
  saveFilterOptions() {
    if (this.orderBySelectValue) {
      sessionStorage.setItem('order-select', JSON.stringify(this.orderBySelectValue));
    }

    if (this.filterBySelectValue) {
      sessionStorage.setItem('filter-select', JSON.stringify(this.filterBySelectValue));
    } else {
      sessionStorage.setItem('filter-select', null);
    }
  }
}
