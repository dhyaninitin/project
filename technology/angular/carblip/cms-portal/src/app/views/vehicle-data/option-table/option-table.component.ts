import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-option-table',
  templateUrl: './option-table.component.html',
  styleUrls: ['./option-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})
export class OptionTableComponent implements OnInit,AfterViewInit,OnChanges {
  @Input() optionColumnHeaders: Array<any>;
  @Input() optionList: any;
  private onDestroy$ = new Subject<void>();

  optionColumnsToDisplay = [];
  optionColumnsToDisplayWithExpand = [];
  expandedElement: null;
  public optionLists: Array<any> = [];


  constructor(public _cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.optionColumnsToDisplayWithExpand = [...this.optionColumnsToDisplay];
    this.optionLists = this.optionList;
    this._cdr.detectChanges();
    console.log('optionLists',this.optionLists);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getDisplayedColumns() {
    let header = [...this.optionColumnHeaders];
    this.optionColumnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  ngOnInit(): void {
    
  }
  

  getOptions(){

  }

  shortText(description: string) {
    if(description && description.length > 50) {
      return description.substring(0, 50) + "...";
    }
    return description;
  }
}
