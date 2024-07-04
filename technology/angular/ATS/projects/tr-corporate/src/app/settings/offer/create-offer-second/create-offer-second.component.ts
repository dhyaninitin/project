import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ROUTE_CONFIGS } from '../../../utility/configs/routerConfig';
import { DesignService } from '../../../utility/services/design.service';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { TEMPLATE_TYPE } from '../shared/enums/enums';
import { ComponentPayload } from '../shared/interfaces/create-offer-component';
import { TemplateService } from '../shared/services/template.service';
import {
  setStepper,
  setStepperShow,
  setUserRole,
} from "../store/actions/create.action";
import { CreateOffer } from "../store/interface/create";
import * as XLSX from 'xlsx';
@Component({
  selector: "app-create-offer-second",
  templateUrl: "./create-offer-second.component.html",
  styleUrls: ["./create-offer-second.component.scss"],
})
export class CreateOfferSecondComponent implements OnInit {
  displayedColumns: string[] = ['check', 'Component', 'Type', 'Rule', 'Action'];
  dataSource : ComponentPayload[] = [];
  route_conf = ROUTE_CONFIGS;
  addComponent: boolean = false;
  editComponentDetails: ComponentPayload | undefined;
  offercomponentid: string = '';
  deletePopupText = "Offer Component";
  onTemplateType: boolean = false;


  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  @ViewChild("dialogRefs") dialogRefs!: TemplateRef<any>;

  constructor(
    private store: Store<CreateOffer>,
    private router: Router,
    public designService: DesignService,
    private snackBar: SnackBarService,
    public dialog: MatDialog,
    private templateService: TemplateService
  ) {
    this.store.dispatch(setStepperShow({ data: true }));
    this.store.dispatch(setUserRole({ data: 0 }));
  }

  ngOnInit(): void {
    this.templateService.firstForm.subscribe(res=> {
      const arr = Object.values(res);
     if(arr[4] == TEMPLATE_TYPE.BASED_ON_OFFER) {
      this.displayedColumns = ['check', 'Component', 'Type', 'Action'];
      this.onTemplateType = false;
     } else {
       this.onTemplateType = true;
     }  
    })
    this.store.dispatch(setStepperShow({ data: false }));
    this.store.dispatch(setStepper({ data: 0 }));
    this.store.dispatch(setUserRole({ data: 0 }));
    this.loadComponents();
  }

  goToPrev() {
    this.store.dispatch(setStepper({ data: 0 }));
    this.store.dispatch(setUserRole({ data: 0 }));
    this.router.navigate(["/dashboard/settings/offer/create-offer-first"]);
  }

  addComponents() {
    this.drawer.open();
    this.addComponent = true;
  }
  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
    this.addComponent = false;
  }

  getComponents(event: any) {
    if (event) {
      this.getAllComponent();
      this.addComponent = false;
    }
    this.drawer.close();
  }

  getAllComponent() {
    const templateid = localStorage.getItem('templateid')  || '';
    this.templateService.getComponentsByTempId(templateid).subscribe(res => {
      if (res.error) {
        // error from api
        this.snackBar.open(res.message);
        this.dataSource = [];
      } else {
        // success from api
        this.snackBar.open(res.message);
        this.dataSource = res.data;
        this.templateService.componentsList.next(<[]>this.dataSource);
      }
    })
  }

  loadComponents() {
    this.templateService.componentsList.subscribe(res => {
      if (res) {
        this.dataSource = res;
      }
    })
  }

  editComponent(info: ComponentPayload) {
    const detail = info;
    this.editComponentDetails = detail;
    this.addComponent = true;
    this.drawer.open();
  }

  removeConfirmation(event: any) {
    if (event) {
      this.templateService.deleteComponentsById(this.offercomponentid).subscribe(res => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          this.getComponents(true);
          this.dialog.closeAll();
        }
      });
    }
  }

  deleteComponentPopup(offercomponentid: string) {
    this.offercomponentid = offercomponentid;
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: '',
    });
  }

  destroy() {
    if (!this.drawer.opened) {
      this.addComponent = false;
      this.editComponentDetails = undefined;
    }
  }

  onFileChange(event: any) {
    let target: DataTransfer = (event.target) as DataTransfer;
    let file = event.target.files[0];
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      // / create workbook /
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
      // selected the first sheet 
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
   
      this.templateService.uploadedExcelObject = data;
    };
  }
}
