import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
// import * as hl from 'highlight.js';
import hl from 'highlight.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appEgretHighlight]',
})
export class EgretHighlightDirective implements OnInit, OnChanges, OnDestroy {
  // Inner highlighted html
  highlightedCode: string;

  @Input() path: string;
  @Input('egretHighlight') code: string;
  private unsubscribeAll: Subject<any>;
  @Input() languages: string[];

  @HostBinding('class.hljs') get getColor() {
    return true;
  }

  @HostBinding('innerHTML') get getInnerHtml() {
    return this.highlightedCode;
  }

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private _zone: NgZone,
    private http: HttpClient
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    if (this.code) {
      this.highlightElement(this.code);
    }
    if (this.path) {
      this.highlightedCode = 'Loading...';
      this.http
        .get(this.path, { responseType: 'text' })
        .pipe(takeUntil(this.unsubscribeAll))
        .subscribe(response => {
          this.highlightElement(response, this.languages);
        });
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(null);
    this.unsubscribeAll.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['code'] &&
      changes['code'].currentValue &&
      changes['code'].currentValue !== changes['code'].previousValue
    ) {
      this.highlightElement(this.code);
      // console.log('hljs on change', changes)
    }
  }

  highlightElement(code: string, languages?: string[]) {
    this._zone.runOutsideAngular(() => {
      const res = hl.highlightAuto(code);
      this.highlightedCode = res.value;
      // this.cdr.detectChanges();
      // console.log(languages)
    });
  }
}
