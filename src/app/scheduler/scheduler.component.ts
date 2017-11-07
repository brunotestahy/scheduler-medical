import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { Scheduler } from '../shared/models/scheduler';
import { Schedule } from 'primeng/primeng';
import { ScheduleService } from '../services/schedule.service';
import { Subscription } from 'rxjs/Subscription';
import { EnumEventCategory } from '../shared/enums/event-categories.enum';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppointmentCategoryService } from '../services/appointment-category.service';
import { fadeAnimationTrigger } from '../shared/animations/fade-animation';
import { NgForm } from '@angular/forms';
import * as moment from 'moment/moment';
import { AppointmentService } from '../services/appointment.service';
import { Event } from '../shared/models/event';
import { Appointment } from '../shared/models/appointment';
import { AppointmentTypeService } from '../services/appointment-type.service';
import { EnumUserType } from '../shared/enums/user-type.enum';
import { AppointmentType } from '../shared/models/appointment-type';
import { AppointmentStandardService } from '../services/appointment-standard.service';
import { AppointmentStandard } from '../shared/models/appointment-standard';
import { BaseRequestOptions } from '@angular/http';
import { AppointmentListService } from '../services/appointment-list.service';
import { AppointmentList } from '../shared/models/appointment-list';

@Component({
  selector: 'scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
  animations: [
    fadeAnimationTrigger({}) // Params => {duration: '100ms'}
  ]
})
export class SchedulerComponent implements OnInit, OnDestroy, AfterViewInit {
  // Enable Animation Trigger
  @HostBinding('@fadeAnimation') fadeAnimationActive = true;

  @ViewChild('newEvent') newEvent: ElementRef;
  @ViewChild('schedule') scheduleElement: Schedule;

  // Inputs
  @Input() customScheduleObject: Scheduler;
  @Input() activeDay: Date = new Date();

  defaultScheduleObject: Scheduler;

  // Subscriptions
  dateEventSubscription: Subscription;
  standardCheckboxSubscription: Subscription;
  practitionerAddNewEventSubscription: Subscription;
  copyEventsFromYesterdaySubscription: Subscription;

  // Dialog options
  modalConfig = {
    active: false,
    type: '', // add-edit or description-detail
    action: '', // add or edit
    // Category event style
    categoryEventStyle: {
      activeCategoryClass: 'category-active-',
      selectedCategory: EnumEventCategory[EnumEventCategory.rotinahospitalar]
    },
    descriptionDetail: {
      title: '',
      description: '',
      videoLink: null
    },
    createActivityMode: false
  };

  // Loading options
  @Input() loadingActive: boolean;

  // Higher event index
  maxEventIndex: number;

  // Form to add or edit an event
  @ViewChild('modalSchedulerForm') modalSchedulerForm: NgForm;
  inputModels = {
    internalId: null,
    title: '',
    description: '',
    videoLink: '',
    date: '',
    category: null,
    time: {
      start: '',
      end: ''
    },
    type: '',
    allDay: false,
    repeatEveryDay: false,
    standard: false
  };

  constructor(private renderer: Renderer2,
              private scheduleService: ScheduleService,
              private translateService: TranslateService,
              private sanitizer: DomSanitizer,
              private appointmentService: AppointmentService,
              private appointmentTypeService: AppointmentTypeService,
              private appointmentCatergoryService: AppointmentCategoryService,
              private appointmentStandardService: AppointmentStandardService,
              private appointmentListService: AppointmentListService) {
  }

  ngOnInit() {
    this.loadingActive = this.loadingActive || true;

    this.buildAllEventsOnScheduler();
    this.configureScheduler();
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  ngAfterViewInit() {
    if (this.defaultScheduleObject.onlineMode) {
      this.fetchOnlinePatientEvents();
    } else {
      this.buildScheduler();
      setTimeout(() => {
        this.loadingActive = false;
      });
    }

    this.loadGeneralListeners();
  }

  loadGeneralListeners() {
    // Capture the calendar's date changing event
    this.dateEventSubscription = this.scheduleService.handleDateChange$
      .subscribe((newDate: Date) => {
        this.activeDay = newDate;
        this.scheduleElement.gotoDate(newDate);

        if (this.customScheduleObject.onlineMode) {
          this.loadingActive = true;
          this.fetchOnlinePatientEvents();
        } else {
          this.buildScheduler();
        }
      });

    // Capture Standard checkbox state
    this.standardCheckboxSubscription = this.scheduleService.handleAddStandardEvents$
      .subscribe((response: { standardCategory: string, state: boolean }) => {
        this.loadingActive = true;
        this.initStandardAppointmentsProcess(response);
        console.log('LOGUEI EVENTOS PADRAO');
      });

    // Capture the add event on patient detail page
    this.practitionerAddNewEventSubscription = this.scheduleService.handleAddNewEvent$
      .subscribe(() => {
        this.openDialog('add-edit', 'add');
      });

    // Capture the copy from yesterday event
    this.copyEventsFromYesterdaySubscription = this.scheduleService.handleCopyEventsFromYesterday$
      .subscribe(() => {
        this.copyEventsFromYesterday();
      });
  }

  unloadGeneralListeners() {
    this.dateEventSubscription.unsubscribe();
    this.standardCheckboxSubscription.unsubscribe();
    this.practitionerAddNewEventSubscription.unsubscribe();
    this.copyEventsFromYesterdaySubscription.unsubscribe();
  }

  fetchOnlinePatientEvents() {
    if (this.customScheduleObject.appointmentTypes.length > 0 &&
      this.customScheduleObject.appointmentCategory.length > 0 &&
      this.customScheduleObject.appointmentList.length > 0) {
      // Fetch all the appointments
      this.appointmentService.getPatientAppointments('24281')
        .subscribe((responseAppointments) => {
            console.log(responseAppointments);
            this.customScheduleObject.updatedEvents = this.transformAppointmentsIntoEvents(responseAppointments['dtoList']);

            this.finishBuildingOnlineMode();
          },
          (error) => {
            console.error('Error trying to fetch the patient events from the server => ', error);
            this.finishBuildingOnlineMode();
          });
      return;
    }

    // Fetch first the appointment types
    this.appointmentTypeService.getTypes()
      .subscribe((responseTypes) => {
          this.defaultScheduleObject.appointmentTypes = responseTypes['values'];
          console.log(this.defaultScheduleObject.appointmentTypes);

          // Fetch the appointment categories
          this.appointmentCatergoryService.getCategories()
            .subscribe((responseCategories) => {
                this.defaultScheduleObject.appointmentCategory = responseCategories['values'];
                console.log(this.defaultScheduleObject.appointmentCategory);

                // Fetach the appointmentList of the User
                this.appointmentListService.getAppointmentListByPatient('24281')
                  .subscribe((appointmentList: AppointmentList) => {

                      console.log(appointmentList);
                      this.customScheduleObject.appointmentList = appointmentList['dtoList'];

                      // Fetch all the appointments
                      this.appointmentService.getPatientAppointments('24281')
                        .subscribe((responseAppointments) => {
                            console.log(responseAppointments);
                            this.customScheduleObject.updatedEvents = this.transformAppointmentsIntoEvents(responseAppointments['dtoList']);

                            this.finishBuildingOnlineMode();
                          },
                          (error) => {
                            console.error('Error trying to fetch the patient events from the server => ', error);
                            this.finishBuildingOnlineMode();
                          });
                    },
                    (error) => {
                      console.error('Error trying to fetch the appointment list => ', error);
                      this.finishBuildingOnlineMode();
                    });
              },
              (error) => {
                console.error('Error trying to get the appointment category => ', error);
                this.finishBuildingOnlineMode();
              });
        },
        (error) => {
          console.error('Error trying to get the appointment types => ', error);
          this.finishBuildingOnlineMode();
        });
  }

  // Transform the appointment object (BackEnd) into an event object (FrontEnd)
  transformAppointmentsIntoEvents(appointments: Appointment[]): Event[] {
    const events: Event[] = [];
    appointments.forEach((appointment) => {
      events.push({
        id: parseInt(appointment.id, 10),
        title: appointment.description,
        description: appointment.comment,
        start: appointment.period.startDate.dateTime.slice(0, 16) + ':00',
        owner: appointment.owner,
        patientId: appointment.patientId,
        practitionersId: appointment.practitionersId,
        type: appointment.type,
        category: this.getEventCategoryFromAppointmentCategory(this.getAppointmentCategoryFromAppointmentType(appointment.type)),
        videoLink: this.checkVideoLinkAppointment(appointment.type),
        editable: this.checkEditableAppoitment(appointment),
        allDay: this.checkAllDayAppointment(appointment.type),
        end: this.checkAllDayAppointment(appointment.type) ? '' : appointment.period.endDate.dateTime.slice(0, 16) + ':00'
      });
    });

    return events;
  }

  // Start the process to check the standard appointments existence
  initStandardAppointmentsProcess(response) {
    if (this.customScheduleObject.appointmentTypes.length > 0 && this.customScheduleObject.appointmentStandard) {
      this.insertOrDeleteStandardAppointments(response.standardCategory, response.state);
    } else {
      this.appointmentStandardService.getAll()
        .subscribe((appointmentStandard: AppointmentStandard) => {
            this.customScheduleObject.appointmentStandard = appointmentStandard;
            this.insertOrDeleteStandardAppointments(response.standardCategory, response.state);
          },
          (error) => {
            console.error('Error trying to get the appointment types => ', error);
            this.loadingActive = false;
            this.scheduleService.emitDisableStandardCheckbox(false);
          });
    }
  }

  // Update the state of standard appointments whenever the checkbox is checked or not
  insertOrDeleteStandardAppointments(appointmentCategory: string, state: boolean) {
    const filteredAppointments = this.customScheduleObject.appointmentStandard.values
      .filter((appointmentType) => {
        return appointmentType.category.code === appointmentCategory && appointmentType.standardPeriod;
      });

    // Insert Case
    if (state) {
      this.customScheduleObject.updatedEvents = this.customScheduleObject.updatedEvents
        .concat(this.transformStandardAppointmentsIntoEvents(filteredAppointments));
      // Delete Case
    } else {
      this.customScheduleObject.updatedEvents = this.customScheduleObject.updatedEvents
        .filter((event) => {
          return !event.standard || EnumEventCategory[event.category] !== appointmentCategory;
        });
    }

    this.generateInternalID(this.customScheduleObject.updatedEvents);

    console.log('INIT STANDARD');

    setTimeout(() => {
      this.buildScheduler();
      this.loadingActive = false;
      this.scheduleService.emitDisableStandardCheckbox(false);
    });
  }

  // Copy the appointments from yesterday to the current day
  copyEventsFromYesterday() {
    this.loadingActive = true;

    const dateYesterday: Date = new Date(JSON.parse(JSON.stringify(this.activeDay)));
    dateYesterday.setDate(dateYesterday.getDate() - 1);
    console.log(this.dateFormatter(dateYesterday).slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10));

    const eventsYesterday: Event[] = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents
      .filter((event) => {
        return event.start.slice(0, 10) === this.dateFormatter(dateYesterday).slice(0, 10);
      })));

    eventsYesterday.forEach((eventYesterday) => {
      eventYesterday.start =
        eventYesterday.start.replace(eventYesterday.start.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10));
      eventYesterday.end = eventYesterday.end ?
        eventYesterday.end.replace(eventYesterday.end.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10)) : eventYesterday.end;
      this.customScheduleObject.updatedEvents.push(eventYesterday);
    });

    this.generateInternalID(this.customScheduleObject.updatedEvents);

    setTimeout(() => {
      this.buildScheduler();
      this.loadingActive = false;
      this.scheduleService.emitDisableStandardCheckbox(false);
    });
  }

  // Transform the standard appointment object (BackEnd) into an event object (FrontEnd)
  transformStandardAppointmentsIntoEvents(standardAppointments: AppointmentType[]): Event[] {
    const events: Event[] = [];
    standardAppointments.forEach((standardAppointment) => {

      // Don't insert standard appointments with abstract attribute
      if (!standardAppointment.abstract) {
        events.push({
          title: standardAppointment.display,
          description: standardAppointment.definition,
          start: this.dateFormatter(this.activeDay).slice(0, 10) +
          'T' + standardAppointment.standardPeriod.startDate.dateTime.slice(11, 16) + ':00',
          type: standardAppointment.code,
          category: this.getEventCategoryFromAppointmentCategory(standardAppointment.category.code),
          videoLink: standardAppointment.videoLink,
          editable: this.customScheduleObject.userType === EnumUserType.practitioner,
          standard: true,
          allDay: standardAppointment.allDayLong,
          end: standardAppointment.allDayLong ?
            '' : this.dateFormatter(this.activeDay).slice(0, 10) +
            'T' + standardAppointment.standardPeriod.endDate.dateTime.slice(11, 16) + ':00'
        });
      }
    });

    return events;
  }

  // Fetch the event category code from a appointment category code
  getEventCategoryFromAppointmentCategory(category: string): number {
    switch (category) {
      case EnumEventCategory[EnumEventCategory.rotinahospitalar]: {
        return EnumEventCategory.rotinahospitalar;
      }
      case EnumEventCategory[EnumEventCategory.refeicao]: {
        return EnumEventCategory.refeicao;
      }
      default: {
        return EnumEventCategory.outros;
      }
    }
  }

  // Fetch the appointment category from a appointment type code
  getAppointmentCategoryFromAppointmentType(type: string): string {
    const appointmentCategory = this.customScheduleObject.appointmentTypes
      .filter((appointmentType) => {
        return appointmentType.code === type;
      });

    return appointmentCategory.length > 0 ? appointmentCategory[0].category.code : '';
  }

  // Check if the appointment takes the all day
  checkAllDayAppointment(type: string): boolean {
    const eventAllday = this.customScheduleObject.appointmentTypes
      .filter((appointmentType) => {
        return appointmentType.code === type;
      });

    return eventAllday.length > 0 ? eventAllday[0].allDayLong : false;
  }

  // Check if the appointment is editable
  checkEditableAppoitment(appointment: Appointment): boolean {
    // Check the owner to make editable
    if (appointment.owner === 'Patient/24281') {
      return true;
    }

    // Otherwise check if the category allows to edit
    const eventCategory = this.customScheduleObject.appointmentCategory
      .filter((appointmentCategory) => {
        return appointmentCategory.code === appointment.type;
      });

    return eventCategory.length > 0 ? eventCategory[0].patientAllowable : false;
  }

  // Check if the appointment has a video link
  checkVideoLinkAppointment(type: string): string {
    const eventVideoLink = this.customScheduleObject.appointmentTypes
      .filter((appointmentType) => {
        return appointmentType.code === type;
      });

    return eventVideoLink.length > 0 ? eventVideoLink[0].videoLink : null;
  }

  // Return the appointment type for each appointment category
  checkAppointmentTypeFromCategory(category: string): string {
    const appointmentType = this.customScheduleObject.appointmentTypes
      .filter((appointType) => {
        console.log(category, appointType.category.code);
        return appointType.category.code === category;
      });

    return appointmentType.length > 0 ? appointmentType[0].code : '';
  }

  // Check if the standard appointment exists
  checkStandardAppointmentsExistence() {
    // Check the standard appointments inside the appointment list only in the practitioner view
    if (this.customScheduleObject.userType === EnumUserType.practitioner) {
      // Clear the checkboxes first
      this.scheduleService.emitCheckStandardCheckbox(EnumEventCategory[EnumEventCategory.rotinahospitalar], false);
      this.scheduleService.emitCheckStandardCheckbox(EnumEventCategory[EnumEventCategory.refeicao], false);
    }

    if (this.customScheduleObject.appointmentList.length === 0) {
      return;
    }

    this.customScheduleObject.appointmentList[0].followingCategoryDefault
      .forEach((standardAppointmentType) => {
        // Check if there are appointments type on appointment list
        if (standardAppointmentType === EnumEventCategory[EnumEventCategory.rotinahospitalar] ||
          EnumEventCategory[EnumEventCategory.refeicao]) {
          const standardAppointmentObject = {
            standardCategory: standardAppointmentType,
            state: true
          };

          // Check the standard appointments inside the appointment list only in the practitioner view
          if (this.customScheduleObject.userType === EnumUserType.practitioner) {
            this.scheduleService.emitCheckStandardCheckbox(standardAppointmentObject.standardCategory, standardAppointmentObject.state);
          }
          this.initStandardAppointmentsProcess(standardAppointmentObject);
        }
      });
  }

  // Build the schedule objecct with the default settings and overwrite if new settings were provided
  buildAllEventsOnScheduler() {

    this.defaultScheduleObject = {
      header: {
        left: '',
        center: '',
        right: ''
      },
      newEventHeader: {
        active: true,
        title1: 'Olá, ',
        title2: '! Veja abaixo as atividades de hoje.',
        buttonLabel: 'Adicionar Evento',
        patientName: 'Bruno'
      },
      i18nLanguage: {
        active: true
      },
      initialEvents: [],
      updatedEvents: [],
      eventCategoryStyles: {
        rotinahospitalar: {
          eventBgColor: '#EBF1F2',
          logoBgColor: '#DEF1F9',
          logoDescription: 'rotina<br>hospitalar'
        },
        refeicao: {
          eventBgColor: '#F6EEDD',
          logoBgColor: '#F7EAC5',
          logoDescription: 'refeição'
        },
        family: {
          eventBgColor: '#F0E3E4',
          logoBgColor: '#EBD0D2',
          logoDescription: 'visita da<br>família'
        },
        outros: {
          eventBgColor: '#F9EFE3',
          logoBgColor: '#F0EAE6',
          logoDescription: 'outros'
        },
      },
      allDayText: 'o dia\ntodo',
      editable: true,
      aspectRatio: 1,
      slotEventOverlap: false,
      defaultView: 'agendaDay',
      scrollTime: '06:00:00',
      timeFormat: 'H:mm',
      onlineMode: false,
      options: {
        theme: false,
        slotLabelFormat: 'HH',
        themeSystem: 'bootstrap3'
      },
      appointmentTypes: [],
      appointmentTypesFiltered: [],
      appointmentCategory: [],
      userType: EnumUserType.patient,
      ...this.customScheduleObject
    };

    this.generateInternalID(this.defaultScheduleObject.initialEvents);
  }

  // Generate internalIDs on each event object
  generateInternalID(events: Event[]) {
    events.forEach((event, index) => {
      event.internalID = index;
    });
  }

  // Only the editable events receive this class
  assignEditableEventsElements() {
    const eventsElements = document.querySelectorAll('.fc-event');
    const contentEventsElements = document.querySelectorAll('.fc-event .fc-content');

    const events = this.customScheduleObject.updatedEvents;

    for (let i = 0; i < eventsElements.length; i++) {
      for (let j = 0; j < events.length; j++) {
        if (events[j].editable === false) {
          continue;
        }

        if (eventsElements[i].innerHTML.indexOf(events[j].title) !== -1) {
          this.renderer.setAttribute(eventsElements[i], 'isEditable', 'true');
          this.renderer.setAttribute(contentEventsElements[i], 'isEditable', 'true');
        }
      }
    }
  }

  // Verify standard appointments to show a label
  markStandardEvents() {
    const eventContents = document.querySelectorAll('.fc-content');

    const events = this.customScheduleObject.updatedEvents;

    for (let i = 0; i < eventContents.length; i++) {
      for (let j = 0; j < events.length; j++) {
        if (eventContents[i].innerHTML.indexOf(events[j].title) !== -1) {
          //  Standard Label Element
          if (events[j].standard) {
            const labelElement = this.renderer.createElement('span');
            this.renderer.addClass(labelElement, 'standard-label');
            //  Depending on the language
            if (this.defaultScheduleObject.i18nLanguage) {
              this.translateService.getDefaultLang() === 'pt' ?
                this.renderer.setProperty(labelElement, 'innerHTML', 'Padrão') :
                this.renderer.setProperty(labelElement, 'innerHTML', 'Default');
            } else {
              this.renderer.setProperty(labelElement, 'innerHTML', 'Padrão');
            }
            this.renderer.appendChild(eventContents[i], labelElement);
          }
        }
      }
    }
  }

  // Apply different attributes for every event's category
  assignCategoriesOnEventElements() {
    // Escape if already exist the logo content
    const logoEvent = document.querySelectorAll('.fc-logo-event');
    if (logoEvent.length) {
      return;
    }

    const eventsElements = document.querySelectorAll('.fc-time-grid-event');
    const referenceElements = document.querySelectorAll('.fc-time-grid-event .fc-content');

    const events = this.customScheduleObject.updatedEvents;

    for (let i = 0; i < eventsElements.length; i++) {

      let styleApplyed: boolean = false;

      for (let j = 0; j < events.length; j++) {
        if (eventsElements[i].innerHTML.indexOf(events[j].title) !== -1) {

          // Control the style to be applied once
          if (styleApplyed) {
            continue;
          }

          styleApplyed = true;

          //  Category event description
          const descriptionLogoElement = this.renderer.createElement('div');
          this.renderer.addClass(descriptionLogoElement, 'logo-description');

          // Create logo container and the image element
          const newLogoWrapperElement = this.renderer.createElement('div');
          const newImageLogo = this.renderer.createElement('div');

          // Append the elements correctly
          this.renderer.appendChild(newLogoWrapperElement, newImageLogo);
          this.renderer.appendChild(newLogoWrapperElement, descriptionLogoElement);

          // Apply the correct style and structure for every event category
          switch (events[j].category) {
            case EnumEventCategory.rotinahospitalar: {
              this.renderer.addClass(newImageLogo, 'logo-rotinahospitalar');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.rotinahospitalar]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.rotinahospitalar.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.rotinahospitalar.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.refeicao: {
              this.renderer.addClass(newImageLogo, 'logo-refeicao');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.refeicao]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.refeicao.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.refeicao.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.family: {
              this.renderer.addClass(newImageLogo, 'logo-family');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.family]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.family.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.family.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.outros: {
              this.renderer.addClass(newImageLogo, 'logo-outros');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.outros]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.outros.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.outros.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
          }

          // Check the description existence to add a know-more link
          if (events[j].description) {
            this.onEventDescriptionExistence(referenceElements[i], events[j]);
          }
        }
      }
    }
  }

  onEventDescriptionExistence(containerElement: Element, eventObject: any) {
    const newLinkElement = this.renderer.createElement('a');
    this.renderer.addClass(newLinkElement, 'know-more-link');
    //  Depending on the language
    if (this.defaultScheduleObject.i18nLanguage) {
      this.translateService.getDefaultLang() === 'pt' ?
        this.renderer.setProperty(newLinkElement, 'innerHTML', 'Saiba mais') :
        this.renderer.setProperty(newLinkElement, 'innerHTML', 'Know more');
    } else {
      this.renderer.setProperty(newLinkElement, 'innerHTML', 'Saiba mais');
    }

    this.renderer.appendChild(containerElement, newLinkElement);

    this.renderer.listen(newLinkElement, 'click', (event) => {
      event.preventDefault();
      this.openDialog('description-detail');
      this.modalConfig.descriptionDetail.title = eventObject.title;
      this.modalConfig.descriptionDetail.description = eventObject.description;
      this.modalConfig.descriptionDetail.videoLink = eventObject.videoLink ?
        this.sanitizer.bypassSecurityTrustResourceUrl(eventObject.videoLink) :
        null;
    });
  }

  // Build and place listening on events to edit and delete
  listeningEventButtons() {
    const editableElements = document.querySelectorAll('.fc-event[isEditable="true"]');

    for (let i = 0; i < editableElements.length; i++) {
      // Edit Button
      const editButtonElement = this.renderer.createElement('div');
      this.renderer.addClass(editButtonElement, 'event-edit-button');
      this.renderer.appendChild(editableElements[i], editButtonElement);
      this.renderer.listen(editButtonElement, 'click', (event) => {
        for (let j = 0; j < this.customScheduleObject.updatedEvents.length; j++) {
          if (event.target.parentNode.innerHTML.indexOf(this.customScheduleObject.updatedEvents[j].title) !== -1) {
            setTimeout(() => {
              this.openDialog('add-edit', 'edit', this.customScheduleObject.updatedEvents[j]);
            });
          }
        }
      });

      // Delete Button
      const deleteButtonElement = this.renderer.createElement('div');
      this.renderer.addClass(deleteButtonElement, 'event-delete-button');
      this.renderer.appendChild(editableElements[i], deleteButtonElement);
      this.renderer.listen(deleteButtonElement, 'click', () => {
        this.deleteEvent();
      });
    }
  }

  // Style the custom resizer on events
  styleResizeElement() {
    const containers = document.querySelectorAll('.fc-event[isEditable="true"]');

    // Add the new resizer
    for (let i = 0; i < containers.length; i++) {
      const newEvent = this.renderer.createElement('div');
      this.renderer.addClass(newEvent, 'custom-resizer');
      this.renderer.appendChild(containers[i], newEvent);
    }

    // In case of events with duration similar to 30 minutes
    const minimumTime = 30; // 30 minutes

    this.customScheduleObject.updatedEvents.forEach((event) => {
      // Get the event duration
      const eventDuration = Math.abs(Date.parse(event.end) - Date.parse(event.start)) / 60000;

      // Restyle the event if its duration is 30 minutes
      if (eventDuration === minimumTime) {
        const eventLogos = document.querySelectorAll('.fc-logo-event');
        const eventContents = document.querySelectorAll('.fc-content');
        const eventTitles = document.querySelectorAll('.fc-title');

        // Hide the icons on logo
        for (let i = 0; i < eventLogos.length; i++) {
          if (eventLogos[i].nextSibling.textContent.indexOf(event.title) !== -1) {
            this.renderer.setStyle(eventLogos[i].firstChild, 'display', 'none');
            this.renderer.setStyle(eventLogos[i].nextSibling, 'font-size', '1.2rem');
          }
        }

        // Restyle the event title
        for (let i = 0; i < eventContents.length; i++) {
          if (eventContents[i].innerHTML.indexOf(event.title) !== -1) {
            this.renderer.setStyle(eventContents[i], 'font-size', '1.2rem');
            this.renderer.addClass(eventTitles[i], 'ellipsis-event-title');
          }
        }
      }
    });
  }

  // Adjust the font size on event objects
  resizeEventElementsOnSmallContent() {
    const eventContents = document.querySelectorAll('.fc-content');
    const eventTitles = document.querySelectorAll('.fc-title');
    const eventKnowMoreLinks = document.querySelectorAll('.know-more-link');
    const eventStandadLabels = document.querySelectorAll('.standard-label');

    for (let i = 0; i < eventContents.length; i++) {
      if (eventContents[i].clientWidth > 200) {
        continue;
      }

      this.customScheduleObject.updatedEvents.forEach((event) => {
        if (eventContents[i].innerHTML.indexOf(event.title) !== -1) {
          this.renderer.setStyle(eventContents[i], 'font-size', '1.2rem');
          this.renderer.addClass(eventTitles[i], 'ellipsis-event-title');


          // In case of events with duration similar to 30 minutes
          const minimumTime = 30; // 30 minutes

          // Get the event duration
          const eventDuration = Math.abs(Date.parse(event.end) - Date.parse(event.start)) / 60000;

          // Restyle the event if its duration is 30 minutes
          if (eventDuration === minimumTime) {

            // Resize the standard label
            for (let j = 0; j < eventStandadLabels.length; j++) {
              if (eventContents[i].contains(eventStandadLabels[j])) {
                this.renderer.addClass(eventStandadLabels[j], 'ellipsis-standard-label');
              }
            }

            // Resize the know more link
            for (let j = 0; j < eventKnowMoreLinks.length; j++) {
              if (eventContents[i].contains(eventKnowMoreLinks[j])) {
                this.renderer.addClass(eventKnowMoreLinks[j], 'ellipsis-know-more-link');
              }
            }
          }
        }

      });
    }
  }

  // Initialize the Scheduler settings
  buildScheduler(eventUpdated?: any) {

    this.fillEventsBgColors();

    this.assignEditableEventsElements();

    this.assignCategoriesOnEventElements();

    this.listeningEventButtons();

    this.styleResizeElement();

    this.markStandardEvents();

    this.resizeEventElementsOnSmallContent();

    this.onEventResizeOrMoved(eventUpdated);

    this.rewriteEvents();
  }

  // Rewrite and render the events after some update
  rewriteEvents() {
    this.customScheduleObject.initialEvents = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents));
    console.log(this.customScheduleObject.updatedEvents);

    setTimeout(() => {
      this.fillEventsBgColors();

      this.assignEditableEventsElements();

      this.assignCategoriesOnEventElements();

      this.listeningEventButtons();

      this.styleResizeElement();

      this.markStandardEvents();

      this.resizeEventElementsOnSmallContent();
    });
  }

  // Apply different bgcolors for every kind of event
  fillEventsBgColors() {
    const allEvents = this.customScheduleObject.updatedEvents;

    for (const event of allEvents) {
      switch (event.category) {
        case EnumEventCategory.rotinahospitalar: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.rotinahospitalar.eventBgColor;
          break;
        }
        case EnumEventCategory.refeicao: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.refeicao.eventBgColor;
          break;
        }
        case EnumEventCategory.family: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.family.eventBgColor;
          break;
        }
        case EnumEventCategory.outros: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.outros.eventBgColor;
          break;
        }
      }
    }
  }

  // Finish the scheduler building only for online mode
  finishBuildingOnlineMode() {
    this.checkStandardAppointmentsExistence();

    this.generateInternalID(this.customScheduleObject.updatedEvents);

    setTimeout(() => {
      this.buildScheduler();
      this.loadingActive = false;
    });
  }

  // Assign just the new properties inserted
  configureScheduler() {
    this.customScheduleObject = this.defaultScheduleObject;

    // Copy events initial state
    this.customScheduleObject.updatedEvents = JSON.parse(JSON.stringify(this.customScheduleObject.initialEvents));
  }

  // This method is called after the scheduler is rendered
  loadToAgendaView() {
    console.log(this.scheduleElement);
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

  // On Resize or Move the Event
  onEventResizeOrMoved(eventUpdated?: any) {
    console.log(eventUpdated);

    if (eventUpdated) {
      this.customScheduleObject.updatedEvents.forEach((event) => {
        if (event.internalID === eventUpdated.event.internalID) {
          // Make the update
          event.title = eventUpdated.event.title;
          event.start = eventUpdated.event.start.format();
          event.end = eventUpdated.event.end ? eventUpdated.event.end.format() : '';
          if (event.allDay) {
            event.end = this.dateFormatter(new Date(Date.parse(event.start) + 2 * 3600 * 1000));
          }
          event.allDay = eventUpdated.event.allDay;
        }
      });
    }
  }

  // Update the current event object whenever anyone is clicked
  handleEventClick(clickedEvent) {
    console.log(clickedEvent);
    this.customScheduleObject.currentEvent = clickedEvent.calEvent;
  }

  // First, add a new event object
  addNewEvent() {
    console.log(this.scheduleElement);

    // Fetch the max event id number
    const maxEventID = this.customScheduleObject.updatedEvents.reduce((prevEvent, currentEvent) => {
      return (prevEvent.internalID > currentEvent.internalID) ? prevEvent : currentEvent;
    });

    this.maxEventIndex ? this.maxEventIndex++ : (this.maxEventIndex = maxEventID.internalID + 1);

    this.customScheduleObject.updatedEvents.push({
      internalID: this.maxEventIndex,
      title: this.inputModels.title,
      description: this.inputModels.description,
      start: moment().format(this.inputModels.date + 'T' + this.inputModels.time.start),
      end: moment().format(this.inputModels.date + 'T' + this.inputModels.time.end),
      category: EnumEventCategory[this.modalConfig.categoryEventStyle.selectedCategory],
      backgroundColor: this.customScheduleObject.eventCategoryStyles[this.modalConfig.categoryEventStyle.selectedCategory].eventBgColor,
      owner: 'Patient/24281',
      patientId: '24281',
      type: this.inputModels.type
    });

    if (this.customScheduleObject.onlineMode) {
      this.loadingActive = true;
      this.updateEventsOnServer();
    } else {
      // Re-render and style the elements
      this.buildScheduler();
    }

    this.closeDialog();
  }

  // Create a new appointment object and send to the server
  updateEventsOnServer() {
    const newAppointmentObjects: Appointment[] = [];

    // Build the array of appointment objects
    this.customScheduleObject.updatedEvents.forEach((event) => {
      if (!event.id && !event.standard) {
        newAppointmentObjects.push({
          description: event.title,
          comment: event.description,
          status: 'proposed',
          period: {
            endDate: {
              dateTime: event.end + '-00:00'
            },
            startDate: {
              dateTime: event.start + '-00:00'
            }
          },
          owner: event.owner,
          patientId: event.patientId,
          type: event.type
        });
      }
    });

    console.log('Atualização => ', newAppointmentObjects);

    this.appointmentService.createCollection(newAppointmentObjects)
      .subscribe((response) => {
          console.log('Creation => ', response[0]);

          // Check Appointment List Existence
          if (this.customScheduleObject.appointmentList.length === 0) {
            // Create Appointment List
            const newAppointmentList = this.buildAppointmentListObject();
            console.log('AppointmentList Object => ', newAppointmentList);
            this.appointmentListService.create(newAppointmentList)
              .subscribe((newResponseList) => {
                  console.log('Create appointment list => ', newResponseList);

                  // Update appointmentList
                  newAppointmentList.entries.push('Appointment/' + newResponseList['id']);
                  this.appointmentListService.update(newResponseList['id'], newAppointmentList)
                    .subscribe((responseList) => {
                        console.log('Update Appointment List => ', responseList);
                        this.fetchOnlinePatientEvents();
                      },
                      (error) => {
                        console.error('Error trying to update appointmentList => ', error);
                        this.loadingActive = false;
                      });
                },
                (error) => {
                  console.error('Error trying to create an appointment list => ', error);
                  this.loadingActive = false;
                });
            return;
          }

          // Update appointmentList
          const updatedAppointmentList: AppointmentList = this.customScheduleObject.appointmentList[0];
          console.log(this.customScheduleObject.appointmentList);
          updatedAppointmentList.entries.push('Appointment/' + response[0]['id']);
          this.appointmentListService.update(this.customScheduleObject.appointmentList[0].id, updatedAppointmentList)
            .subscribe((responseList) => {
                console.log('Update Appointment List => ', responseList);
                this.fetchOnlinePatientEvents();
              },
              (error) => {
                console.error('Error trying to update appointmentList => ', error);
                this.loadingActive = false;
              });
        },
        (error) => {
          console.error('Error trying to create the appointments => ', error);
          this.loadingActive = false;
        });
  }

  // First, update an event object
  editEvent() {
    console.log(this.modalSchedulerForm);

    // Make the update
    this.customScheduleObject.currentEvent.title = this.inputModels.title;
    this.customScheduleObject.currentEvent.start = moment().format(this.inputModels.date + 'T' + this.inputModels.time.start);
    if (this.inputModels.allDay) {
      this.customScheduleObject.currentEvent.end = '';
    } else {
      this.customScheduleObject.currentEvent.end = moment().format(this.inputModels.date + 'T' + this.inputModels.time.end);
    }
    this.customScheduleObject.currentEvent.allDay = this.inputModels.allDay;
    this.customScheduleObject.currentEvent.type = this.inputModels.type;
    this.customScheduleObject.currentEvent.category = EnumEventCategory[this.modalConfig.categoryEventStyle.selectedCategory];

    this.customScheduleObject.updatedEvents.forEach((event) => {
      if (event.internalID === this.customScheduleObject.currentEvent.internalID) {
        event.title = this.customScheduleObject.currentEvent.title;
        event.category = this.customScheduleObject.currentEvent.category;
        event.start = this.customScheduleObject.currentEvent.start;
        event.end = this.customScheduleObject.currentEvent.end;
        event.allDay = this.customScheduleObject.currentEvent.allDay;
      }
    });

    console.log(this.customScheduleObject.updatedEvents);

    // Re-render and style the elements
    this.buildScheduler();

    this.closeDialog();
  }

  // First, delete an event object
  deleteEvent() {
    this.loadingActive = true;

    const appointmentIds: String[] = [];

    setTimeout(() => {
      appointmentIds.push('Appointment/' + this.customScheduleObject.currentEvent.id);

      const requestOptions = new BaseRequestOptions();
      requestOptions.body = appointmentIds;

      console.log('Deleting => ', appointmentIds);
      this.appointmentService.delete(requestOptions)
        .subscribe((response) => {
            console.log('Delete appointment successful => ', response);

            // Delete appointment from appointment List
            this.customScheduleObject.appointmentList[0].entries.splice(this.customScheduleObject.appointmentList[0].entries
              .findIndex(appointment => appointment === appointmentIds[0]), 1);
            console.log('Delete appointment List => ', this.customScheduleObject.appointmentList[0]);

            this.appointmentListService.update(appointmentIds[0].toString(), this.customScheduleObject.appointmentList[0])
              .subscribe((responseList) => {
                console.log('Update Appointment List => ', responseList);

              });

          },
          (error) => {
            console.error('Error trying to delete the appointment => ', error);
            this.loadingActive = false;
          });
    });
  }

  // Build Appointment List Object
  buildAppointmentListObject(): AppointmentList {
    return {
      title: 'Appointment List com internação de Adilson Xavier',
      patientId: '24281',
      status: 'current',
      system: 'rdsl:model:appointment:type',
      date: {
        dateTime: this.dateFormatter(new Date()) + '-03:00'
      },
      orderedBy: 'entry-date',
      hisAdtId: '999',
      mode: 'working',
      entries: [],
      note: 'Lista de appointments de Adilson Xavier editada com suas categorias de appointments padrão.',
      followingCategoryDefault: []
    };
  }

  // Actions during a form submit
  submitForm() {
    this.modalConfig.action === 'add' ?
      this.addNewEvent() :
      this.editEvent();
  }

  // Open the modal dialog and pass the instructions (Add or Edit an event)
  openDialog(type: string, action?: string, event?: any) {
    this.clearEventForm();

    this.modalConfig.active = true;
    this.modalConfig.type = type;
    this.modalConfig.action = action;

    //  Edit case
    if (event) {
      this.transferEventValuesToForm();
    } else {
      this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.rotinahospitalar];
      this.onAppointmentCategorySelected(EnumEventCategory[EnumEventCategory.rotinahospitalar]);
    }
  }

  // Close the modal dialog
  closeDialog() {
    this.customScheduleObject.currentEvent = null;
    this.modalConfig.active = false;
  }

  // Default values to the modal dialog form
  standardEventForm() {
    this.inputModels.title = '';
    this.inputModels.description = '';
    this.inputModels.type = '';
    this.inputModels.time.start = '06:00';
    this.inputModels.time.end = '08:00';
    this.inputModels.allDay = false;
    this.inputModels.repeatEveryDay = false;
    this.inputModels.standard = false;
    this.inputModels.date = this.dateFormatter(this.activeDay).slice(0, 10);
  }

  // Clear all the modal dialog form inputs
  clearEventForm() {
    this.modalConfig.type = '';
    this.modalConfig.action = '';
    this.inputModels.internalId = null;
    this.inputModels.title = '';
    this.inputModels.description = '';
    this.inputModels.videoLink = '';
    this.inputModels.date = '';
    this.inputModels.time.start = '';
    this.inputModels.time.end = '';
    this.inputModels.category = null;
    this.inputModels.type = '';
    this.inputModels.allDay = false;
    this.inputModels.repeatEveryDay = false;
    this.inputModels.standard = false;
  }

  // Pass the values from the current clicked event to the modal dialog form
  transferEventValuesToForm() {
    // Fill the form fields
    this.onAppointmentCategorySelected(EnumEventCategory[this.customScheduleObject.currentEvent.category]);
    this.inputModels.internalId = this.customScheduleObject.currentEvent.internalID;
    this.inputModels.title = this.customScheduleObject.currentEvent.title;
    this.inputModels.description = this.customScheduleObject.currentEvent.description;
    this.inputModels.videoLink = this.customScheduleObject.currentEvent.videoLink;
    this.inputModels.date = moment(this.customScheduleObject.currentEvent.start).format().slice(0, 10);
    this.inputModels.allDay = this.customScheduleObject.currentEvent.allDay;
    this.inputModels.standard = this.customScheduleObject.currentEvent.standard;
    this.inputModels.type = this.customScheduleObject.currentEvent.type;

    if (this.customScheduleObject.currentEvent.allDay) {
      this.inputModels.time.start = '06:00';
    } else {
      this.inputModels.time.start = this.customScheduleObject.currentEvent.start ?
        moment(this.customScheduleObject.currentEvent.start).format().slice(11, 16) :
        this.inputModels.time.start;
    }

    if (!this.customScheduleObject.currentEvent.allDay) {
      this.inputModels.time.end = this.customScheduleObject.currentEvent.end ?
        moment(this.customScheduleObject.currentEvent.end).format().slice(11, 16) :
        this.inputModels.time.end;
    }

    switch (this.customScheduleObject.currentEvent.category) {
      case EnumEventCategory.rotinahospitalar: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.rotinahospitalar];
        break;
      }
      case EnumEventCategory.refeicao: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.refeicao];
        break;
      }
      case EnumEventCategory.family: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.family];
        break;
      }
      case EnumEventCategory.outros: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.outros];
        break;
      }
    }
  }

  // Reload the appointment type selection after click in a category
  onAppointmentCategorySelected(selectedCategory: string) {
    this.standardEventForm();
    this.customScheduleObject.appointmentTypesFiltered = [];
    setTimeout(() => {
      this.modalConfig.categoryEventStyle.selectedCategory = selectedCategory;
      this.customScheduleObject.appointmentTypesFiltered = this.showAppointmentTypesOnSelect(selectedCategory);
    });
  }

  // Load the appointment type selection
  showAppointmentTypesOnSelect(category: string): AppointmentType[] {
    return this.customScheduleObject.appointmentTypes
      .filter((appointmentType) => {
        return appointmentType.category.code === category;
      });
  }

  // Bring information about the appointment type selected on the form
  onSelectTypeChange(appointmentTypeCode: string) {
    console.log(appointmentTypeCode);

    this.customScheduleObject.appointmentTypes
      .forEach((appointmentType) => {
        if (appointmentType.code === appointmentTypeCode) {
          this.inputModels.title = appointmentType.display;
          this.inputModels.description = appointmentType.definition;
          this.inputModels.time.start =
            appointmentType.standardPeriod && appointmentType.standardPeriod.startDate && appointmentType.standardPeriod ?
              appointmentType.standardPeriod.startDate.dateTime.slice(11, 16) + ':00' :
              this.inputModels.time.start;
          this.inputModels.allDay = appointmentType.allDayLong;
          this.inputModels.time.end =
            appointmentType.standardPeriod && appointmentType.standardPeriod.endDate && appointmentType.standardPeriod.endDate.dateTime ?
              appointmentType.standardPeriod.endDate.dateTime.slice(11, 16) + ':00' :
              this.inputModels.time.end;
        }
      });
  }

}
