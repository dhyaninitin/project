import { Directive, HostListener, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Directive({
  selector: '[focusInvalidInput]'
})
export class FormDirective {
  constructor(private el: ElementRef) {}

  @HostListener('submit')
  onFormSubmit() {
    const invalidControl = this.el.nativeElement.querySelector('.ng-invalid');
    console.log("I am here for focus",invalidControl);
    if (invalidControl) {
      invalidControl.focus();
    }
  }
}
