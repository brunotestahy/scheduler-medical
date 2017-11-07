import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { RulesCalendarService } from './rules-calendar.service';
import { CalendarEvent, CalendarDateFormatter } from 'angular-calendar';
import { CustomDateFormatter } from './custom-date-formatter.provider';

import { subDays, addDays } from 'date-fns';
import { Router } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-rules-calendar',
  templateUrl: './rules-calendar.component.html',
  styleUrls: ['./rules-calendar.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    RulesCalendarService
  ],
})
export class RulesCalendarComponent implements OnInit {

  @Output() date: EventEmitter<Date> = new EventEmitter<Date>();
  @Input() startDateRoute: number;
  @Input() activitiesInput: any[]; // dtoList[0]

  rulesCalendar;

  viewDate: Date;
  view = 'month';
  locale = 'pt';
  showFullCalendar = false;

  startDate: Date = subDays(new Date(), 6);
  endDate: Date = addDays(new Date(), 3);
  plan: any;
  dateShift = false;

  events: CalendarEvent[] = [
    {
      start: this.startDate,
      end: this.endDate,
      title: 'Tratamento',
      allDay: true,
      color: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
      },
    },
    {
      start: this.endDate,
      end: this.endDate,
      title: 'Previsão de alta',
      cssClass: 'event-release-medical',
      allDay: true,
      color: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
      },
    },
  ];

  constructor(private rulesCalendarService: RulesCalendarService,
              private router: Router,
              private schedulerService: ScheduleService) {
  }

  ngOnInit() {
    console.log('INICIO RULES-CALENDAR');

    // para iniciar o caledario com o shift da rota para a data inicial
    if ((this.router.url).indexOf('/createplan') !== -1) {
      this.viewDate = new Date(+this.startDateRoute);
      this.dateShift = !this.isSameDate(this.viewDate, new Date());
    } else {
      this.viewDate = new Date();
    }
    this.loadPlan(this.dateShift, this.viewDate);
  }

  getEventsClass(events) {
    let classes = '';

    if (events.length > 0) {
      for (const event of events) {
        if (event.cssClass) {
          classes += ' ' + event.cssClass;
        }
      }
    }
    return classes;
  }

  loadPlan(dateShift: boolean, viewDate: Date) {
    this.rulesCalendar = this.rulesCalendarService.getRulesCalendar(dateShift, viewDate);
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return (date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear());
  }

  changeDate(rc) {
    this.dateShift = !this.isSameDate(rc.date, new Date());
    this.viewDate = rc.date;
    this.loadPlan(this.dateShift, this.viewDate);
    this.date.emit(rc.date);
    this.schedulerService.emitDateChange(rc.date);
  }

  dateup() {
    this.viewDate = new Date(this.viewDate.getTime() + 24 * 60 * 60 * 1000);
    this.dateShift = this.isSameDate(this.viewDate, new Date());
    this.loadPlan(this.dateShift, this.viewDate);
    this.date.emit(this.viewDate);
  }

  datedown() {
    this.viewDate = new Date(this.viewDate.getTime() - 24 * 60 * 60 * 1000);
    this.dateShift = this.isSameDate(this.viewDate, new Date());
    this.loadPlan(this.dateShift, this.viewDate);
    this.date.emit(this.viewDate);
  }
}
