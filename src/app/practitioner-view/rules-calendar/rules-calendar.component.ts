import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { RulesCalendarService } from '../../services/rules-calendar.service';
import { CalendarDateFormatter } from 'angular-calendar';
import { CustomDateFormatter } from '../../services/custom-date-formatter.service';

import { Router } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { Subscription } from 'rxjs/Subscription';

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
export class RulesCalendarComponent implements OnInit, OnDestroy {

  @Output() date: EventEmitter<Date> = new EventEmitter<Date>();
  @Input() startDateRoute: number;
  @Input() activitiesInput: any[]; // dtoList[0]

  rulesCalendar;

  viewDate: Date;
  view = 'month';
  showFullCalendar = false;

  plan: any;
  dateShift = false;

  // Subscriptions
  requestDateSubscription: Subscription;

  constructor(private rulesCalendarService: RulesCalendarService,
              private router: Router,
              private schedulerService: ScheduleService) {
  }

  ngOnInit() {
    // para iniciar o caledario com o shift da rota para a data inicial
    this.viewDate = new Date();
    this.loadPlan(this.dateShift, this.viewDate);

    this.loadGeneralListeners();
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  loadGeneralListeners() {
    // Pass the current date to the scheduler component
    this.requestDateSubscription = this.schedulerService.handleDateRequestFromRulesCalendar$
      .subscribe(() => {
        this.schedulerService.emitDateChange(this.viewDate);
      });
  }

  unloadGeneralListeners() {
    this.requestDateSubscription.unsubscribe();
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
    this.dateShift = !this.isSameDate(this.viewDate, new Date());
    this.loadPlan(this.dateShift, this.viewDate);
    this.date.emit(this.viewDate);
  }

  datedown() {
    this.viewDate = new Date(this.viewDate.getTime() - 24 * 60 * 60 * 1000);
    this.dateShift = !this.isSameDate(this.viewDate, new Date());
    this.loadPlan(this.dateShift, this.viewDate);
    this.date.emit(this.viewDate);
  }
}
