import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { Trim } from 'app/shared/models/vehicle.model';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
import { TrimDataSelector, TrimDidFetchSelector, TrimMetaSelector } from 'app/store/vehicledata/vehicledata.selectors';
import * as deepEqual from 'deep-equal';
import { trimInitialState } from 'app/store/vehicledata/trim.states';
import * as actions from 'app/store/vehicledata/vehicledata.actions';
import * as commonModels from 'app/shared/models/common.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-trim-table',
  templateUrl: './trim-table.component.html',
  styleUrls: ['./trim-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})

export class TrimTableComponent implements OnInit, OnDestroy, AfterViewInit,OnChanges {
  // model
  @Input() trimColumnHeaders: Array<any>;
  @Input() trimParams: {brand: number, year: number,model:number,};
  private onDestroy$ = new Subject<void>();
  
  trimColumnsToDisplay = [];
  trimColumnsToDisplayWithExpand = [];
  expandedElement: Trim | null;
  public trimRequestParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 20,
  };
  public progressBar:boolean = true;
  colorColumnHeaders: Array<{}> = [
    {key: 'VehicleColorsMedia', label: 'Image', visible: true},
    {key: 'color_hex_code', label: 'Color', visible: true},
    {key: 'color', label: 'Color Name', visible: true},
    {key: 'simple_color', label: 'Name', visible: true},
  ];
 

  isColorColumnAvailable: boolean = false;
  selectedRecordDetail: any;

  public trimMeta$: Observable<any>;
  public trimList$: Observable<any>;
  public trimDidFetch$: Observable<any>;
  public trimList: Array<Trim> = [];
  public meta: commonModels.Meta = trimInitialState.meta;


  public trimId: number = null;

  constructor(
    public service$: VehicleDataService,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private store$: Store<AppState>,
    private snack$: MatSnackBar,
  ) {
    // model
    this.trimList$ = this.store$.select(TrimDataSelector);
    this.trimMeta$ = this.store$.select(TrimMetaSelector);
    this.trimDidFetch$ = this.store$.select(TrimDidFetchSelector);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.trimParams && this.trimColumnHeaders){
      this.trims();
    }
  }

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.trimColumnsToDisplayWithExpand = [...this.trimColumnsToDisplay, 'expand'];
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.store$.dispatch(new actions.ClearTrimDetail());
  }

  getDisplayedColumns() {
    let header = [...this.trimColumnHeaders];
    this.trimColumnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  ngOnInit(): void {

    this.trimList$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(trimList => {
          if (!deepEqual(this.trimList, trimList)) {
            if(trimList && trimList.length > 0) {
              if(trimList[0].model_id == this.trimParams.model) {
                this.trimList = trimList;
                this.progressBar = false;
              }
            } else {
              this.progressBar = false;
            }
          }
          this.refreshTrimTable();
        })
      )
      .subscribe();

      this.trimMeta$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brandMeta => {
          if (!deepEqual(this.meta, brandMeta)) {
            this.meta = brandMeta;
            this.refreshTrimTable();
          }
        })
      )
      .subscribe();

  }

  trims(){
    if(this.trimParams && this.trimColumnHeaders){
      this.trimRequestParam.year =  this.trimParams.year;
      this.trimRequestParam.brand =  this.trimParams.brand;
      this.trimRequestParam.model =  this.trimParams.model;
    }
  }

  refreshTrimTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getColor(element:Trim | null){
    if(this.expandedElement==null || this.expandedElement != element){
      this.isColorColumnAvailable = true;
      // // Assign current model Id
      this.trimId = element.id;
    }
    this.expandedElement = this.expandedElement === element ? null : element
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  onTrimEdit(data:any){ 
    const payload = {
      id:data.id,
      name:data.trim,
      file_url:data.image_url_640,
      from:'trim'
    };
    const title = 'Edit Trim';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      EditModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title,payload:payload },
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if(!result){
        // If user press cancel
        return;
      }
    });
  }

  changetrimStatus($event:any,id:number){
    const payload = {
      id: id,
      is_enable: $event ? 1 : 0,
    };
    this.service$.updateTrimStatus(payload.id,payload).subscribe(({data}) => {
      this.trimList = this.trimList.map(el => {
        return el = el.id === data.id ? data : el;
      })
      this.refreshTrimTable();
      const statusType = data?.is_enable === 0 ? ' disable' : ' enable';
      let msg = data.trim+" is "+ statusType +" successfully"
      this.snack$.open(msg, 'OK', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
    })
  }

}
