import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoWhitespace]',
})
export class NoWhiteSpaceDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return !(event.key === ' ' && this.el.nativeElement.value.length === 0);
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
