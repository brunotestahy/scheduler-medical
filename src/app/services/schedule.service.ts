import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ScheduleService {

  // Observable string sources
  private dateChangeSource = new Subject<Date>();
  private dateRequestFromRulesCalendarSource = new Subject<any>();
  private copyEventsFromYesterdaySource = new Subject<any>();
  private addStandardEventsSource = new Subject<{ standardCategory: string, state: boolean }>();
  private addNewEventSource = new Subject<any>();
  private disableStandardCheckboxSource = new Subject<boolean>();
  private checkStandardCheckboxSource = new Subject<{ checkBoxType: string, state: boolean }>();
  private generalErrorSource = new Subject<boolean>();

  constructor() {}

  // Observable string streams
  handleDateChange$ = this.dateChangeSource.asObservable();
  handleDateRequestFromRulesCalendar$ = this.dateRequestFromRulesCalendarSource.asObservable();
  handleCopyEventsFromYesterday$ = this.copyEventsFromYesterdaySource.asObservable();
  handleAddStandardEvents$ = this.addStandardEventsSource.asObservable();
  handleAddNewEvent$ = this.addNewEventSource.asObservable();
  handleDisableStandardCheckbox$ = this.disableStandardCheckboxSource.asObservable();
  handleCheckStandardCheckbox$ = this.checkStandardCheckboxSource.asObservable();
  handleGeneralError$ = this.generalErrorSource.asObservable();

  // Service message commands
  emitDateChange(newDate: Date) {
    this.dateChangeSource.next(newDate);
  }
  emitDateRequestFromRulesCalendar() {
    this.dateRequestFromRulesCalendarSource.next();
  }

  emitCopyEventsFromYesterday() {
    this.copyEventsFromYesterdaySource.next();
  }

  emitAddStandardEvents(category: string, state: boolean) {
    this.addStandardEventsSource.next({standardCategory: category, state});
  }

  emitAddNewEvent() {
    this.addNewEventSource.next();
  }

  emitDisableStandardCheckbox(state: boolean) {
    this.disableStandardCheckboxSource.next(state);
  }

  emitCheckStandardCheckbox(checkBoxType: string, state: boolean) {
    this.checkStandardCheckboxSource.next({checkBoxType, state});
  }

  emitGeneralError(isError: boolean) {
    this.generalErrorSource.next(isError);
  }

}
