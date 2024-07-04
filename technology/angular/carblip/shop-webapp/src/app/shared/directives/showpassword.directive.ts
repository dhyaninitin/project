import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appShowPassword]',
})
export class ShowpasswordDirective {
  private _shown = false;
  private wrapper: Element;

  constructor(private el: ElementRef) {
    setTimeout(() => {
      this.setup();
    });
  }

  toggle(toggleItem: Element) {
    this._shown = !this._shown;

    const inputElement = this.el.nativeElement;
    const eyeSpan = this.wrapper.querySelector('.input-group-text');

    if (this._shown) {
      inputElement.setAttribute('type', 'text');
      eyeSpan.innerHTML = '<i class="fa fa-eye-slash"></i>';
    } else {
      inputElement.setAttribute('type', 'password');
      eyeSpan.innerHTML = '<i class="fa fa-eye"></i>';
    }
  }

  setup() {
    const element = this.el.nativeElement;
    const wrapper = this.replaceChild(element, 'input-group appshowpassword');
    this.wrapper = wrapper;
    let toggleItem = wrapper.querySelector('.input-group-append');
    if (!toggleItem) {
      toggleItem = document.createElement('div');
      toggleItem.className = 'input-group-append';
      toggleItem.innerHTML =
        '<span class="input-group-text"><i class="fa fa-eye"></i></span>';
    }
    toggleItem.addEventListener('click', event => {
      this.toggle(toggleItem);
    });
    wrapper.appendChild(toggleItem);
  }

  replaceChild(element, className) {
    // `element` is the element you want to wrap
    const parent = element.parentNode;
    const wrapper = document.createElement('div');
    wrapper.className = className;

    // set the wrapper as child (instead of the element)
    parent.replaceChild(wrapper, element);
    // set element as child of wrapper
    wrapper.appendChild(element);
    return wrapper;
  }
}
