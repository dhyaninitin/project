import { formatPercent } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customPercent',
})
export class CustomPercentPipe implements PipeTransform {
  transform(
    value: number,
    digitsInfo: string = '0.0-3',
    locale: string = 'en'
  ): string | null {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    const formatted = formatPercent(value, locale, digitsInfo);

    if (value > 0) {
      return (
        '<span class="text-green">' +
        formatted +
        '<span class="material-icons">arrow_drop_up</span></span>'
      );
    } else if (value < 0) {
      return (
        '<span class="text-red">' +
        formatted +
        '<span class="material-icons">arrow_drop_down</span></span>'
      );
    } else {
      return formatted;
    }
  }
}
