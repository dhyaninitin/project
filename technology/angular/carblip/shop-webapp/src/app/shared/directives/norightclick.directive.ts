import { Directive, HostListener } from '@angular/core';
import { environment as env } from 'environments/environment';

@Directive({
  selector: '[appNoRightClick]',
})

/**
 * Directive to disable right click on app
 * @param
 * @return
 **/
export class NoRightClickDirective {
  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    if (env.production) {
      event.preventDefault();
    }
  }

  constructor() {}
}
