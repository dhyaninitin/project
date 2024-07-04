import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Output, ViewChild,EventEmitter } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, Subject, debounceTime, takeUntil, tap } from 'rxjs';
import { Brand } from 'app/shared/models/vehicledata.model';
import * as commonModels from 'app/shared/models/common.model';
import { brandInitialState } from 'app/store/vehicledata/brand.states';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import * as actions from 'app/store/vehicledata/vehicledata.actions';
import { metaSelector,BrandDataSelector, modelMetaSelector, ModelDidFetchSelector, ModelFetchingSelector} from 'app/store/vehicledata/vehicledata.selectors';
import * as deepEqual from 'deep-equal';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import * as vehicleData from 'app/shared/models/vehicledata.model';
import { modelInitialState } from 'app/store/vehicledata/model.states';


@Component({
  selector: 'app-brand-table',
  templateUrl: './brand-table.component.html',
  styleUrls: ['./brand-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})
export class BrandTableComponent implements OnInit, OnDestroy, AfterViewInit {
  // Brand
  @Input() brandColumnHeaders: Array<any>;
  @Input() selectedYear: number;
  @Output() getYear = new EventEmitter<void>();
  private onDestroy$ = new Subject<void>();

  public brandMeta$: Observable<any>;
  public brandList$: Observable<any>;

  public brandList: any = [];

  brandColumnsToDisplay = [];
  brandColumnsToDisplayWithExpand = [];
  expandedElement: Brand | null;

  public meta: commonModels.Meta = brandInitialState.meta;
  
  // models
  public modelsParams: any = {};
  selectedRecordDetail: any;
  isModelColumnAvailable: boolean = false;


  public modelMeta$: Observable<any>;
  public modelDidFetch$: Observable<any>;
  public modelFetching$: Observable<any>;
  public modelMeta: commonModels.Meta = modelInitialState.meta;
  public modelFilter: vehicleData.ModelFilter = modelInitialState.filter;
  

  modelColumnHeaders: Array<{}> = [
    {key: 'image_url_640', label: 'Image', visible: true},
    {key: 'name', label: 'Model Name', visible: true},
    {key: 'msrp', label: 'MRP', visible: true},
    {key: 'created_at', label: 'Created At', visible: true},
    {key: 'updated_at', label: 'Updated At', visible: true},
    {key: 'actions', label: 'Actions', visible: true},
  ];

  public brandId: number = null;
  itemsPerPage: number = 10;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    public service$: VehicleDataService,
    private dialog: MatDialog,
  ) {
    // Brand
    this.brandList$ = this.store$.select(BrandDataSelector);
    this.brandMeta$ = this.store$.select(metaSelector);

    // models
    this.modelMeta$ = this.store$.select(modelMetaSelector);
    this.modelDidFetch$ = this.store$.select(ModelDidFetchSelector);
    this.modelFetching$ = this.store$.select(ModelFetchingSelector);
   }


  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.brandColumnsToDisplayWithExpand = [...this.brandColumnsToDisplay, 'expand'];
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }


  ngOnInit(): void {
    this.brandList$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(brandList => {
          if (!deepEqual(this.brandList, brandList)) {
            this.filterBrandsByYear(brandList);
            this.refreshTable();
          }
        })
      )
      .subscribe();
  }

  getDisplayedColumns() {
    let header = [...this.brandColumnHeaders];
    this.brandColumnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getModels(element:Brand | null){
    if(this.selectedYear && element.id){
      if(this.expandedElement==null || this.expandedElement != element){
        this.isModelColumnAvailable = true;
        this.modelsParams.year = this.selectedYear;
        this.modelsParams.brand = element.id;
        // Assign current brand Id
        this.brandId = this.modelsParams.brand;
        this.loadModels();
      }
      this.expandedElement = this.expandedElement === element ? null : element
    }
  }

  loadData() {
    // Clone filter values
    this.modelFilter = {...this.modelFilter};

    //check base on previous select item
    {
      this.modelFilter.brand = this.brandId;
      this.modelFilter.year = this.selectedYear;
    }
    this.store$.dispatch(new actions.GetModel(this.modelFilter));
  }

  // call models Store
  loadModels(){
    this.modelMeta$
    .pipe(
      takeUntil(this.onDestroy$),
      tap(modelMeta => {
        if (!deepEqual(this.modelMeta, modelMeta)) {
          this.modelMeta = modelMeta;
        }
      })
    )
    .subscribe();
    
    this.modelDidFetch$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(modelDidFetch => !modelDidFetch && this.loadData())
    )
    .subscribe(); 
  }

  changeBrandStatus($event:any,id:number){
    const payload = {
      id: id,
      is_active: $event ? 1 : 0,
      years:this.selectedYear
    };
    this.store$.dispatch(new actions.UpdateBrand(payload));
  }

  onBrandEdit(data:any){
    const payload = {
      id:data.id,
      name:data.name,
      file_url:data.image_url,
      from:'brand'
    };
    const title = 'Edit Brand';
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

  filterBrandsByYear(brands: Brand[]) {
    const list = brands.map((brand: Brand) => {
      let status = 1;
      if(brand?.years && brand?.years.includes(this.selectedYear)) {
        status = 0;
      }
      return {status, ...brand}
    });

    list.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    this.brandList = list;
  }

}

