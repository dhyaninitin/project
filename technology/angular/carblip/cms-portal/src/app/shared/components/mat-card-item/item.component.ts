import { Component, Input, OnInit } from '@angular/core';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'app-mat-card-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
  animations: egretAnimations,
})
export class MatCardItemComponent implements OnInit {
  @Input()
  title = 'Default';

  @Input()
  icon = 'fa-question-circle';

  @Input()
  count = 0;

  @Input()
  color = 'light';

  constructor() {}

  ngOnInit() {}
}
