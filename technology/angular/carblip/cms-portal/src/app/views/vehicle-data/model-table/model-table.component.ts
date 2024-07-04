import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { Model } from 'app/shared/models/vehicle.model';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as deepEqual from 'deep-equal';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
import { ModelDataSelector, ModelDidFetchSelector, TrimDidFetchSelector, TrimFetchingSelector, TrimMetaSelector, modelMetaSelector } from 'app/store/vehicledata/vehicledata.selectors';
import { modelInitialState } from 'app/store/vehicledata/model.states';
import * as commonModels from 'app/shared/models/common.model';
import * as vehicleData from 'app/shared/models/vehicledata.model';
import { trimInitialState } from 'app/store/vehicledata/trim.states';
import * as actions from 'app/store/vehicledata/vehicledata.actions';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-model-table',
  templateUrl: './model-table.component.html',
  styleUrls: ['./model-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})
export class ModelTableComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  // model
  @Input() modelColumnHeaders: Array<any>;
  @Input() modelsParams: {brand: number, year: number,model:number};
  

  modelColumnsToDisplay = [];
  modelColumnsToDisplayWithExpand = [];
  expandedElement: Model | null;
  private onDestroy$ = new Subject<void>();

  public modelMeta$: Observable<any>;
  public modelList$: Observable<any>;
  public modelList: Array<Model> = [];
  selectedRecordDetail: any;
  public meta: commonModels.Meta = modelInitialState.meta;
  
  public ModelRequestParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 20,
  };
  
  // trim
  isTrimColumnAvailable: boolean = false;
  public modelId: number = null;
  public progressBar: boolean = true;
  trimColumnHeaders: Array<{}> = [
    {key: 'image_url', label: 'Image', visible: true},
    {key: 'trim', label: 'Trim', visible: true},
    {key: 'price', label: 'Price', visible: true},
    {key: 'created_at', label: 'Created At', visible: true},
    {key: 'updated_at', label: 'Updated At', visible: true},
    {key: 'actions', label: 'Actions', visible: true},
  ];

  public modelDidFetch$: Observable<any>;

  // trim
  public trimMeta$: Observable<any>;
  public trimDidFetch$: Observable<any>;
  public trimFetching$: Observable<any>;
  public trimMeta: commonModels.Meta = trimInitialState.meta;
  public trimFilter: vehicleData.TrimFilter = trimInitialState.filter;

  constructor(
    public service$: VehicleDataService,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private store$: Store<AppState>,
    private snack$: MatSnackBar,
  ) { 
    // model
    this.modelList$ = this.store$.select(ModelDataSelector);
    this.modelMeta$ = this.store$.select(modelMetaSelector);
    this.modelDidFetch$ = this.store$.select(ModelDidFetchSelector);

    // trim
    this.trimMeta$ = this.store$.select(TrimMetaSelector);
    this.trimDidFetch$ = this.store$.select(TrimDidFetchSelector);
    this.trimFetching$ = this.store$.select(TrimFetchingSelector);
  }

  
  ngOnInit(): void {
    console.log(this.modelsParams)
    this.modelList$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(modelList => {
          if (!deepEqual(this.modelList, modelList)) {
            if(modelList && modelList.length > 0) {
              if(modelList[0].brand_id == this.modelsParams.brand) {
                this.modelList = modelList;
                this.progressBar = false;
              }
            } else {
              this.progressBar = false;
            }
          } 
          this.refreshTable();
        })
      )
      .subscribe();

      this.modelMeta$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brandMeta => {
          if (!deepEqual(this.meta, brandMeta)) {
            this.meta = brandMeta;
            this.refreshTable();
          }
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.modelsParams && this.modelColumnHeaders){
      this.models();
    }
  }
  

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.modelColumnsToDisplayWithExpand = [...this.modelColumnsToDisplay, 'expand'];
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.store$.dispatch(new actions.ClearModelDetail());
  }

  getDisplayedColumns() {
    let header = [...this.modelColumnHeaders];
    this.modelColumnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  // call models Store
  loadModels(){
    this.trimMeta$
    .pipe(
      takeUntil(this.onDestroy$),
      tap(trimMeta => {
        if (!deepEqual(this.trimMeta, trimMeta)) {
          this.trimMeta = trimMeta;
        }
      })
    )
    .subscribe();
    
    this.trimDidFetch$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      // tap(trimDidFetch => !trimDidFetch)
      tap(trimDidFetch => !trimDidFetch && this.loadData())
    )
    .subscribe(); 
  }

  loadData() {
    // Clone filter values
    this.trimFilter = {...this.trimFilter};

    //check base on previous select item
    {
      this.trimFilter.brand = this.modelsParams.brand;
      this.trimFilter.year = this.modelsParams.year
      this.trimFilter.model = this.modelId;
    }
    this.store$.dispatch(new actions.GetTrim(this.trimFilter));
  }

  models(){
    if(this.modelsParams && this.modelColumnHeaders){
      this.ModelRequestParam.year =  this.modelsParams.year;
      this.ModelRequestParam.brand =  this.modelsParams.brand;
    }
  }

  getTrim(element:Model | null){
    if(this.expandedElement==null || this.expandedElement != element){
      this.isTrimColumnAvailable = true;
      this.modelsParams.model = element.id;
      // Assign current model Id
      this.modelId = this.modelsParams.model;
      this.loadModels();
    }
    this.expandedElement = this.expandedElement === element ? null : element
  }

  refreshModelTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  onModelEdit(data:any){ 
    const payload = {
      id:data.id,
      name:data.name,
      file_url:data.image_url_640,
      from:'model'
    };
    const title = 'Edit Model';
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

  changeModelStatus($event:any,id:number){
    const payload = {
      id: id,
      is_enable: $event ? 1 : 0,
    };
    this.service$.updateModelStatus(payload.id,payload).subscribe(({data}) => {
      this.modelList = this.modelList.map(el => {
        return el = el.id === data.id ? data : el;
      })
      this.refreshModelTable();
      const statusType = data?.is_enable === 0 ? ' disable' : ' enable';
      let msg = data.name+" is "+ statusType +" successfully"
      this.snack$.open(msg, 'OK', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });

    })
  }

}
