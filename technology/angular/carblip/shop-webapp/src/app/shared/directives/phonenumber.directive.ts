import { Directive, ElementRef, HostListener } from '@angular/core';
import { liveFormatPhoneNumber } from 'app/shared/helpers/utils.helper';

@Directive({
  selector: '[appPhoneNumber]',
})
export class PhoneNumberDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keyup', ['$event']) onKeyUp(event) {
    this.formatFields(event);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  @HostListener('focusout', ['$event']) onFocusout(event) {
    this.el.nativeElement.value = this.el.nativeElement.value.trim();
  }

  @HostListener('change', ['$event']) onChange(event) {
    this.formatFields(event);
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value.trim();
      event.preventDefault();
    }, 100);
  }

  formatFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = liveFormatPhoneNumber(
        this.el.nativeElement.value
      );
      event.preventDefault();
    }, 100);
  }
}
