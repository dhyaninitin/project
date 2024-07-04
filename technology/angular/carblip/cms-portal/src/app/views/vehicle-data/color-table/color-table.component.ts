import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, Subject } from 'rxjs';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
@Component({
  selector: 'app-color-table',
  templateUrl: './color-table.component.html',
  styleUrls: ['./color-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})
export class ColorTableComponent implements OnInit, OnDestroy, AfterViewInit,OnChanges {
  @Input() colorColumnHeaders: Array<any>;
  @Input() trimId: any;
  private onDestroy$ = new Subject<void>();
  public progressBar: boolean = true;
  colorColumnsToDisplay = [];
  colorColumnsToDisplayWithExpand = [];
  expandedElement: null;
  public colorRequestParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 20,
  };

  optionColumnHeaders: Array<{}> = [
    {key: 'descriptions', label: 'Name', visible: true},
    {key: 'headerName', label: 'Type', visible: true},
    {key: 'msrp', label: 'MSRP', visible: true},
    {key: 'chromeOptionCode', label: 'Option Code', visible: true},
  ];
  
  isOptionColumnAvailable: boolean = false;
  selectedRecordDetail: any;
  public simpleColor: string = null;

  public colorList$: Observable<any>;
  public colorList: Array<any> = [];
  public optionList: any;


  constructor(
    public service$: VehicleDataService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.colorColumnsToDisplayWithExpand = [...this.colorColumnsToDisplay, 'expand'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.trimId && this.colorColumnHeaders){
      this.getColor();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getDisplayedColumns() {
    let header = [...this.colorColumnHeaders];
    this.colorColumnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  ngOnInit(): void {
  }

  getColor(){
    if(this.trimId && this.colorColumnHeaders){
      this.colorRequestParam.trimId =  this.trimId;
        this.service$.getColors(this.colorRequestParam).subscribe(response=> {
            if(response) {
              this.colorList = this.removeDuplicateColorCode(response.data.exterior_colors);
              this.progressBar = false;
              this.mergeOptionArrays(response.data.options.additional_equipment,response.data.options.wheel);
              this.refreshTrimTable();
            }
        });
    }
  }

  removeDuplicateColorCode(options:any[]): any[]{
    return options.filter((color, index, self) =>
      index === self.findIndex(c => c.color_hex_code === color.color_hex_code)
    );
  }

  refreshTrimTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getOptions(element:any | null){
    if(this.expandedElement==null || this.expandedElement != element){
      this.isOptionColumnAvailable = true;
      // // Assign current model Id
      this.simpleColor = element.simple_color;
    }
    this.expandedElement = this.expandedElement === element ? null : element
  }

  mergeOptionArrays(additionalEquipment: [], wheel:[]) {
    const additionalEquipmentArray = additionalEquipment.map((equipment: any) => {
      let description: string = this.getCombinedMultipleArrays(equipment.descriptions, 'description');
      equipment.descriptions = description;
      const payload = {
        headerId: equipment.headerId, 
        headerName: equipment.headerName, 
        descriptions: equipment.descriptions,
        msrp: equipment.msrp,
        chromeOptionCode: equipment.chromeOptionCode
      }
      return payload;
    })
    
    const wheelArray = wheel.map((wheels: any) => {
      let description: string = this.getCombinedMultipleArrays(wheels.descriptions, 'description');
      wheels.descriptions = description;
      const payload = {
        headerId: wheels.headerId, 
        headerName: wheels.headerName, 
        descriptions: wheels.descriptions,
        msrp: wheels.msrp,
        chromeOptionCode: wheels.chromeOptionCode
      }
      return payload;
    });

    this.optionList = [...additionalEquipmentArray, ...wheelArray];
    this.optionList.sort((a: any, b) => {
      return a.descriptions.localeCompare(b.descriptions);
    });
  }

  getCombinedMultipleArrays(items: [], key: string): string {
    let combinedDescription = '';
    for (const item of items) {
      combinedDescription += item[key] + ' ';
    }
    return combinedDescription.trim();
  }


  getColorCode(colorCode: string) {
    if(colorCode) {
      return "#"+colorCode;
    }
    return colorCode;
  }

  loadColorImage(item: any) {
    if(item.hasOwnProperty('VehicleColorsMedia')) {
      return item.VehicleColorsMedia[0]?.url_320;
    }
    return "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon-320.png";
  }

}
