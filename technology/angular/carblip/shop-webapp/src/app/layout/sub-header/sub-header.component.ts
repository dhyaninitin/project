import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { STEPS_BLOCK_LIST } from 'app/core/constant';
import { IStore } from 'app/shared/interfaces/store.interface';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import { FetchSearchList } from 'app/shared/states/search/search.actions';
import { IRequestFecthList } from 'app/shared/states/search/search.interfaces';
import { getKeyword } from 'app/shared/states/search/search.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import {
  getCurrentStep,
  getSubHeaderTitle,
  showRightBlock,
} from 'app/shared/states/ui/ui.selectors';

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss'],
})
export class SubHeaderComponent implements OnInit, OnDestroy {
  public page$: Observable<string>;
  public subHeaderTitle$: Observable<string>;
  public showNextButton$: Observable<boolean>;
  public showPrevButton$: Observable<boolean>;
  public activeNextButton$: Observable<boolean>;
  public activePrevButton$: Observable<boolean>;
  public showCancelSearch$: Observable<boolean>;
  public showStepper$: Observable<boolean>;
  public showSearchBox$: Observable<boolean>;
  public currentStep$: Observable<string>;
  public lastStep$: Observable<string>;
  public nextLabel$: Observable<string>;
  public showRightBlock$: Observable<boolean>;
  public searchKeyword$: Observable<string>;
  public currentPage$: Observable<string>;

  private onDestroy$ = new Subject<void>();
  public steps = STEPS_BLOCK_LIST ? STEPS_BLOCK_LIST : [];
  public subHeaderTitle = '';
  public currentStep = '';
  public showNextButton = false;
  public showPrevButton = false;
  public activeNextButton = false;
  public activePrevButton = false;
  public showStepper = false;
  public showSearchBox = false;
  public showCancelSearch = false;
  public lastStep: string;
  public nextLabel: string;
  public showRightBlock: boolean;
  public keyDown = false;
  public timer: any;
  public searchString = null;
  public currentPage = null;

  constructor(
    private store$: Store<IStore>,
    private authService: AuthServiceImpl,
    private router: Router
  ) {}

  ngOnInit() {
    this.showRightBlock$ = this.store$.select(showRightBlock);
    this.subHeaderTitle$ = this.store$.select(getSubHeaderTitle);
    this.currentPage$ = this.store$.select(getCurrentStep);

    this.showNextButton$ = this.store$.pipe(
      select(state => state.ui.showNextButton)
    );
    this.showPrevButton$ = this.store$.pipe(
      select(state => state.ui.showPrevButton)
    );
    this.activePrevButton$ = this.store$.pipe(
      select(state => state.ui.activePrevButton)
    );
    this.activeNextButton$ = this.store$.pipe(
      select(state => state.ui.activeNextButton)
    );
    this.nextLabel$ = this.store$.pipe(
      select(state => state.ui.nextButtonLabel)
    );
    this.showStepper$ = this.store$.pipe(select(state => state.ui.showStepper));
    this.showSearchBox$ = this.store$.pipe(
      select(state => state.ui.showSearchBox)
    );
    this.currentStep$ = this.store$.pipe(select(state => state.ui.currentPage));
    this.lastStep$ = this.store$.pipe(select(state => state.ui.lastStep));
    this.searchKeyword$ = this.store$.select(getKeyword);

    this.showRightBlock$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => (this.showRightBlock = data))
      )
      .subscribe();
    this.subHeaderTitle$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(subHeaderTitle => (this.subHeaderTitle = subHeaderTitle))
      )
      .subscribe();
    this.currentStep$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(currentStep => (this.currentStep = currentStep))
      )
      .subscribe();
    this.lastStep$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(lastStep => (this.lastStep = lastStep))
      )
      .subscribe();
    this.showCancelSearch$ = this.store$.pipe(
      select(state => state.ui.showCancelSearch)
    );
    this.showNextButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showNextButton => (this.showNextButton = showNextButton))
      )
      .subscribe();
    this.showPrevButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showPrevButton => (this.showPrevButton = showPrevButton))
      )
      .subscribe();
    this.activeNextButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(activeNextButton => (this.activeNextButton = activeNextButton))
      )
      .subscribe();
    this.activePrevButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(activePrevButton => (this.activePrevButton = activePrevButton))
      )
      .subscribe();
    this.showStepper$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showStepper => (this.showStepper = showStepper))
      )
      .subscribe();
    this.showSearchBox$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showSearchBox => (this.showSearchBox = showSearchBox))
      )
      .subscribe();

    this.showCancelSearch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showCancelSearch => (this.showCancelSearch = showCancelSearch))
      )
      .subscribe();
    this.nextLabel$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(nextLabel => (this.nextLabel = nextLabel))
      )
      .subscribe();

    this.searchKeyword$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(keyword => (this.searchString = keyword))
      )
      .subscribe();

    this.currentPage$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(currentPage => (this.currentPage = currentPage))
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  isLoggedIn() {
    return this.authService.getToken();
  }

  onNextButtonClick() {
    this.store$.dispatch(
      new UiActions.NavigateButtonClick({
        type: 'next',
        click: true,
      })
    );
  }

  onPrevButtonClick() {
    this.store$.dispatch(
      new UiActions.NavigateButtonClick({
        type: 'previous',
        click: true,
      })
    );
  }

  /**
   * Check if current step's completed step
   * @param step string - selected step
   * @param currentStep string - current step
   * @return boolean
   **/

  completed(step: string, currentStep: string) {
    if (!currentStep) {
      return false;
    }
    const _currentStep = this.steps.find(_step => _step.step === currentStep);
    if (!_currentStep) {
      return false;
    }
    const currentStepId = _currentStep.id;
    const completedSteps = this.steps.filter(_step => _step.id < currentStepId);
    return completedSteps.find(_step => _step.step === step) ? true : false;
  }

  /**
   * Redirect to selected step
   * @param step string - selected step
   * @return
   **/

  redirectTo(step) {
    // ignore if current step is selected step
    if (step !== this.currentPage) {
      // get current step id
      const currentStepId = this.steps.find(
        _step => _step.step === this.currentStep
      ).id;
      // get list of completed steps
      const completedSteps = this.steps.filter(
        _step => _step.id <= currentStepId
      );
      if (completedSteps.find(_step => _step.step === step)) {
        this.router.navigate(['find-my-car/' + step]);
      }
    }
  }

  onKeyUp() {
    this.keyDown = false;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const payload: IRequestFecthList = {
        keyword: this.searchString,
        page: 1,
        count: 60,
      };
      this.store$.dispatch(new FetchSearchList(payload));
    }, 800);
  }

  search() {
    this.router.navigate(['find-my-car/search']);
  }

  cancelSearch() {
    this.store$.dispatch(new UiActions.SetSearchOpened(false));
    this.router.navigate(['find-my-car']);
  }
}
