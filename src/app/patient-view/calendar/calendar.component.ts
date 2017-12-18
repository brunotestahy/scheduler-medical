import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/Rx';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {

  viewDate: Date;
  view: string = 'month';
  clockTime: Date;
  clockSubscription: Subscription;

  constructor(private renderer: Renderer2,
              private scheduleService: ScheduleService,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    // Initialize Date variables
    this.viewDate = new Date();
    this.clockTime = new Date();

    this.startClock();
  }

  ngOnDestroy() {
    // Stop the clock
    this.clockSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.setUpCalendar();
  }

  setUpCalendar(onlyMonthChange: boolean = false) {
    console.log(this.viewDate);
    // Wait the calendar rendering to apply the changes
    this.changeDetector.detectChanges();
    this.fixWeekDaysName();
    this.loadDayListeners();
    if (onlyMonthChange) {
      this.turnDateActive();
    }
  }

  fixWeekDaysName() {
    const weekNamesCells = document.querySelectorAll('.cal-header .cal-cell');
    for (let i = 0; i < weekNamesCells.length; i++) {
      this.renderer.setProperty(weekNamesCells[i], 'innerHTML', weekNamesCells[i].innerHTML.trim().substring(0, 1).toUpperCase());
      this.renderer.setStyle(weekNamesCells[i], 'opacity', '1');
    }
  }

  loadDayListeners() {
    const dayCells = document.querySelectorAll('.cal-days .cal-cell:not(.cal-out-month) .cal-cell-top');
    const arrayLength = dayCells.length;
    for (let i = 0; i < arrayLength; i++) {
      this.renderer.listen(dayCells[i], 'click', () => {
        for (let j = 0; j < arrayLength; j++) {
          this.renderer.removeClass(dayCells[j], 'cal-day-active');
        }
        this.renderer.addClass(dayCells[i], 'cal-day-active');
      });
    }
  }

  turnDateActive() {
    this.scheduleService.emitDateChange(this.viewDate);

    // Scape if the active date is equal to the today's date
    if (this.viewDate.getDate() === new Date().getDate() && this.viewDate.getUTCMonth() === new Date().getUTCMonth()) {
      return;
    }
    const activeDate = this.viewDate.getDate();
    const dayCells = document.querySelectorAll('.cal-days .cal-cell:not(.cal-out-month) .cal-cell-top');
    this.renderer.addClass(dayCells[activeDate - 1], 'cal-day-active');
  }

  startClock() {
    this.clockSubscription = this.clockFeature().subscribe((time: Date) => {
      this.clockTime = time;
    });
  }

  clockFeature(): Observable<Date> {
    return Observable
      .interval(1000)
      .map(tick => new Date());
  }

  onDayClicked(event) {
    this.viewDate = event.day.date;
    this.scheduleService.emitDateChange(this.viewDate);
    this.setUpCalendar(true);
  }
}
