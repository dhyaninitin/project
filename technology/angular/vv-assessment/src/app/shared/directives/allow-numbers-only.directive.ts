import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]' // Selector to apply the directive
})
export class NumericInputDirective {

  constructor() { }

  // Listen to keydown event to restrict input to numeric characters
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow special keys like backspace, delete, arrow keys, etc.
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
      (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
      (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
      (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
      // Allow: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39)) {
      // Let it happen, don't do anything
      return;
    }

    // Ensure that it is a number and stop the keypress if not
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
      (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

}
