import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(
    value: number,
    currencyCode: string = 'USD',
    display: 'code' | 'symbol' | 'symbol-narrow' | string | boolean = 'symbol',
    digitsInfo: string = '0.2-2',
    locale: string = 'en'
  ): string | null {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }

    const formatted = formatCurrency(
      value,
      locale,
      getCurrencySymbol(currencyCode, 'wide'),
      currencyCode,
      digitsInfo
    );

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
