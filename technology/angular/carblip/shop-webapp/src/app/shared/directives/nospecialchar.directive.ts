import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoSepcialchar]',
})
export class NoSpecialCharDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return /^[0-9a-zA-Z\s]+$/.test(event.key);
  }

  @HostListener('keyup', ['$event']) onKeyUp(event) {
    if (this.el.nativeElement.value === ' ') {
      this.el.nativeElement.value = '';
    }
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  @HostListener('focusout', ['$event']) onFocusout(event) {
    this.el.nativeElement.value = this.el.nativeElement.value.trim();
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value.trim();
      event.preventDefault();
    }, 100);
  }
}
