import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: any[], propertyName: string): any[] {
    if (!value || !value.length) return [];
    return value.sort((a, b) => a[propertyName].localeCompare(b[propertyName]));
  }

}
