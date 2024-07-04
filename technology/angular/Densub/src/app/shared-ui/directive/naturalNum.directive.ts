import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[natualNumbersOnly]'
})
export class NatualNumbersOnlyDirective {
    // Allow decimal numbers. The \. is only allowed once to occur

    private regex: RegExp = new RegExp(/^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/g);

    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home
    private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home' ];

    constructor(private el: ElementRef) {
    }

    @HostListener('keydown', [ '$event' ])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }

        // Do not use event.keycode this is deprecated.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        // console.log((this.el));
        let current: string = this.el.nativeElement.value;
        let cursorIndex =  this.el.nativeElement['selectionStart'];
        // console.log(cursorIndex,event.key,event);
        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        // let next: string = current.concat(event.key);

        // We first need to break all the  characters and then add the value with according to cursor position
        // And then merge the value
        let splitCurrentVal = current.split('');
        splitCurrentVal.splice(cursorIndex , 0 , event.key);
        if(splitCurrentVal.length > 0 && splitCurrentVal[0] === '0' ) {
          current = current.substr(1);
        }
        let next = splitCurrentVal.join('');
        if (next && !String(next).match(this.regex) || (cursorIndex === 0 &&  event.key === '0')) {
            event.preventDefault();
        }
        else {
          this.el.nativeElement.value = current;
        }
    }
}
