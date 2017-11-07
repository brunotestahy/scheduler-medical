import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Patient } from '../../shared/models/patient';
import { fadeAnimationTrigger } from '../../shared/animations/fade-animation';
import { PatientService } from '../../services/patient.service';
import { Subject } from 'rxjs/Subject';
import { ScheduleService } from '../../services/schedule.service';
import { EnumEventCategory } from '../../shared/enums/event-categories.enum';
import { AppointmentCategory } from '../../shared/models/appointment-category';
import { AppointmentCategoryService } from '../../services/appointment-category.service';
import { AppointmentType } from '../../shared/models/appointment-type';
import { AppointmentTypeService } from '../../services/appointment-type.service';
import { Permissions } from './../../shared/models/permissions';
import { PermissionsService } from '../../services/permissions.service';
import { RoomService } from '../../services/room.service';
import { environment } from '../../../environments/environment';
import { ConceptmapService } from '../../services/conceptmap.service';

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
  roommapResult: Array<any>;
  selectedRoomSectorDisplay: string;
  selectedRoomSectorObject: any;

  generalError: string;
  hasGeneralError: boolean;
  emptySearch: boolean;








  patients: Array<Patient> = [];
  @Input() searchHeaderValue: string = '';
  birthDateFormat: string = 'dd/MM/y';

  patientDropdown = {
    selected: 'practitionerView.searchHeader.patientsDropdown.all',
    all: 'practitionerView.searchHeader.patientsDropdown.all',
    sectorA: 'practitionerView.searchHeader.patientsDropdown.sectorA',
    sectorB: 'practitionerView.searchHeader.patientsDropdown.sectorB',
    sectorC: 'practitionerView.searchHeader.patientsDropdown.sectorC',
    open: false
  };

  isLoading: boolean = true;
  isAsyncError: boolean = false;

  patientSearchSubject: Subject<any> = new Subject();
  searchDebounceTime: number = 1000;

  orderBySelectValue: string;

  appointmentsCategory: AppointmentCategory[] = [];

  // Dialog options
  modalConfig = {
    active: false,
    type: '', // add-edit or description-detail
    action: '', // add or edit
    // Category event style
    categoryEventStyle: {
      activeCategoryClass: 'category-active-',
      selectedCategory: EnumEventCategory[EnumEventCategory.rotinahospitalar]
    }
  };

  inputModels = {
    title: '',
    description: '',
    videoLink: '',
    date: '',
    category: null,
    time: {
      start: '',
      end: ''
    },
    allDay: false,
    standard: false
  };

  fakeData = {
    'dtoList': [
      {
        'id': '23030',
        'name': 'ADRIANA GOMES',
        'fullName': 'ADRIANA DA SILVA GOMES',
        'givenName': [
          'ADRIANA'
        ],
        'familyName': [
          'GOMES'
        ],
        'nameSuffix': [],
        'birthDate': {
          'dateTime': '1988-02-21T00:00:00-0300'
        },
        'email': '<Não informado>',
        'mobilePhone': '+55(21) 24733487',
        'photo': null,
        'login': '<Não informado>',
        'room': '402',
        'hisAdtId': null,
        'careProviderIds': null,
        'careProviders': null,
        'cpf': '12420919718'
      },
      {
        'id': '23055',
        'name': 'ADRIANA DIOGO MOREIRA',
        'fullName': 'ADRIANA DIOGO DE IPANEMA MOREIRA',
        'givenName': [
          'ADRIANA DIOGO'
        ],
        'familyName': [
          'MOREIRA'
        ],
        'nameSuffix': [],
        'birthDate': {
          'dateTime': '1974-10-15T00:00:00-0300'
        },
        'email': '<Não informado>',
        'mobilePhone': '<Não informado>',
        'photo': null,
        'login': '<Não informado>',
        'room': '404',
        'hisAdtId': null,
        'careProviderIds': null,
        'careProviders': null,
        'cpf': '01679860747'
      },
      {
        'id': '23035',
        'name': 'ADRIANA PAIVA',
        'fullName': 'ADRIANA DE ORNELAS PAIVA',
        'givenName': [
          'ADRIANA'
        ],
        'familyName': [
          'PAIVA'
        ],
        'nameSuffix': [],
        'birthDate': {
          'dateTime': '1991-10-03T00:00:00-0300'
        },
        'email': '<Não informado>',
        'mobilePhone': '+55(21) 972046840',
        'photo': null,
        'login': '<Não informado>',
        'room': '403',
        'hisAdtId': null,
        'careProviderIds': null,
        'careProviders': null,
        'cpf': '14796801766'
      }
    ]
  };

  constructor(private translateService: TranslateService,
              private router: Router,
              private patientService: PatientService,
              private roomService: RoomService,
              private conceptmap: ConceptmapService,
              private appointmentCategoryService: AppointmentCategoryService,
              private appointmentTypeService: AppointmentTypeService,
              private scheduleService: ScheduleService,
              private permissions: PermissionsService) {
  }

  ngOnInit() {

    const perms:  Permissions[] = [{
      'type': 'READ',
      'name': 'CAREPLAN_ACTIVITY_TYPE'
    }, {
      'type': 'WRITE',
      'name': 'CAREPLAN_ACTIVITY_TYPE'
    },
  ];

  this.permVec = this.permissions.hasPermissions(perms);

    this.requestError = false;
    this.isloaded = false;
    this.isLoadedSearch = true;

    this.roomService.getSectors()
    .subscribe(roomServiceGetSectors => {
      // all get
      this.roomService.get()
        .subscribe(roomServiceGet => {
          this.conceptmap.get(environment.mappings.roomToSectorMap)
            .subscribe(concept => {
              this.appointmentCategoryService.getCategories()
              .subscribe(categories => {
                // pega os tipos de atividades
                this.appointmentTypeService.getTypes()
                  .subscribe(types => {
                    this.patientService.searchPatients(null, null, null, null, true)
                      .subscribe(patients => {
                          this.scheduleTypes = types.values;
                          this.scheduleCategories = categories.values;
                          sessionStorage.setItem('scheduleTypes', JSON.stringify(this.scheduleTypes));
                          sessionStorage.setItem('scheduleCategories', JSON.stringify(this.scheduleCategories));

                          this.roomSectors = roomServiceGetSectors.values;
                          // remove all sectors that are not in careplan
                          this.roomSectors = this.roomSectors.filter( val => {
                            return val.display.indexOf('Ala') < 0 ? false : true;
                          });
                          this.roomSectors.splice(this.roomSectors.length - 1, 1);
                          console.log(this.roomSectors);
                          this.roomAll = roomServiceGet.values;
                          this.conceptmapResult = concept.map;
                          console.log(this.patients);
                          console.log(this.roomSectors);
                          console.log(this.roomAll);
                          console.log(this.conceptmapResult);

                          this.roomSectors.unshift({
                            code: '',
                            display: 'Todos os Setores'
                          });

                          this.selectedRoomSectorDisplay = this.roomSectors[0].display;
                          this.selectedRoomSectorObject = this.roomSectors[0];
                          this.isloaded = true;
                          this.afterSearchProcessing(patients);
                          this.isloaded = true;
                    }, error => {
                      console.log('error');
                      this.requestError = true;
                      this.isloaded = true;
                    });
                  }, error => {
                    this.isLoadedProcessing = true;
                    this.generalErrorHandle(error);
                  });
              }, error => {
                this.isLoadedProcessing = true;
                this.generalErrorHandle(error);
              });
          }, error => {
            this.isLoadedProcessing = true;
            this.generalErrorHandle(error);
          });
      }, error => {
        this.isLoadedProcessing = true;
        this.generalErrorHandle(error);
      });
  }, error => {
    this.isLoadedProcessing = true;
    this.generalErrorHandle(error);
  });








    // Patient searcher using Observable
    this.patientSearchSubject
      .debounceTime(this.searchDebounceTime)
      .switchMap(term =>
        this.getAllPatientCards()
      )
      .subscribe(allPatients => {
          this.patients = allPatients.dtoList;
          this.calculatePatientAge();
          this.isLoading = false;
        },
        error => {
          console.error('Error => ', error);
          //this.patients = this.fakeData.dtoList;
          this.calculatePatientAge();
          this.isLoading = false;
          // this.isAsyncError = true;
        });
    this.patientSearchSubject.next();

    // Fetch appointments category
    this.appointmentCategoryService.getCategories()
      .subscribe((response) => {
          this.appointmentsCategory = response['values'];
        },
        (error) => {
          console.error('Error trying to fetch all appointments category => ', error);
        });
  }

  getAllPatientCards() {
    return this.patientService.getAll();
  }

  // Open the modal dialog and pass the instructions
  openDialog() {
    this.clearEventForm();
  }

  // Close the modal dialog
  closeDialog() {
    this.modalConfig.active = false;
  }

  // Clear all the modal dialog form inputs
  clearEventForm() {
    this.inputModels.title = '';
    this.inputModels.description = '';
    this.inputModels.videoLink = '';
    this.inputModels.date = this.dateFormatter(new Date()).slice(0, 10);
    this.inputModels.time.start = '06:00';
    this.inputModels.time.end = '08:00';
    this.inputModels.allDay = false;
    this.inputModels.standard = true;
    this.modalConfig.active = true;
  }

  retryAsyncOpertion() {
    this.isAsyncError = false;
    this.isLoading = true;
    this.getAllPatientCards();
  }

  calculatePatientAge() {
    this.patients.forEach((patient) => {
      if (patient.birthDate.dateTime) {
        const timeDiff = Math.abs(Date.now() - Date.parse(patient.birthDate.dateTime));
        // Used Math.floor instead of Math.ceil
        // so 26 years and 140 days would be considered as 26, not 27.
        patient.birthDate.age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
        this.birthDateFormat = this.translateService.currentLang === 'pt' || 'es' ? this.birthDateFormat : 'MM/dd/y';
      }
    });
  }

  showPatientDetail(patient: Patient) {
    console.log(patient);
    this.patientService.setSelectedPatient(patient);
    this.router.navigate(['/scheduler-practitioner/patient', patient.id]);
  }

  updateSuggestions() {
    this.isLoading = true;
    this.patientSearchSubject.next();
  }

  // Format date to the default config (YYYY-MM-DDThh:mm:ss);
  dateFormatter(date: Date): string {
    const year = date.getFullYear();

    const month = (date.getUTCMonth() + 1) < 10 ?
      '0' + (date.getUTCMonth() + 1) :
      (date.getUTCMonth() + 1);

    const day = date.getDate() < 10 ?
      '0' + date.getDate() :
      date.getDate();

    const hours = date.getHours() < 10 ?
      '0' + date.getHours() :
      date.getHours();

    const minutes = date.getMinutes() < 10 ?
      '0' + date.getMinutes() :
      date.getMinutes();

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  // Submit the standard appointment type form
  createStandardAppointmentType() {
    this.inputModels.category = this.modalConfig.categoryEventStyle.selectedCategory;

    const newAppointmentType = this.buildStandardAppointmentTypeObject();

    console.log(newAppointmentType);
    this.appointmentTypeService.create(newAppointmentType)
      .subscribe((response) => {
          console.log(response);
          this.closeDialog();
        },
        (error) => {
          console.error('Error trying to create a new standard appointment type => ', error);
        });
  }

  buildStandardAppointmentTypeObject(): AppointmentType {
    return {
      display: this.inputModels.title,
      unusable: false,
      definition: this.inputModels.description,
      allDayLong: this.inputModels.allDay,
      videoLink: this.inputModels.videoLink,
      category: {
        system: 'rdsl:model:set:appointment:category',
        code: this.inputModels.category
      },
      standardPeriod: {
        startDate: {
          dateTime: this.inputModels.date + 'T' + this.inputModels.time.start + ':00-03:00'
        },
        endDate: {
          dateTime: this.inputModels.date + 'T' + this.inputModels.time.end + ':00-03:00'
        }
      }
    };
  }

  afterSearchProcessing(patients) {
    this.hasGeneralError = false;
    this.isLoadedProcessing = false;
    console.log(patients);
    this.emptySearch = false;
    this.patients = patients;
    // this.patients = this.patients.dtoList;
    if (this.patients.length === 0) {
      this.emptySearch = true;
      this.isLoadedSearch = true;
      this.selectedRoomSectorDisplay = 'Todos os Setores'
      this.selectedRoomSectorObject = { code: '', display: 'Todos os Setores' };
      this.isLoadedProcessing = true;
    }

    // apenas faz todo o trabalho houver resposta
    if (!this.emptySearch) {
      // transforma o timestamp de cada paciente em uma data legivel
      for (let i = 0; i < this.patients.length; i++) {
        this.patients[i].birthDate.dateTime = this.patients[i].birthDate.dateTime;
        this.patients[i].birthDate.age = this.getAge(this.patients[i].birthDate.dateTime);
        // faz o campo de busca, juntando quarto e nome
        this.patients[i].searchfield = this.patients[i].fullName + ' ' + this.patients[i].room;
      }

      console.log(this.patients);

      // busca o careplan de cada paciente
      const stringIds: Array<string> = [];
      for (let i = 0; i < this.patients.length; i++) {
        stringIds[i] = (this.patients[i].id);
      }

      console.log(JSON.stringify(stringIds));
      // faz a chamada para cada paciente
      /*
      this.scheduleService.getByPatients(stringIds)
        .subscribe(plan => {

            this.patientPlan = plan;
            const patientInOrder: any[] = [];
            // adiciona o ID do quarto ao paciente
            for (let i = 0; i < this.roomAll.length; i++) {
              for (let j = 0; j < this.patients.length; j++) {
                if (this.roomAll[i].display.toUpperCase() === this.patients[j].room.toUpperCase()) {
                  this.patients[j].roomId = this.roomAll[i].code;
                  this.patients[j].roomDisplay = this.conceptmapResult[this.patients[j].roomId]
                  break;
                }
              }
            }

            // Relaciona o ID a Ala - Com o display
            for (let i = 0; i < this.patients.length; i++) {
              for (let j = 0; j < this.roomSectors.length; j++) {
                if (this.patients[i].roomDisplay === this.roomSectors[j].code) {
                  this.patients[i].roomDisplay = this.roomSectors[j].display;
                  break;
                }
              }
            }


            console.log(this.patients)
            console.log(this.conceptmapResult);

            // organiza a resposta dos planos para o mesmo índice do paciente
            this.patients.map((patient) => {
              patient.showTommorowOver = false;
              let found = false
              this.patientPlan.map((mapped) => {
                if (patient.id === mapped.patientId) {
                  patientInOrder.push(mapped)
                  found = true
                }
              })
              if (!found) {
                patientInOrder.push({})
              }
            })

            console.log(patientInOrder)

            this.patientPlan = patientInOrder
            // console.log(this.patients);

            this.activityPercentual(this.selectedDate, this.patientPlan);
            // this.checkNewPlan(this.patientPlan);
            this.haveActivityTomorrow(this.selectedDate);
            this.isLoadedProcessing = true;
        }, error => {
          this.isLoadedProcessing = true;
          this.generalErrorHandle(error)
        });
        */
    }
  }

  generalErrorHandle(error) {
    this.generalError = error;
    console.log( this.generalError);
    this.hasGeneralError = true;
    console.log(error);
  }
  getAge(birthday) {
    const today = new Date();
    let thisYear = 0;
    if (today.getMonth() < birthday.getMonth()) {
      thisYear = 1;
    } else if ((today.getMonth() === birthday.getMonth()) && today.getDate() < birthday.getDate()) {
      thisYear = 1;
    }
    const age = today.getFullYear() - birthday.getFullYear() - thisYear;
    return age;
  }

}
