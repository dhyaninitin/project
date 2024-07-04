import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Quote } from 'app/shared/models/quote.model';

@Component({
  selector: 'app-print-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements OnInit {
  private onDestroy$ = new Subject<void>();

  private quoteId: string;
  public isReady: Boolean = false;
  public quote: Quote;

  constructor(
    private service$: QuoteService,
    private route$: ActivatedRoute,
    private router$: Router,
    private loader$: AppLoaderService,
  ) {}

  ngOnInit() {
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      if (params.get('id')) {
        this.quoteId = params.get('id');
        this.initData();
      } else {
        this.router$.navigate(['/sessions/404']);
      }
    });
  }

  initData() {
    this.isReady = false;
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(this.service$.getById(this.quoteId))
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result]) => {
        this.quote = result.data
        this.loader$.close();
        this.isReady = true;
      });
  }
}
