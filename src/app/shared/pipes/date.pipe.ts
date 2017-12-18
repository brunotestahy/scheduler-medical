import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datePipe',
  pure: false
})

export class DatePipe implements PipeTransform {
  transform(items: any[], filter: Date): any {
      if (!items || !filter) {
          return items;
      }
      // filter items array, items which match and return true will be kept, false will be filtered out

      return items.filter(item => {
          return this.isSameDate(new Date(item.scheduledPeriod.startDate.dateTime), new Date(filter));
      });
  }

  isSameDate(date1: Date, date2: Date) {
      return (date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear());
  }
}


