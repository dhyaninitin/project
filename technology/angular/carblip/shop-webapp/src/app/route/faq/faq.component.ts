import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { FAQ } from 'app/core/constant';
import { IStore } from 'app/shared/interfaces/store.interface';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  animations: [
    trigger('collapse', [
      state(
        'open',
        style({
          opacity: '1',
          display: 'block',
          transform: 'translate3d(0, 0, 0)',
        })
      ),
      state(
        'closed',
        style({
          opacity: '0',
          display: 'none',
          transform: 'translate3d(0, -100%, 0)',
        })
      ),
      transition('closed => open', animate('200ms ease-in')),
      transition('open => closed', animate('100ms ease-out')),
    ]),
  ],
})
export class FaqComponent implements OnInit {
  public faqs = [];
  private pageTitle = 'FAQs';
  public faqOpened = [];

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.initSubHeader();
    this.faqs = FAQ ? FAQ : [];
    this.faqOpened = this.faqs.map(item => {
      return 'closed';
    });
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(false));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  onItemClick(index) {
    this.faqOpened[index] =
      this.faqOpened[index] === 'open' ? 'closed' : 'open';
  }
}
