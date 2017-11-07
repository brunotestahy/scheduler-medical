import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPipe',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(value: any, filterString: string, props: Array<string>): any {
    if (value.length === 0 || filterString === '') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      for (const prop of props) {
        if (item[prop].toUpperCase().includes(filterString.toUpperCase())) {
          resultArray.push(item);
        }
      }
    }
    return resultArray;
  }

}
