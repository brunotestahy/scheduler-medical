import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';

export class CustomDateFormatter extends CalendarDateFormatter {
  public monthViewColumnHeader({date, locale}: DateFormatterParams): string {
    const day: string = new Intl.DateTimeFormat(locale, {
      weekday: 'long'
    }).format(date);

    return day.substr(0, 1).toUpperCase();
  }

  public monthViewTitle({date, locale}: DateFormatterParams): string {
    const month: string = new Intl.DateTimeFormat(locale, {
      month: 'long'
    }).format(date);

    const year: string = new Intl.DateTimeFormat(locale, {
      year: 'numeric'
    }).format(date);

    return month.toUpperCase() + ' ' + year;
  }

  public monthViewDayNumber({date, locale}: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit'
    }).format(date);
  }
}
