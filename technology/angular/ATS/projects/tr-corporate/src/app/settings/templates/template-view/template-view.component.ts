import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { inOutAnimation, fadeinAnimation } from '../../../animations';

@Component({
  selector: 'app-template-view',
  templateUrl: './template-view.component.html',
  styleUrls: ['./template-view.component.scss', '../../shared/styles/form.scss'],
  animations: [inOutAnimation, fadeinAnimation]
})
export class TemplateViewComponent implements OnInit {

  @Input() type: string = '';
  @Input() show: boolean = false
  @Input() data: any = {}
  @Output() hide: EventEmitter<any> = new EventEmitter()
  @Output() edit: EventEmitter<any> = new EventEmitter()

  constructor() {}

  ngOnInit(): void {
    console.log('data', this.data)
  }

  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  public getControlOptionIcon(inputType: string) {
    switch (inputType) {
      case 'radio':
        return 'icon-mc mc-radio_button_checked';
      case 'checkbox':
        return 'icon-mcf mcf-check_circle';
      case 'url':
        return 'icon-mc mc-link-2';
      case 'date':
        return 'icon-mc mc-date_range';
      case 'time':
        return 'icon-mc mc-more_time';
      case 'date-time':
        return 'icon-mc mc-today';
      default:
        return '';
    }
  }

  public expandCollapseRules (event: any) {
    const targetElement = event.target;
    const levelRulesElement = targetElement.parentElement.parentElement.parentElement.nextSibling
    if( levelRulesElement.classList.contains('open') ) {
      targetElement.classList.remove('open');
      levelRulesElement.classList.remove('open');
    } else {
      targetElement.classList.add('open');
      levelRulesElement.classList.add('open');
    }
  }

  public onEnterStarElement (event: any) {
    if (!event.target.classList.contains('checked-star')) {
      event.target.classList.remove('mc-star_border');
      event.target.classList.add('mc-star-2');
    }
  }

  public onLeaveStarElement (event: any) {
    if (!event.target.classList.contains('checked-star')) {
      event.target.classList.remove('mc-star-2');
      event.target.classList.add('mc-star_border');
    }
  }

  public starClicked (event: any, index: number) {
    const parentWrapperElement = event.target.parentElement;
    for(let starElement of parentWrapperElement.children) {
      starElement.classList.remove('checked-star');
      starElement.classList.remove('mc-star-2');
      starElement.classList.add('mc-star_border');
    }
    for (let i = 0; i <= index; i++) {
      parentWrapperElement.children[i].classList.add('checked-star');
      parentWrapperElement.children[i].classList.add('mc-star-2');
      parentWrapperElement.children[i].classList.remove('mc-star_border');
    }
    console.log('startClicked called', parentWrapperElement);
  }
}
