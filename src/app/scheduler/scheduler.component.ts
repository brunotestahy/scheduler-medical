import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2, RendererStyleFlags2,
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
import { RefreshService } from '../services/refresh.service';
import { AppointmentCategory } from '../shared/models/appointment-category';
import * as Flickity from 'flickity';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { MessageService } from 'primeng/components/common/messageservice';

declare var dragscroll: any;

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

  // Time inputs on Modal
  @ViewChild('startTimeElement') startTimeElement: ElementRef;
  @ViewChild('endTimeElement') endTimeElement: ElementRef;
  timeError: boolean = false;

  // Inputs
  @Input() customScheduleObject: Scheduler;
  @Input() activeDay: Date = new Date();

  timeZone: number = moment(new Date()).utcOffset();

  defaultScheduleObject: Scheduler;

  // Subscriptions
  dateEventSubscription: Subscription;
  standardCheckboxSubscription: Subscription;
  practitionerAddNewEventSubscription: Subscription;
  copyEventsFromYesterdaySubscription: Subscription;
  refreshSubscription: Subscription;

  // Dialog options
  modalConfig = {
    active: false,
    type: '', // add-edit or description-detail
    action: '', // add or edit
    // Category event style
    categoryEventStyle: {
      activeCategoryClass: 'category-active-',
      selectedCategory: EnumEventCategory[EnumEventCategory.refeicao]
    },
    descriptionDetail: {
      title: '',
      description: '',
      videoLink: null
    }
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
    date: this.activeDay,
    category: null,
    time: {
      start: this.activeDay,
      end: this.activeDay
    },
    type: '',
    allDay: false,
    repeatEveryDay: false,
    standard: false
  };

  // Refresh state
  isRefreshing: boolean = false;

  // Carousel variable
  flkty: Flickity;

  // Local repeat every day events
  localRepeatEveryDayEvents: Event[] = [];

  // Calendar Input Language
  calendarLanguage: any;
  calendarDateFormat: string;

  ptDateFormat = 'dd/mm/yy';
  enDateFormat = 'mm/dd/yy';

  ptCalendarLanguage = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'],
    today: 'Hoje',
    clear: 'Limpar'
  };
  enCalendarLanguage = {
    firstDayOfWeek: 0,
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear'
  };

  // General Errors
  requestError: boolean = false;

  // Memorize events ID to avoid duplicate style
  localEventsMemoID: number[] = [];

  // Mouse coordinates to drag and drop and avoid click events
  mouseCoordinates = {
    posX: null,
    posY: null
  };

  constructor(private renderer: Renderer2,
              private scheduleService: ScheduleService,
              private translateService: TranslateService,
              private sanitizer: DomSanitizer,
              private appointmentService: AppointmentService,
              private appointmentTypeService: AppointmentTypeService,
              private appointmentCategoryService: AppointmentCategoryService,
              private appointmentStandardService: AppointmentStandardService,
              private appointmentListService: AppointmentListService,
              private refreshService: RefreshService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.loadingActive = this.loadingActive || true;

    this.buildAllEventsOnScheduler();
    this.configureScheduler();

    this.loadGeneralListeners();

    // Set input Calendar language
    if (this.translateService.getDefaultLang() === 'pt') {
      this.calendarLanguage = this.ptCalendarLanguage;
      this.calendarDateFormat = this.ptDateFormat;
    } else {
      this.calendarLanguage = this.enCalendarLanguage;
      this.calendarDateFormat = this.enDateFormat;
    }
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  ngAfterViewInit() {
    if (this.defaultScheduleObject.onlineMode) {
      // Load first the appointments type and category
      this.loadAppointmentTypeCategory();

      // Request date from Rules Calendar component if the practitioner view is rendered
      if (this.defaultScheduleObject.userType === EnumUserType.practitioner) {
        this.scheduleService.emitDateRequestFromRulesCalendar();
      } else {
        this.fetchOnlineEvents();
      }
    } else {
      this.buildScheduler();
      setTimeout(() => {
        this.loadingActive = false;
      });
    }
  }

  loadGeneralListeners() {
    // Capture the calendar's date changing event
    this.dateEventSubscription = this.scheduleService.handleDateChange$
      .subscribe((newDate: Date) => {
        this.activeDay = newDate;
        this.timeZone = moment(newDate).utcOffset();
        this.scheduleElement.gotoDate(newDate);

        if (this.customScheduleObject.onlineMode) {
          this.loadingActive = true;
          this.fetchOnlineEvents();
        } else {
          this.buildScheduler();
        }
      });

    // Capture Standard checkbox state
    this.standardCheckboxSubscription = this.scheduleService.handleAddStandardEvents$
      .subscribe((response: { standardCategory: string, state: boolean }) => {
        this.loadingActive = true;
        this.initStandardAppointmentsProcess(response, true);
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

    // Capture the refresh button state
    this.refreshSubscription = this.refreshService.handleRefreshState$
      .subscribe((shouldRefresh: boolean) => {
        if (shouldRefresh) {
          this.loadingActive = true;
          this.isRefreshing = true;
          this.fetchOnlineEvents();
        }
      });
  }

  unloadGeneralListeners() {
    this.dateEventSubscription.unsubscribe();
    this.standardCheckboxSubscription.unsubscribe();
    this.practitionerAddNewEventSubscription.unsubscribe();
    this.copyEventsFromYesterdaySubscription.unsubscribe();
    this.refreshSubscription.unsubscribe();
  }

  // Style scheduler scroll only for practitioner view
  scheduleLayoutForPractitioner() {
    if (this.customScheduleObject.userType === EnumUserType.patient) {
      const scheduleScroller = document.querySelector('.fc-scroller');
      const scheduleTimeGrid = document.querySelector('.fc-scroller > .fc-time-grid');
      const scheduleEvents = document.querySelectorAll('.fc-time-grid-event');

      if (!(scheduleScroller && scheduleTimeGrid && scheduleEvents)) {
        return;
      }

      // Value 1 here means important flag to css
      const importantFlag: RendererStyleFlags2 = 1;
      this.renderer.setStyle(scheduleScroller, 'overflow-x', 'auto', importantFlag);
      this.renderer.setStyle(scheduleTimeGrid, 'min-width', '120rem');

      for (let i = 0; i < scheduleEvents.length; i++) {
        this.renderer.setStyle(scheduleEvents[i], 'max-width', '45rem');
      }
    }
  }

  // Load appointments type and category
  loadAppointmentTypeCategory() {
    Observable.zip(
      // Fetch first the appointment types
      this.appointmentTypeService.getTypes(),
      // Fetch the appointment categories
      this.appointmentCategoryService.getCategories()
    )
      .subscribe(([responseAppointmentTypes, responseAppointmentCategory]) => {
          this.defaultScheduleObject.appointmentTypes = responseAppointmentTypes['values'];
          this.defaultScheduleObject.appointmentCategory = responseAppointmentCategory['values'];

          console.log('Appointment Type', responseAppointmentTypes);
          console.log('Appointment Category', responseAppointmentCategory);
        },
        (error) => {
          // Emit general error
          this.scheduleService.emitGeneralError(true);
          this.requestError = true;
          console.error(error);
          this.finishBuildingOnlineMode(true);
        });
  }

  fetchOnlineEvents() {
    // Change the general Error to the default value
    this.scheduleService.emitGeneralError(false);
    this.requestError = false;

    // Empty the local repeat every day event
    this.localRepeatEveryDayEvents = [];

    // Adjust the real time displayed at the scheduler
    this.customScheduleObject.scrollTime = this.dateFormatter(new Date()).slice(11, 16);

    this.appointmentListService.getAppointmentListByPatient(this.customScheduleObject.patientData.id)
      .flatMap((responseAppointmentList) => {
        this.customScheduleObject.appointmentList = responseAppointmentList['dtoList'];

        console.log('Appointment List', responseAppointmentList);

        // Check Appointment List Existence
        if (this.customScheduleObject.appointmentList.length === 0 ||
          !this.checkAppointmentListExistenceByHisAdtId(this.customScheduleObject.patientData.hisAdtId)) {
          // Create Appointment List
          const newAppointmentListObject = this.buildAppointmentListObject();
          return this.appointmentListService.create(newAppointmentListObject)
            .flatMap((newAppointmentList: AppointmentList) => {
              // Update appointmentList object
              newAppointmentListObject.id = newAppointmentList.id;
              newAppointmentListObject.version = newAppointmentList.version;
              console.log('LIST => ', newAppointmentListObject);
              this.customScheduleObject.appointmentList.push(newAppointmentListObject);
              this.makePatientFollowStandardAppointmentByDefault();

              // Update appointmentList
              const updatedAppointmentList: AppointmentList =
                this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId);
              return this.appointmentListService
                .update(this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).id, updatedAppointmentList);
            })
            .flatMap((responseList) => {
              console.log('Update Appointment List => ', responseList);

              // Fetch all the appointments
              return this.appointmentService.getPatientAppointments(this.customScheduleObject.patientData.id);
            });
        } else {
          // Fetch all the appointments
          return this.appointmentService.getPatientAppointments(this.customScheduleObject.patientData.id);
        }
      })
      .subscribe((responseAppointments) => {
          console.log('Appointments', responseAppointments);
          this.customScheduleObject.updatedEvents = this.transformAppointmentsIntoEvents(responseAppointments['dtoList']);
          this.finishBuildingOnlineMode();
        },
        (error) => {
          // Emit general error
          this.scheduleService.emitGeneralError(true);
          this.requestError = true;
          console.error(error);
          this.finishBuildingOnlineMode(true);
        });
  }

  // Start the process to check the standard appointments existence
  initStandardAppointmentsProcess(response, updateAppointmentList?: boolean) {
    if (this.customScheduleObject.appointmentTypes.length > 0 && this.customScheduleObject.appointmentStandard) {
      this.insertOrDeleteStandardAppointments(response.standardCategory, response.state, updateAppointmentList);
    } else {
      this.appointmentStandardService.getAll()
        .subscribe((appointmentStandard: AppointmentStandard) => {
            this.customScheduleObject.appointmentStandard = appointmentStandard;
            this.insertOrDeleteStandardAppointments(response.standardCategory, response.state, updateAppointmentList);
          },
          (error) => {
            // Emit general error
            this.scheduleService.emitGeneralError(true);
            this.requestError = true;

            console.error('Error trying to get the appointment types => ', error);
            this.loadingActive = false;
            this.scheduleService.emitDisableStandardCheckbox(false);
          });
    }
  }

  // Update the state of standard appointments whenever the checkbox is checked or not
  insertOrDeleteStandardAppointments(appointmentCategory: string, state: boolean, updateAppointmentList?: boolean) {
    const filteredAppointments = this.customScheduleObject.appointmentStandard.values
      .filter((appointmentType) => {
        return appointmentType.category.code === appointmentCategory && appointmentType.standardPeriod;
      });

    // Insert Case
    if (state) {
      // Change the title name to avoid conflicts with standard appointments
      for (const event of this.customScheduleObject.updatedEvents) {

        this.customScheduleObject.appointmentTypes.forEach((appointmentType) => {
          if (this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId) &&
            this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).followingCategoryDefault.length > 0 &&
            appointmentType.display === event.title) {

            if (this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId)
                .followingCategoryDefault.includes(appointmentType.category.code)) {
              event.title = appointmentType.display + ' ';
            }
          }
        });
      }

      this.customScheduleObject.updatedEvents = this.customScheduleObject.updatedEvents
        .concat(this.transformStandardAppointmentsIntoEvents(filteredAppointments));

      // Delete Case
    } else {
      this.customScheduleObject.updatedEvents = this.customScheduleObject.updatedEvents
        .filter((event) => {
          return !event.standard || EnumEventCategory[event.category] !== appointmentCategory;
        });
    }

    console.log(state);
    console.log(updateAppointmentList);

    // Update only if the checkbox state changes
    if (updateAppointmentList) {

      // Update appointmentList
      const updatedAppointmentList: AppointmentList = this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId);
      if (state) {
        if (!updatedAppointmentList.followingCategoryDefault.includes(appointmentCategory)) {
          updatedAppointmentList.followingCategoryDefault.push(appointmentCategory);
        }
      } else {
        updatedAppointmentList.followingCategoryDefault.splice(updatedAppointmentList.followingCategoryDefault
          .findIndex(category => category === appointmentCategory), 1);
      }
      this.appointmentListService
        .update(this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).id, updatedAppointmentList)
        .subscribe((responseList) => {
            console.log('Update Appointment List => ', responseList);
            this.fetchOnlineEvents();
          },
          (error) => {
            // Emit general error
            this.scheduleService.emitGeneralError(true);
            this.requestError = true;

            console.error('Error trying to update appointmentList => ', error);
            this.loadingActive = false;
          });
    } else {
      setTimeout(() => {
        this.buildScheduler();
        this.loadingActive = false;
        this.scheduleService.emitDisableStandardCheckbox(false);
      });
    }
  }

  // Copy the appointments from yesterday to the current day
  copyEventsFromYesterday() {
    this.loadingActive = true;

    // Catch the yesterday date
    const dateYesterday: Date = new Date(JSON.parse(JSON.stringify(this.activeDay)));
    dateYesterday.setDate(dateYesterday.getDate() - 1);
    console.log(this.dateFormatter(dateYesterday).slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10));

    // Filter and catch only events from yesterday, not standard and not repeat every day
    const eventsYesterday: Event[] = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents
      .filter((event) => {
        return event.start.slice(0, 10) === this.dateFormatter(dateYesterday).slice(0, 10) && !event.standard && !event.repeatEveryDay;
      })));

    // Filter and catch only events from yesterday, not standard and not repeat every day
    const eventsToday: Event[] = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents
      .filter((event) => {
        return event.start.slice(0, 10) === this.dateFormatter(this.activeDay).slice(0, 10) && !event.standard && !event.repeatEveryDay;
      })));

    // Escape if there aren't events on the previous date
    if (eventsYesterday.length === 0) {
      this.loadingActive = false;
      this.messageService.add({severity: 'warn', summary: 'Atenção!', detail: 'Não existem atividades no dia anterior'});
      return;
    }

    // Rebuild every event with the current date
    eventsYesterday.forEach((eventYesterday) => {
      eventYesterday.start =
        eventYesterday.start.replace(eventYesterday.start.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10));

      // In all day event case
      if (!eventYesterday.allDay) {
        eventYesterday.end = eventYesterday.end ?
          eventYesterday.end.replace(eventYesterday.end.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10)) : eventYesterday.end;
      }
    });

    this.generateInternalID(this.customScheduleObject.updatedEvents);

    if (this.customScheduleObject.onlineMode) {
      this.loadingActive = true;
      const newAppointmentObjects: Appointment[] = [];
      // Get only the las added events

      for (let i = 0; i < eventsYesterday.length; i++) {
        let shouldCopy = false;
        for (let j = 0; j < eventsToday.length; j++) {
          if ((eventsYesterday[i].allDay === eventsToday[j].allDay &&
              eventsYesterday[i].category === eventsToday[j].category &&
              eventsYesterday[i].title === eventsToday[j].title &&
              eventsYesterday[i].description === eventsToday[j].description &&
              eventsYesterday[i].start.slice(11, 16) === eventsToday[j].start.slice(11, 16) &&
              eventsYesterday[i].repeatEveryDay === eventsToday[j].repeatEveryDay &&
              eventsYesterday[i].type === eventsToday[j].type &&
              eventsYesterday[i].videoLink === eventsToday[j].videoLink)) {

            if (eventsYesterday[i].allDay) {
              shouldCopy = !(eventsYesterday[i].end === eventsToday[j].end);
            } else {
              shouldCopy = !(eventsYesterday[i].end.slice(11, 16) === eventsToday[j].end.slice(11, 16));
            }
            if (!shouldCopy) {
              break;
            }
          } else {
            shouldCopy = true;
          }
        }
        if (shouldCopy || eventsToday.length === 0) {
          this.customScheduleObject.updatedEvents.push(eventsYesterday[i]);
          console.log(this.transformEventsIntoAppointments().reverse());
          newAppointmentObjects.push(this.transformEventsIntoAppointments().reverse()[0]);
        }
      }
      if (newAppointmentObjects.length > 0) {
        this.createAppointmentsProcess(newAppointmentObjects);
        let messageDetail = 'Você copiou uma atividade';
        if (newAppointmentObjects.length > 1) {
          messageDetail = `Você copiou ${newAppointmentObjects.length} atividades`;
        }
        this.messageService.add({severity: 'success', summary: 'Sucesso!', detail: messageDetail});
      } else {
        this.loadingActive = false;
        this.messageService.add({severity: 'warn', summary: 'Atenção!', detail: 'Você já copiou estas atividades'});
      }
    } else {
      setTimeout(() => {
        this.buildScheduler();
        this.loadingActive = false;
        this.scheduleService.emitDisableStandardCheckbox(false);
      });
    }
  }

  // Transform the appointment object (BackEnd) into an event object (FrontEnd)
  transformAppointmentsIntoEvents(appointments: Appointment[]): Event[] {
    const events: Event[] = [];

    // Catch only schedule context appointments
    appointments = appointments.filter((filteredApp) => {
      return filteredApp.context === 'schedule';
    });
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
        allDay: appointment.allDayLong,
        end: appointment.allDayLong ? '' : appointment.period.endDate.dateTime.slice(0, 16) + ':00',
        version: appointment.version,
        repeatEveryDay: !!appointment.repetitionPeriod,
        context: appointment.context
      });

      if (appointment.repetitionPeriod) {
        this.localRepeatEveryDayEvents.push(events[events.length - 1]);
      }
    });

    return events;
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
          editable: false,
          standard: true,
          allDay: standardAppointment.allDayLong,
          end: standardAppointment.allDayLong ?
            '' : this.dateFormatter(this.activeDay).slice(0, 10) +
            'T' + standardAppointment.standardPeriod.endDate.dateTime.slice(11, 16) + ':00',
          version: standardAppointment.version
        });
      }
    });

    return events;
  }

  // Transform events into appointments objects
  transformEventsIntoAppointments(shouldUpdateEvents?: boolean): Appointment[] {
    const appointments: Appointment[] = [];
    this.customScheduleObject.updatedEvents.forEach((event, index) => {
      if (!event.standard) {
        appointments.push({
          allDayLong: event.allDay,
          description: event.title,
          comment: event.description,
          status: 'proposed',
          period: {
            endDate: {
              dateTime: event.allDay ? event.start.slice(0, 10) + 'T12:00:00-00:00' : event.end + '-00:00'
            },
            startDate: {
              dateTime: event.allDay ? event.start.slice(0, 10) + 'T11:00:00-00:00' : event.start + '-00:00'
            }
          },
          owner: event.owner,
          patientId: event.patientId,
          type: event.type,
          version: event.version,
          context: event.context
        });

        // Use the existing id in update case
        if (shouldUpdateEvents) {
          appointments[appointments.length - 1].id = event.id.toString();
          console.log(appointments[appointments.length - 1]);
        }

        // Just with repeat every day events
        if (event.repeatEveryDay) {
          appointments[appointments.length - 1].repetitionPeriod = {
            startDate: {
              dateTime: event.start.slice(0, 10) + 'T12:00:00-00:00'
            },
            endDate: {
              dateTime: ''
            }
          };
        }
      }
    });

    console.log('Appointments => ', appointments);
    return appointments;
  }

  // Fetch the event category code from a appointment category code
  getEventCategoryFromAppointmentCategory(category: string): number {
    switch (category) {
      case EnumEventCategory[EnumEventCategory.refeicao]: {
        return EnumEventCategory.refeicao;
      }
      case EnumEventCategory[EnumEventCategory.higiene]: {
        return EnumEventCategory.higiene;
      }
      case EnumEventCategory[EnumEventCategory.exames]: {
        return EnumEventCategory.exames;
      }
      case EnumEventCategory[EnumEventCategory.curativo]: {
        return EnumEventCategory.curativo;
      }
      case EnumEventCategory[EnumEventCategory.fisioterapia]: {
        return EnumEventCategory.fisioterapia;
      }
      case EnumEventCategory[EnumEventCategory.fonoaudiologia]: {
        return EnumEventCategory.fonoaudiologia;
      }
      case EnumEventCategory[EnumEventCategory.medicacao]: {
        return EnumEventCategory.medicacao;
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

  // Check if the appointment is editable
  checkEditableAppoitment(appointment: Appointment): boolean {
    // Check the owner to make editable
    if (appointment.owner === 'Patient/' + this.customScheduleObject.patientData.id ||
      this.customScheduleObject.userType === EnumUserType.practitioner) {
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

  // Check if the standard appointment exists
  checkStandardAppointmentsExistence() {
    // Check the standard appointments inside the appointment list only in the practitioner view
    if (this.customScheduleObject.userType === EnumUserType.practitioner) {
      // Clear the checkboxes first
      this.scheduleService.emitCheckStandardCheckbox(EnumEventCategory[EnumEventCategory.refeicao], false);
    }

    if (this.customScheduleObject.appointmentList.length === 0) {
      return;
    }

    this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).followingCategoryDefault
      .forEach((standardAppointmentType) => {
        // Check if there are appointments type on appointment list
        if (standardAppointmentType === EnumEventCategory[EnumEventCategory.refeicao]) {
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

  // Check if a repeat every day appointment exists
  checkRepeatEveryDayAppointmentExistence() {
    const repeatEventsCopy = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents
      .filter((appointment) => {
        return appointment.repeatEveryDay;
      })));

    // Update the events with the active date
    repeatEventsCopy.forEach((event) => {

      // Check if the active date on scheduler is bigger than the current date
      const activeDate = this.dateFormatter(this.activeDay).slice(0, 10);
      const eventDate = event.start.slice(0, 10);
      if (activeDate > eventDate) {
        event.start =
          event.start.replace(event.start.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10));

        // In all day event case
        if (!event.allDay) {
          event.end = event.end ?
            event.end.replace(event.end.slice(0, 10), this.dateFormatter(this.activeDay).slice(0, 10)) : event.end;
        }

        // Assign the fake event as a copy
        event.repeatEveryDayCopy = true;

        this.customScheduleObject.updatedEvents.push(event);
      }
    });
  }

  // Check if the appointment list with an hisAdtId already exists
  checkAppointmentListExistenceByHisAdtId(hisAdtId: string): boolean {
    return this.customScheduleObject.appointmentList.filter((appointmentList) => {
      return hisAdtId === appointmentList.hisAdtId;
    }).length > 0;
  }

  // Return the current appointment list by hisAdtId
  getCurrentAppointmentList(hisAdtId: string): AppointmentList {
    return this.customScheduleObject.appointmentList.filter((appointmentList) => {
      return appointmentList.hisAdtId === hisAdtId;
    })[0];
  }

  // Check if the patient should follow the standard appointment category or not
  makePatientFollowStandardAppointmentByDefault() {
    const standardAppointmentsToFollow: AppointmentCategory[] = this.customScheduleObject.appointmentCategory
      .filter((appointmentCategory) => {
        return appointmentCategory.shouldUseDefaultsOnAppointmentListCreation;
      });

    standardAppointmentsToFollow.forEach((standardAppointment) => {
      if (!this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId)
          .followingCategoryDefault.includes(standardAppointment.code)) {
        this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId)
          .followingCategoryDefault.push(standardAppointment.code);
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
        refeicao: {
          eventBgColor: '#f2eddd',
          logoBgColor: '#f3e9c6',
          logoDescription: 'refeição'
        },
        higiene: {
          eventBgColor: '#e6e7f0',
          logoBgColor: '#e0e3f2',
          logoDescription: 'higiene'
        },
        exames: {
          eventBgColor: '#f0ede9',
          logoBgColor: '#efe9e4',
          logoDescription: 'exames'
        },
        curativo: {
          eventBgColor: '#f5e9e8',
          logoBgColor: '#fae1e1',
          logoDescription: 'curativo'
        },
        fisioterapia: {
          eventBgColor: '#dfe9ec',
          logoBgColor: '#d3e5ec',
          logoDescription: 'fisioterapia'
        },
        fonoaudiologia: {
          eventBgColor: '#f2e7ed',
          logoBgColor: '#f2e3eb',
          logoDescription: 'fonoaudiologia'
        },
        medicacao: {
          eventBgColor: '#e6f1ee',
          logoBgColor: '#e0f2ee',
          logoDescription: 'medicação'
        },
        outros: {
          eventBgColor: '#f0eeed',
          logoBgColor: '#efeeed',
          logoDescription: 'outros'
        },
      },
      allDayText: 'o dia\ntodo',
      editable: true,
      aspectRatio: 1,
      slotEventOverlap: false,
      defaultView: 'agendaDay',
      scrollTime: this.dateFormatter(new Date()).slice(11, 16),
      timeFormat: 'H:mm',
      onlineMode: false,
      options: {
        theme: false,
        slotLabelFormat: 'HH',
        themeSystem: 'bootstrap3',
        agendaEventMinHeight: 53
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
    // On patient view this method is not necessary
    if (this.customScheduleObject.userType === EnumUserType.patient) {
      return;
    }

    const eventContents = document.querySelectorAll('.fc-content');

    // Standard Label Element
    const events = this.customScheduleObject.updatedEvents.filter((event) => {
      return event.standard === true;
    });

    for (let i = 0; i < eventContents.length; i++) {
      for (let j = 0; j < events.length; j++) {

        // All day elements has only one children
        if (eventContents[i].children.length > 1) {
          if (eventContents[i].children[1].textContent === events[j].title) {

            // Scape to avoid duplicate elements
            if (eventContents[i].innerHTML.includes('Padrão') || eventContents[i].innerHTML.includes('Default')) {
              continue;
            }

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

      let styleApplied: boolean = false;

      for (let j = 0; j < events.length; j++) {
        // Condition is different between standard and ordinary events
        const equalCondition: boolean = events[j].standard ?
          eventsElements[i].innerHTML.indexOf(events[j].title) !== -1 :
          eventsElements[i].id.includes(events[j].id.toString());

        if (equalCondition) {

          // Control the style to be applied once
          if (styleApplied) {
            continue;
          }

          styleApplied = true;

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
            case EnumEventCategory.higiene: {
              this.renderer.addClass(newImageLogo, 'logo-higiene');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.higiene]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.higiene.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.higiene.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.exames: {
              this.renderer.addClass(newImageLogo, 'logo-exames');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.exames]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.exames.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.exames.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.curativo: {
              this.renderer.addClass(newImageLogo, 'logo-curativo');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.curativo]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.curativo.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.curativo.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.fisioterapia: {
              this.renderer.addClass(newImageLogo, 'logo-fisioterapia');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.fisioterapia]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.fisioterapia.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.fisioterapia.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.fonoaudiologia: {
              this.renderer.addClass(newImageLogo, 'logo-fonoaudiologia');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.fonoaudiologia]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.fonoaudiologia.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.fonoaudiologia.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.medicacao: {
              this.renderer.addClass(newImageLogo, 'logo-medicacao');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.medicacao]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.medicacao.logoBgColor);
              this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                this.customScheduleObject.eventCategoryStyles.medicacao.logoDescription);
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
            case EnumEventCategory.outros: {
              this.renderer.addClass(newImageLogo, 'logo-outros');
              this.renderer.setAttribute(newLogoWrapperElement, 'category', EnumEventCategory[EnumEventCategory.outros]);
              this.renderer.addClass(newLogoWrapperElement, 'fc-logo-event');
              this.renderer.setStyle(newLogoWrapperElement, 'background-color',
                this.customScheduleObject.eventCategoryStyles.outros.logoBgColor);

              // On patient view set its name as the label
              if (events[j].owner) {
                this.renderer.setStyle(newImageLogo, 'display', 'none');
                this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                  this.customScheduleObject.patientData.name.split(' ')[0].charAt(0).toUpperCase() +
                  this.customScheduleObject.patientData.name.split(' ')[0].slice(1).toLowerCase());
              } else {
                this.renderer.setProperty(descriptionLogoElement, 'innerHTML',
                  this.customScheduleObject.eventCategoryStyles.outros.logoDescription);
              }
              this.renderer.insertBefore(eventsElements[i], newLogoWrapperElement, referenceElements[i]);
              break;
            }
          }
        }
      }
    }

    // Add a know-more link to ordinary events
    this.onEventDescriptionExistence();

    // Add know-more-link to all day events
    this.onAllDayEventDescriptionExistence();
  }

  onEventDescriptionExistence() {

    const gridTimeElements = document.querySelectorAll('.fc-time-grid-event .fc-content');

    const todayEvents = this.customScheduleObject.updatedEvents.filter((event) => {
      return event.start.includes(this.dateFormatter(this.activeDay).slice(0, 10)) && !event.allDay && !event.standard;
    });

    this.localEventsMemoID = [];

    for (let i = 0; i < gridTimeElements.length; i++) {

      for (const eventObject of todayEvents) {
        // In case of events with duration similar to 30 minutes
        const minimumTime = 30; // 30 minutes

        // Get the event duration
        const eventDuration = Math.abs(Date.parse(eventObject.end) - Date.parse(eventObject.start)) / 60000;

        if (gridTimeElements[i].parentElement.id.includes(eventObject.id.toString()) &&
          (eventObject.description || eventObject.videoLink || (eventObject.title.length > 15 && eventDuration <= minimumTime))) {

          if (gridTimeElements[i].innerHTML.includes('Saiba mais') || gridTimeElements[i].innerHTML.includes('Know more') ||
            this.localEventsMemoID.includes(eventObject.id)) {
            continue;
          }

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

          this.renderer.appendChild(gridTimeElements[i], newLinkElement);

          this.renderer.listen(newLinkElement, 'click', (event) => {
            event.preventDefault();
            this.openDialog('description-detail');
            this.modalConfig.descriptionDetail.title = eventObject.title;
            this.modalConfig.descriptionDetail.description = eventObject.description;
            this.modalConfig.descriptionDetail.videoLink = eventObject.videoLink ?
              this.sanitizer.bypassSecurityTrustResourceUrl(eventObject.videoLink.includes('watch') ?
                eventObject.videoLink.replace('watch?v=', 'embed/') : eventObject.videoLink) :
              null;
          });

          this.localEventsMemoID.push(eventObject.id);
        }
      }
    }
  }

  onAllDayEventDescriptionExistence() {
    const eventContents = document.querySelectorAll('.fc-content');

    for (let i = 0; i < eventContents.length; i++) {

      this.customScheduleObject.updatedEvents
        .filter((filteredEvent) => {
          return !filteredEvent.standard;
        })
        .forEach((event) => {
          if (eventContents[i].parentElement.id.includes(event.id.toString()) && event.allDay && (event.description || event.videoLink)) {

            // Scape to avoid duplicate elements
            if (!(eventContents[i].innerHTML.includes('Saiba mais') || eventContents[i].innerHTML.includes('Know more'))) {

              console.log('ENTREI PADRAO');

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

              const breakLineElement = this.renderer.createElement('br');
              this.renderer.appendChild(eventContents[i], breakLineElement);
              this.renderer.appendChild(eventContents[i], newLinkElement);

              this.renderer.listen(newLinkElement, 'click', (eventJS) => {
                eventJS.preventDefault();
                this.openDialog('description-detail');
                this.modalConfig.descriptionDetail.title = event.title;
                this.modalConfig.descriptionDetail.description = event.description;
                this.modalConfig.descriptionDetail.videoLink = event.videoLink ?
                  this.sanitizer.bypassSecurityTrustResourceUrl(event.videoLink) :
                  null;
              });

            }
          }
        });
    }
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
        const editableEvents = this.customScheduleObject.updatedEvents.filter((filteredEvent) => {
          return !filteredEvent.standard;
        });
        for (let j = 0; j < editableEvents.length; j++) {
          if (event.target.parentElement.id.includes(editableEvents[j].id.toString())) {
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
  }

  // Adjust the font size on event objects
  resizeEventElementsOnSmallContent() {
    const eventContents = document.querySelectorAll('.fc-content');
    const eventTitles = document.querySelectorAll('.fc-title');
    const eventKnowMoreLinks = document.querySelectorAll('.know-more-link');
    const eventStandadLabels = document.querySelectorAll('.standard-label');
    const eventLogos = document.querySelectorAll('.fc-logo-event');

    for (let i = 0; i < eventContents.length; i++) {

      if (eventTitles[i]) {
        this.renderer.addClass(eventTitles[i], 'break-event-title');
      }

      this.customScheduleObject.updatedEvents
        .forEach((event) => {
          // Condition is different between standard and ordinary events
          const equalCondition: boolean = event.standard ?
            eventContents[i].innerHTML.indexOf(event.title) !== -1 :
            eventContents[i].parentElement.id.includes(event.id.toString());

          if (equalCondition) {

            // In case of events with duration similar to 30 minutes
            const minimumTime = 30; // 30 minutes

            // Get the event duration
            const eventDuration = Math.abs(Date.parse(event.end) - Date.parse(event.start)) / 60000;

            if (eventContents[i].parentElement.clientWidth < 300) {
              this.renderer.setStyle(eventContents[i], 'font-size', '1.4rem');

              // Resize the logo description
              if (eventLogos[i]) {
                this.renderer.setStyle(eventLogos[i].lastChild, 'font-size', '.9rem');
              }

              // Resize the know more link
              for (let k = 0; k < eventKnowMoreLinks.length; k++) {
                if (eventContents[i].contains(eventKnowMoreLinks[k])) {
                  this.renderer.setStyle(eventKnowMoreLinks[k], 'font-size', '1.4rem');
                }
              }
            }

            if (eventContents[i].parentElement.clientWidth < 250) {
              this.renderer.setStyle(eventContents[i], 'font-size', '1.2rem');

              this.renderer.setStyle(eventTitles[i], 'width', '70%');

              // Resize the logo description
              if (eventLogos[i]) {
                this.renderer.setStyle(eventLogos[i].lastChild, 'font-size', '.8rem');
              }

              // Resize the know more link
              for (let k = 0; k < eventKnowMoreLinks.length; k++) {
                if (eventContents[i].contains(eventKnowMoreLinks[k])) {
                  this.renderer.setStyle(eventKnowMoreLinks[k], 'font-size', '1.2rem');
                }
              }
            }

            // Restyle the event if its duration is 30 minutes
            if (eventDuration <= minimumTime || eventContents[i].parentElement.clientWidth < 250) {

              this.renderer.removeClass(eventTitles[i], 'break-event-title');

              if (eventDuration <= minimumTime && eventContents[i].clientWidth < 250) {
                // Resize the standard label
                for (let j = 0; j < eventStandadLabels.length; j++) {
                  if (eventContents[i].contains(eventStandadLabels[j])) {
                    this.renderer.addClass(eventStandadLabels[j], 'ellipsis-standard-label');
                  }
                }

                // Resize the know more link
                for (let k = 0; k < eventKnowMoreLinks.length; k++) {
                  if (eventContents[i].contains(eventKnowMoreLinks[k])) {
                    this.renderer.addClass(eventKnowMoreLinks[k], 'ellipsis-know-more-link');
                  }
                }

                // Ellipsis the title
                this.renderer.addClass(eventTitles[i], 'ellipsis-event-title');
              }

              if (eventDuration <= minimumTime && eventContents[i].innerHTML.includes(event.start.slice(12, 16)) &&
                eventContents[i].innerHTML.includes(event.end.slice(12, 16))) {
                // Hide the icons on logo
                for (let j = 0; j < eventLogos.length; j++) {
                  // Condition is different between standard and ordinary events
                  const equalLogoCondition: boolean = event.standard ?
                    eventLogos[j].parentElement.innerHTML.indexOf(event.title) !== -1 :
                    eventLogos[j].id.includes(event.id.toString());

                  if (equalLogoCondition) {
                    this.renderer.setStyle(eventLogos[j].firstChild, 'display', 'none');
                    this.renderer.setStyle(eventLogos[j].nextSibling, 'font-size', '1.2rem');
                  }
                }
              }

            } else {
              if (eventTitles[i]) {
                this.renderer.removeClass(eventTitles[i], 'break-event-title');
              }
            }
          }
        });
    }
  }

  // Remove selected class when an event is resized or removed
  removeSelectedClass() {
    const eventElements = document.querySelectorAll('.fc-event');

    if (eventElements.length > 0) {
      for (let i = 0; i < eventElements.length; i++) {
        this.renderer.removeClass(eventElements[i], 'fc-selected');
      }
    }
  }

  // Style passed time slots on schedule
  stylePassedTimeSlots() {
    const slots = document.querySelectorAll('tr[data-time]');

    const realTime = moment(new Date()).format();

    for (let i = 0; i < slots.length; i++) {
      const slotTime = slots[i]['dataset']['time'];
      const limitSlotTime = moment(this.dateFormatter(this.activeDay).slice(0, 10) + 'T' + slotTime).add(30, 'm').format();

      if (Date.parse(limitSlotTime) < Date.parse(realTime)) {
        this.renderer.addClass(slots[i], 'passed-time');
      }
    }
  }

  // Initialize the Scheduler settings
  buildScheduler() {
    console.log('BUILD OCCURRED');
    this.fillEventsBgColors();

    this.stylePassedTimeSlots();

    this.assignEditableEventsElements();

    this.listeningEventButtons();

    this.styleResizeElement();

    this.markStandardEvents();

    this.resizeEventElementsOnSmallContent();

    this.rewriteEvents();
  }

  // Rewrite and render the events after some update
  rewriteEvents() {
    this.customScheduleObject.initialEvents = JSON.parse(JSON.stringify(this.customScheduleObject.updatedEvents));
    console.log('Schedule Object', this.customScheduleObject);
    console.log(this.customScheduleObject.updatedEvents);

    setTimeout(() => {
      this.fillEventsBgColors();

      this.assignEditableEventsElements();

      this.listeningEventButtons();

      this.styleResizeElement();

      this.markStandardEvents();

      this.removeSelectedClass();

      this.assignCategoriesOnEventElements();

      this.resizeEventElementsOnSmallContent();

      // Style scheduler scroll only for practitioner view
      this.scheduleLayoutForPractitioner();
    });
  }

  // Apply different bgcolors for every kind of event
  fillEventsBgColors() {
    const allEvents = this.customScheduleObject.updatedEvents;

    for (const event of allEvents) {
      switch (event.category) {
        case EnumEventCategory.refeicao: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.refeicao.eventBgColor;
          break;
        }
        case EnumEventCategory.higiene: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.higiene.eventBgColor;
          break;
        }
        case EnumEventCategory.exames: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.exames.eventBgColor;
          break;
        }
        case EnumEventCategory.curativo: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.curativo.eventBgColor;
          break;
        }
        case EnumEventCategory.fisioterapia: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.fisioterapia.eventBgColor;
          break;
        }
        case EnumEventCategory.fonoaudiologia: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.fonoaudiologia.eventBgColor;
          break;
        }
        case EnumEventCategory.medicacao: {
          event.backgroundColor = this.customScheduleObject.eventCategoryStyles.medicacao.eventBgColor;
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
  finishBuildingOnlineMode(error?: boolean) {
    // Any kind of errors during server calls
    if (!error) {
      this.checkStandardAppointmentsExistence();

      this.checkRepeatEveryDayAppointmentExistence();

      this.generateInternalID(this.customScheduleObject.updatedEvents);

      if (this.isRefreshing) {
        this.refreshService.emitRefreshState(false);
      }
    }

    // If it doesn't have any standard appointment or the appointment list is null, finalize the event rendering
    if (error || this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).followingCategoryDefault.length === 0) {
      setTimeout(() => {
        this.buildScheduler();
        this.loadingActive = false;
        this.scheduleService.emitDisableStandardCheckbox(false);

        if (this.isRefreshing) {
          this.refreshService.emitRefreshState(false);
        }
      });
    }
  }

  // Assign just the new properties inserted
  configureScheduler() {
    this.customScheduleObject = this.defaultScheduleObject;

    // Copy events initial state
    this.customScheduleObject.updatedEvents = JSON.parse(JSON.stringify(this.customScheduleObject.initialEvents));
  }

  // This method is called after the scheduler is rendered
  loadToAgendaView(event: any) {
    console.log(this.scheduleElement);
    console.log('Agenda', event);

    // Make agenda possible to scroll dragging with mouse events
    this.activateDragScroll(true);
  }

  activateDragScroll(shouldEnable: boolean) {
    const scrollContainer = document.querySelector('.fc-scroller');

    // Save the mouse coordinates
    this.renderer.listen(scrollContainer, 'mousedown', (mouseEvent) => {
      this.mouseCoordinates.posX = mouseEvent['pageX'];
      this.mouseCoordinates.posY = mouseEvent['pageY'];
    });

    if (shouldEnable) {
      this.renderer.addClass(scrollContainer, 'dragscroll');
    } else {
      this.renderer.removeClass(scrollContainer, 'dragscroll');
    }

    dragscroll.reset();
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
    console.log('EVENT RESIZED', eventUpdated);

    if (eventUpdated) {
      this.customScheduleObject.updatedEvents.forEach((event) => {
        if (event.internalID === eventUpdated.internalID) {
          // Make the update
          event.title = eventUpdated.title;
          event.start = eventUpdated.start.format();
          event.end = eventUpdated.end ? eventUpdated.end.format() : '';
          if (event.allDay) {
            event.end = this.dateFormatter(new Date(Date.parse(event.start) + 2 * 3600 * 1000));
          }
          event.allDay = eventUpdated.allDay;

          // Update only the time and not the date if it's a repeat every day event
          if (eventUpdated.repeatEveryDay) {
            this.localRepeatEveryDayEvents.forEach((repeatEvent) => {
              if (repeatEvent.id === eventUpdated.id) {
                event.start = event.start.replace(event.start.slice(0, 10), repeatEvent.start.slice(0, 10));
                event.end = event.end.replace(event.end.slice(0, 10), repeatEvent.end.slice(0, 10));
              }
            });
          }
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

    // If there aren't events
    if (this.customScheduleObject.updatedEvents.length === 0) {
      this.maxEventIndex = 0;
    } else {
      // Fetch the max event id number
      const maxEventID = this.customScheduleObject.updatedEvents.reduce((prevEvent, currentEvent) => {
        return (prevEvent.internalID > currentEvent.internalID) ? prevEvent : currentEvent;
      });

      this.maxEventIndex ? this.maxEventIndex++ : (this.maxEventIndex = maxEventID.internalID + 1);
    }

    // In All Day event case, default time from 11:00 to 12:00 is applied
    this.customScheduleObject.updatedEvents.push({
      internalID: this.maxEventIndex,
      title: this.inputModels.title,
      description: this.inputModels.description,
      allDay: this.inputModels.allDay,
      start: this.inputModels.allDay ?
        moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T11:00:00') :
        moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T' +
          this.dateFormatter(this.inputModels.time.start).slice(11, 16)),
      end: this.inputModels.allDay ?
        moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T12:00:00') :
        moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T' +
          this.dateFormatter(this.inputModels.time.end).slice(11, 16)),
      category: this.customScheduleObject.userType === EnumUserType.patient ?
        EnumEventCategory['outros'] : EnumEventCategory[this.modalConfig.categoryEventStyle.selectedCategory],
      backgroundColor: this.customScheduleObject.eventCategoryStyles[this.modalConfig.categoryEventStyle.selectedCategory].eventBgColor,
      owner: this.customScheduleObject.userType === EnumUserType.patient ? 'Patient/' + this.customScheduleObject.patientData.id : '',
      patientId: this.customScheduleObject.patientData.id,
      type: this.customScheduleObject.userType === EnumUserType.patient ? 'outros' : this.inputModels.type,
      repeatEveryDay: this.inputModels.repeatEveryDay,
      standard: false,
      context: 'schedule'
    });

    if (this.customScheduleObject.onlineMode) {
      this.loadingActive = true;
      this.createEventsOnServer();
    } else {
      // Re-render and style the elements
      this.buildScheduler();
    }

    this.closeDialog();
  }

  // Create a new single appointment object and send it to the server
  createEventsOnServer() {
    // Build the array of appointment objects
    let newAppointmentObject: Appointment[] = this.transformEventsIntoAppointments();

    // Take always the last object to create
    newAppointmentObject = [newAppointmentObject[newAppointmentObject.length - 1]];

    this.createAppointmentsProcess(newAppointmentObject);
  }

  // Build the new appointment collection to the server
  createAppointmentsProcess(newAppointements: Appointment[]) {
    this.appointmentService.createCollection(newAppointements)
      .flatMap((appointments: Appointment[]) => {
        console.log('Creation => ', appointments[0]);

        this.customScheduleObject.updatedEvents[this.customScheduleObject.updatedEvents.length - 1].id =
          parseInt(appointments[0].id, 10);
        this.customScheduleObject.updatedEvents[this.customScheduleObject.updatedEvents.length - 1].version =
          appointments[0].version;

        // Update appointmentList
        const updatedAppointmentList: AppointmentList = this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId);
        console.log('ALREADY UPDATED => ', this.customScheduleObject.appointmentList);
        updatedAppointmentList.entries.push('Appointment/' + appointments[0].id);

        return this.appointmentListService
          .update(this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).id, updatedAppointmentList);
      })
      .subscribe((responseList) => {
          console.log('Update Appointment List => ', responseList);
          console.log('EVENTS', this.customScheduleObject.updatedEvents);
          this.fetchOnlineEvents();
        },
        (error) => {
          // Emit general error
          this.scheduleService.emitGeneralError(true);
          this.requestError = true;

          console.error('Error trying to create appointment => ', error);
          this.loadingActive = false;
        });
  }

  // First, update an event object
  editEvent() {
    console.log(this.modalSchedulerForm);

    setTimeout(() => {
      // Make the update
      this.customScheduleObject.currentEvent.title = this.inputModels.title;
      this.customScheduleObject.currentEvent.description = this.inputModels.description;
      this.customScheduleObject.currentEvent.start = moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T' +
        this.dateFormatter(this.inputModels.time.start).slice(11, 16));
      if (this.inputModels.allDay) {
        this.customScheduleObject.currentEvent.end = '';
      } else {
        this.customScheduleObject.currentEvent.end = moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T' +
          this.dateFormatter(this.inputModels.time.end).slice(11, 16));
      }
      this.customScheduleObject.currentEvent.allDay = this.inputModels.allDay;
      this.customScheduleObject.currentEvent.type = this.inputModels.type;
      this.customScheduleObject.currentEvent.category = EnumEventCategory[this.modalConfig.categoryEventStyle.selectedCategory];
      this.customScheduleObject.currentEvent.repeatEveryDay = this.inputModels.repeatEveryDay;

      this.customScheduleObject.updatedEvents.forEach((event) => {
        if (event.internalID === this.customScheduleObject.currentEvent.internalID) {
          event.title = this.customScheduleObject.currentEvent.title;
          event.description = this.customScheduleObject.currentEvent.description;
          event.category = this.customScheduleObject.currentEvent.category;
          event.type = this.customScheduleObject.currentEvent.type;
          event.allDay = this.customScheduleObject.currentEvent.allDay;
          event.start = event.allDay ? moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T11:00:00') :
            this.customScheduleObject.currentEvent.start;
          event.end = event.allDay ? moment().format(this.dateFormatter(this.inputModels.date).slice(0, 10) + 'T12:00:00') :
            this.customScheduleObject.currentEvent.end;
          event.repeatEveryDay = this.customScheduleObject.currentEvent.repeatEveryDay;

          // Update only the time and not the date if it's a repeat every day event
          if (this.customScheduleObject.currentEvent.repeatEveryDay) {
            this.localRepeatEveryDayEvents.forEach((repeatEvent) => {
              if (repeatEvent.id === this.customScheduleObject.currentEvent.id) {
                event.start = event.start.replace(event.start.slice(0, 10), repeatEvent.start.slice(0, 10));
                event.end = event.end.replace(event.end.slice(0, 10), repeatEvent.end.slice(0, 10));
              }
            });
          }
        }
      });

      if (this.customScheduleObject.onlineMode) {
        this.loadingActive = true;
        this.updateEventsOnServer();
      } else {
        // Re-render and style the elements
        this.buildScheduler();
      }

      this.closeDialog();
    });
  }

  // Update and send the events collection to the server
  updateEventsOnServer(moveOrResizedEvent?: any) {
    if (moveOrResizedEvent) {
      moveOrResizedEvent['jsEvent'].stopPropagation();
      this.onEventResizeOrMoved(moveOrResizedEvent['event']);
      this.loadingActive = true;
    }

    this.appointmentService.update(this.transformEventsIntoAppointments(true))
      .subscribe((response) => {
          console.log('UPDATED', response);
          this.fetchOnlineEvents();
        },
        (error) => {
          // Emit general error
          this.scheduleService.emitGeneralError(true);
          this.requestError = true;

          console.error('Error trying to update the appointments => ', error);
          this.loadingActive = false;
        });
  }

  // First, delete an event object
  deleteEvent() {
    if (!this.customScheduleObject.onlineMode) {
      setTimeout(() => {
        this.customScheduleObject.updatedEvents.splice(this.customScheduleObject.updatedEvents.findIndex(event =>
          event.internalID === this.customScheduleObject.currentEvent.internalID
        ), 1);

        // Re-render and style the elements
        this.rewriteEvents();
      });

      return;
    }

    this.loadingActive = true;

    const appointmentIds: String[] = [];

    setTimeout(() => {
      appointmentIds.push('Appointment/' + this.customScheduleObject.currentEvent.id);

      // Delete appointment from appointment List
      this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).entries
        .splice(this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).entries
          .findIndex(appointment => appointment === appointmentIds[0]), 1);
      console.log('Delete appointment from appointment List => ',
        this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId));

      this.appointmentListService
        .update(this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId).id,
          this.getCurrentAppointmentList(this.customScheduleObject.patientData.hisAdtId))
        .subscribe((responseList) => {
            console.log('Update Appointment List => ', responseList);

            // Delete the appointment
            const requestOptions = new BaseRequestOptions();
            requestOptions.body = appointmentIds;

            console.log('Deleting => ', appointmentIds);
            this.appointmentService.deleteAppointments(requestOptions)
              .subscribe(() => {
                  this.fetchOnlineEvents();
                },
                (error) => {
                  // Emit general error
                  this.scheduleService.emitGeneralError(true);
                  this.requestError = true;

                  console.error('Error trying to delete the appointment => ', error);
                  this.loadingActive = false;
                });
          },
          (error) => {
            // Emit general error
            this.scheduleService.emitGeneralError(true);
            this.requestError = true;

            console.error('Error trying to update an appointment List => ', error);
            this.loadingActive = false;
          });
    });
  }

  // Build Appointment List Object
  buildAppointmentListObject(): AppointmentList {
    return {
      title: 'Appointment List com internação de ' + this.customScheduleObject.patientData.name,
      patientId: this.customScheduleObject.patientData.id,
      status: 'current',
      system: 'rdsl:model:appointment:type',
      date: {
        dateTime: this.dateFormatter(new Date()) + '-03:00'
      },
      orderedBy: 'entry-date',
      hisAdtId: this.customScheduleObject.patientData.hisAdtId,
      mode: 'working',
      entries: [],
      note: 'Lista de appointments de ' + this.customScheduleObject.patientData.name +
      ' editada com suas categorias de appointments padrão.',
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
    console.log(this.modalConfig.categoryEventStyle.selectedCategory);
    if (this.modalSchedulerForm) {
      this.modalSchedulerForm.resetForm();
    }

    // After reset the form, fill the form with the default values
    setTimeout(() => {
      this.clearEventForm();

      // Only for practitioner in add modal
      if (this.customScheduleObject.userType === EnumUserType.practitioner && type === 'add-edit') {
        setTimeout(() => {
          this.carouselLoader();
        });
      }

      this.modalConfig.active = true;
      this.modalConfig.type = type;
      this.modalConfig.action = action;

      //  Edit case
      if (event) {
        this.transferEventValuesToForm();
      } else {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.refeicao];
        this.onAppointmentCategorySelected(EnumEventCategory[EnumEventCategory.refeicao]);
      }

      this.timeInputValidator();
    });

    // Add class to avoid body scroll when the modal is opened
    this.renderer.addClass(document.body, 'modal-open');
  }

  // Close the modal dialog
  closeDialog() {
    this.customScheduleObject.currentEvent = null;
    this.modalConfig.active = false;

    // Remove class to avoid body scroll when the modal is opened
    this.renderer.removeClass(document.body, 'modal-open');

    // Only for practitioner in add modal
    if (this.customScheduleObject.userType === EnumUserType.practitioner && this.modalConfig.type === 'add-edit') {
      // Destroy carousel element
      this.flkty.destroy();
    }

    this.activateDragScroll(true);
  }

  // Default values to the modal dialog form
  standardEventForm() {
    this.inputModels.type = '';
    this.inputModels.date = this.activeDay;
  }

  // Clear all the modal dialog form inputs
  clearEventForm() {
    this.modalConfig.type = '';
    this.modalConfig.action = '';
    this.inputModels.internalId = null;
    this.inputModels.title = '';
    this.inputModels.description = '';
    this.inputModels.videoLink = '';
    this.inputModels.date = this.activeDay;
    this.inputModels.time.start = moment(this.activeDay).minutes(0).seconds(0).toDate();
    this.inputModels.time.end = moment(this.activeDay).minutes(30).seconds(0).toDate();
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
    this.inputModels.date = moment(this.customScheduleObject.currentEvent.start).toDate();
    this.inputModels.allDay = this.customScheduleObject.currentEvent.allDay;
    this.inputModels.standard = this.customScheduleObject.currentEvent.standard;
    this.inputModels.repeatEveryDay = this.customScheduleObject.currentEvent.repeatEveryDay;
    this.inputModels.type = this.customScheduleObject.currentEvent.type;

    if (this.customScheduleObject.currentEvent.allDay) {
      this.inputModels.time.start = moment(this.activeDay).hours(6).minutes(0).seconds(0).toDate();
    } else {
      this.inputModels.time.start = this.customScheduleObject.currentEvent.start ?
        moment(this.customScheduleObject.currentEvent.start).utcOffset(this.timeZone, true).toDate() :
        this.inputModels.time.start;
    }

    if (!this.customScheduleObject.currentEvent.allDay) {
      this.inputModels.time.end = this.customScheduleObject.currentEvent.end ?
        moment(this.customScheduleObject.currentEvent.end).utcOffset(this.timeZone, true).toDate() :
        this.inputModels.time.end;
    }

    // Make the date like the original date of a repeat every day event
    if (this.inputModels.repeatEveryDay) {
      // Catch the similar repeat every day events
      const dates: string[] = [];

      this.customScheduleObject.updatedEvents.forEach((event) => {
        // Fetch the date of the original event
        if (event.id === this.customScheduleObject.currentEvent.id && !event.repeatEveryDayCopy) {
          dates.push(event.start.slice(0, 10));
        }
      });

      this.inputModels.date = moment(dates[0]).toDate();
    }

    switch (this.customScheduleObject.currentEvent.category) {
      case EnumEventCategory.refeicao: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.refeicao];
        break;
      }
      case EnumEventCategory.higiene: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.higiene];
        break;
      }
      case EnumEventCategory.exames: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.exames];
        break;
      }
      case EnumEventCategory.curativo: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.curativo];
        break;
      }
      case EnumEventCategory.fisioterapia: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.fisioterapia];
        break;
      }
      case EnumEventCategory.fonoaudiologia: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.fonoaudiologia];
        break;
      }
      case EnumEventCategory.medicacao: {
        this.modalConfig.categoryEventStyle.selectedCategory = EnumEventCategory[EnumEventCategory.medicacao];
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

    // Filter the type appointments from a category and order the array
    this.customScheduleObject.appointmentTypesFiltered = [];
    setTimeout(() => {
      this.modalConfig.categoryEventStyle.selectedCategory = selectedCategory;
      this.customScheduleObject.appointmentTypesFiltered =
        _.orderBy(this.showAppointmentTypesOnSelect(selectedCategory), ['display'], ['asc']);

      // On edit modal fill the type input correctly
      if (this.modalConfig.action === 'edit') {
        this.inputModels.type = this.customScheduleObject.currentEvent.type;
      }

      // Fill with the first element if only one type is presented
      if (this.customScheduleObject.appointmentTypesFiltered.length === 1) {
        this.inputModels.type = this.customScheduleObject.appointmentTypesFiltered[0].code;
        console.log('TYPE', this.inputModels.type);
        if (!(this.modalConfig.action === 'edit')) {
          this.inputModels.title = this.customScheduleObject.appointmentTypesFiltered[0].display;
          this.inputModels.description = this.customScheduleObject.appointmentTypesFiltered[0].definition;
        }
      }
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
        }
      });
  }

  // Adjust the time inputs allowing only an interval of 30 minutes at minimum
  timeInputValidator() {
    if (!this.inputModels.time.start || !this.inputModels.time.end || !this.startTimeElement || !this.endTimeElement) {
      return;
    }

    const startDate: number = Date.parse(this.inputModels.time.start.toString());
    const finalDate: number = Date.parse(this.inputModels.time.end.toString());

    if (finalDate <= startDate) {
      this.timeError = true;

      this.renderer.addClass(this.startTimeElement.nativeElement, 'ng-touched');
      this.renderer.addClass(this.startTimeElement.nativeElement, 'ng-invalid');

      this.renderer.addClass(this.endTimeElement.nativeElement, 'ng-touched');
      this.renderer.addClass(this.endTimeElement.nativeElement, 'ng-invalid');
    } else {
      this.timeError = false;

      this.renderer.removeClass(this.startTimeElement.nativeElement, 'ng-touched');
      this.renderer.removeClass(this.startTimeElement.nativeElement, 'ng-invalid');

      this.renderer.removeClass(this.endTimeElement.nativeElement, 'ng-touched');
      this.renderer.removeClass(this.endTimeElement.nativeElement, 'ng-invalid');
    }

  }

  // Open the dialog with the clicked slot time
  onTimeClick(clickedSlot) {
    console.log(clickedSlot);
    const jsEvent = clickedSlot['jsEvent'];

    if (jsEvent['pageX'] === this.mouseCoordinates.posX && jsEvent['pageY'] === this.mouseCoordinates.posY) {
      clickedSlot['jsEvent'].stopPropagation();
      this.openDialog('add-edit', 'add');
      this.activateDragScroll(false);
      setTimeout(() => {
        setTimeout(() => {
          const startDate = moment(clickedSlot['date']).utcOffset(this.timeZone, true).toDate();
          this.inputModels.date = startDate;

          // Check if is an allday slot
          if (clickedSlot['date']['_ambigTime']) {
            this.inputModels.allDay = true;
          } else {
            this.inputModels.time.start = startDate;
            this.inputModels.time.end = moment(clickedSlot['date']).utcOffset(this.timeZone, true).add(30, 'm').toDate();
          }
        }, 20);
      });
    }
  }

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
      this.customScheduleObject.appointmentCategory.forEach((category, index) => {
        if (index === this.flkty.selectedIndex) {
          categoryCode = category.code;
        }
      });

      this.modalConfig.categoryEventStyle.selectedCategory = categoryCode;

      this.onAppointmentCategorySelected(categoryCode);
    });

    // Find index to select on carousel
    const newIndex: number = this.customScheduleObject.appointmentCategory
      .findIndex(category => category.code === this.modalConfig.categoryEventStyle.selectedCategory);

    this.goToSlide(newIndex, this.modalConfig.categoryEventStyle.selectedCategory);

    const wrapperElement = document.querySelector('.flickity-viewport');

    this.renderer.setStyle(wrapperElement, 'padding-top', '20px');
  }

  goToSlide(index: number, category: AppointmentCategory) {
    this.modalConfig.categoryEventStyle.selectedCategory = category.code;
    this.flkty.select(index);
  }

  renderEvent(event, element, view) {
    element.attr('id', 'event-id-' + event.id);
  }
}
