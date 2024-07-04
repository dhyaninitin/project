import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger80ms } from '@vex/animations/stagger.animation';
import { ConfigService } from '@vex/config/config.service';
import { Observable, of } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PopoverService } from '@vex/components/popover/popover.service';
import { trackById } from '@vex/utils/track-by';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { Scrumboard, ScrumboardList}from 'app/shared/models/request.model';
import { textTruncate } from 'app/shared/helpers/utils';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-request-board-view',
  templateUrl: './request-board-view.component.html',
  styleUrls: ['./request-board-view.component.scss'],
  animations: [stagger80ms,fadeInUp400ms]
})
export class RequestBoardViewComponent implements OnInit {
  static nextId = 100;
  board$;
  public showProgress: boolean = true;
  @Input() filters: any = null;
  @Input() search: any = null;
  @Input() dealStage:string;

  addCardCtrl = new UntypedFormControl();
  addListCtrl = new UntypedFormControl();

  isVerticalLayout$: Observable<boolean> = this.configService.select(config => config.layout === 'vertical');
  trackById = trackById;
  public dealStagesOffset: number = 1;
  
  constructor(
    private readonly configService: ConfigService,
    private popover: PopoverService,
    private vehicleService$: VehicleService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(){
    this.showProgress = true;
    const payload = {
      pipeline:this.dealStage,
      page: this.dealStagesOffset,
      per_page: 20,
      deal_stage: null,
      filters: this.filters ?? "",
      search: this.search ?? ""
    }
    this.vehicleService$.getDealsForBoardView(payload).subscribe((response: any) => {
      if(response.data){
        this.board$ = of(response);
        this.showProgress = false;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  drop(event: CdkDragDrop<ScrumboardList[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      const foundElement = event.container.data[event.currentIndex];
      let pipelineArray;
      this.board$.subscribe((res) => {
        pipelineArray = res.data.find(pipeline => pipeline.id == event.container.id);
      });
      const payload: {deal_stage: string} = {
        deal_stage: pipelineArray.deal_stage
      };

      this.vehicleService$.updateDealStage(payload,foundElement.id).subscribe(response=> {
        if(response) {
          this.board$ = of(response);
          this.changeDetectorRefs.detectChanges();
        }
      });
    }
  }

  dropList(event: CdkDragDrop<ScrumboardList[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  getConnectedList(board: Scrumboard[]) {
    return board.map(x => `${x.id}`);
  }

  textTruncate(text: string) {
    return textTruncate(text, 15);
  }

  onScroll(event:any,dealStage:ScrumboardList[],index:number): void {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      const elementAtIndex = dealStage[index];
      this.dealStagesOffset = this.dealStagesOffset + 1
      if (this.dealStagesOffset > elementAtIndex['deals_meta']['last_page']) {
        return;
      }
      const payload = {
        pipeline:this.dealStage,
        page: this.dealStagesOffset,
        per_page: 20,
        deal_stage:elementAtIndex.deal_stage,
        filters: this.filters ?? "",
        search: this.search ?? ""
      }
    this.vehicleService$.getDealsForBoardView(payload).subscribe((response: any) => {
      if(response.data){
        elementAtIndex['deals'].push(...response.data[0].deals);
        this.changeDetectorRefs.detectChanges();
      }
    });
    }
  }

  openDealDetails(dealId: number) {
    const linkUrl = environment.weburl + "/deals/" + dealId;
    window.open(linkUrl, '_blank');
  }

}
