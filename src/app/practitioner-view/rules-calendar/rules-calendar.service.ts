import { Injectable } from '@angular/core';
import { RulesCalendar } from './rules-calendar';

const rulesCalendar: RulesCalendar[] = [
  // retirar após uma revisão e refactoring do código.
/*   { id: 1, type: 'before', plan: 'with-plan', day: '28', month: 'jun', percent: 100 },
  { id: 2, type: 'before', plan: 'with-plan', day: '29', month: 'jun', percent: 75 },
  { id: 3, type: 'before', plan: 'with-plan', day: '30', month: 'jun', percent: 30 },
  { id: 4, type: 'before', plan: 'with-plan', day: '1', month: 'jul', percent: 15 },
  { id: 5, type: 'before', plan: 'with-plan', day: '2', month: 'jul', percent: 78 },
  { id: 6, type: 'today', plan: 'with-plan', day: '3', month: 'jul', percent: 0 },
  { id: 7, type: 'after', plan: 'with-plan', day: '4', month: 'jul', percent: 0 },
  { id: 8, type: 'after', plan: 'with-plan', day: '5', month: 'jul', percent: 0 },
  { id: 9, type: 'after', plan: 'with-plan', day: '6', month: 'jul', percent: 0 },
  { id: 10, type: 'release-medical', plan: 'with-plan', day: '7', month: 'jul', percent: 0 },
  { id: 11, type: 'after', plan: 'without-plan', day: '8', month: 'jul', percent: 0 },
 */];

const RANGE_DAYS = 4;

@Injectable()
export class RulesCalendarService {
  today = new Date();
  myPatient: any;

  getRulesCalendar(dateShift: boolean, viewDate: Date) {

    while (rulesCalendar.length > 0) {
      rulesCalendar.pop();
    }

    for (let i = 0; i < RANGE_DAYS * 2 + 1; i++) {
      rulesCalendar.push(this.getCalendarTask(i, viewDate, dateShift));
    }
    return rulesCalendar;
  }

  getMonthStr(month: number): string {
    const months: string[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month].toUpperCase();
  }

  getCalendarTask(i: number, viewDate: Date, dateShift: boolean): RulesCalendar {
    const daysToAdd: number = i - RANGE_DAYS;
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const semana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    // aqui que seta o displacement

    const thisDate: Date = new Date(new Date(viewDate).getTime() + millisecondsPerDay * daysToAdd);


    const objRet: RulesCalendar = new RulesCalendar();
    const today: Date = new Date();
    let type: string;

    if (this.isSameDate(thisDate, today)) {
      type = 'today';
    } else if (thisDate < today) {
      type = 'before';
    } else {
      type = 'after';
    }

    // ajusta o foco
    if (dateShift && i === 4) {
      type = 'focus';
    }

    // muda o valor atual, faz-se isso para obter o estilo correto
    if (dateShift && this.isSameDate(thisDate, today) ) {
      type = 'todayShifted';
    }




    objRet.id = i + 1;
    objRet.type = type;
    objRet.plan = 'with-plan';
    objRet.totalTasks = 0;
    objRet.completedTasks = 0;
    objRet.date = thisDate;
    objRet.day = thisDate.getDate().toString();
    objRet.month = this.getMonthStr(thisDate.getMonth());
    objRet.percent = 0;
    objRet.alta = false;
    objRet.weekDay = semana[thisDate.getDay()];
    return objRet;
  }

  isSameDate(date1: Date, date2: Date) {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
  }

}
