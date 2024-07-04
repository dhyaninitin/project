import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { Store } from "@ngrx/store";

import { CreateOffer } from "../store/interface/create";
import { Observable, throwError } from "rxjs";
import { fadeAnimation } from "../../../animations";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { SETTINGS_LN } from "../../shared/settings.lang";
import { Router } from "@angular/router";
import {
  getActiveStepperIndex,
  getStepper,
  isActiveStepper,
} from '../store/selectors/create.selector';
import { TemplateService } from '../shared/services/template.service';
import { CreateOfferFirstComponent } from '../create-offer-first/create-offer-first.component';
import { MatDrawer } from "@angular/material/sidenav";
import { DesignService } from "../../../utility/services/design.service";
import {
  setStepper,
  setStepperShow,
  setUserRole,
} from "../store/actions/create.action";
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { TemplateListService } from '../shared/services/template-list.service';
import { OfferDocumentI } from '../shared/interfaces/offer-document';
import { UploadToS3 } from '../shared/interfaces/offer-setting';
import { LibraryService } from '../shared/services/library.service';
import { timeout } from 'rxjs/operators';
import { UploadImageService } from '../../../account/shared/upload-image.service';
import { v1 as uuidv1 } from 'uuid';
@Component({
  selector: "app-stepper",
  templateUrl: "./stepper.component.html",
  styleUrls: ["./stepper.component.scss"],
})
export class StepperComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(CreateOfferFirstComponent)
	private firstForm = {} as CreateOfferFirstComponent;
  route_conf = ROUTE_CONFIGS;
  ln = SETTINGS_LN;
  stepperPages: string[] = ["first", "second", "final"];
  showStepper$: Observable<boolean>;
  activeStepper: number = 0;
  step: number = 0;
  createOfferPage = 0;
  displayedColumns: string[] = ["check", "Component", "Type", "Rule", "Action"];
  // dataSource = ELEMENT_DATA;
  addComponent: boolean = false;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  checkUploadFromLibrary: boolean = false;
  docInfoFromLib:any;
  enableSecond: boolean = false;
  enableFinish: boolean = false;;


  constructor(
    private store: Store<CreateOffer>,
    private router: Router,
    public designService: DesignService,
    public templateService: TemplateService,
    private templateListService: TemplateListService,
    private libraryService: LibraryService,
    private snackBar: SnackBarService
  ) {
    this.showStepper$ = this.store.select(isActiveStepper);
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    this.templateService.firstForm.next({});
    this.templateService.componentsList.next([]);
    this.templateService.finalForm.next({});
  }

  ngOnInit(): void {
    this.store.select(getStepper).subscribe((data) => {
      this.stepperPages = data;
    });

    this.templateService.componentsList.subscribe(res=> {
      let isEmpty = Object.keys(res).length === 0
      if(!isEmpty) {
        this.enableSecond = true;
      }
    });

    this.store
      .select(getActiveStepperIndex)
      .subscribe((data) => (this.activeStepper = data));
    this.store.dispatch(setStepperShow({ data: false }));
    this.store.dispatch(setStepper({ data: 0 }));
    this.store.dispatch(setUserRole({ data: 0 }));
  }
  goTonext() {
    if (this.activeStepper == 0) {
      this.firstForm.validateForm();
    } else if (this.activeStepper == 1) {
      this.validateSecondForm();
    } else if (this.activeStepper == 2) {
      this.validateFinalForm();
    }
  }
  goToPrev() {
    if (this.activeStepper == 2) {
      this.activeStepper = this.activeStepper - 1;
    } else if (this.activeStepper == 1) {
      this.activeStepper = this.activeStepper - 1;
      this.createOfferPage = 1;
    }
  }

  createOfferForm(event: any) {
    if(event){
      this.activeStepper = this.activeStepper + 1;
      this.createOfferPage = 0;
    }
  }

  validateSecondForm() {
    this.templateService.componentsList.subscribe(res=> {
      let isEmpty = Object.keys(res).length === 0
      if(!isEmpty) {
        this.activeStepper = this.activeStepper + 1;
      }
    });
  }

  validateFinalForm() {
    this.templateService.finalForm.subscribe(documentInfo=> {
      let isEmpty = Object.keys(documentInfo).length === 0
      if(!isEmpty) {
        this.createOfferTemplate(documentInfo); 
      }
    })
  }

  createOfferTemplate(documentInfo: any) {
    if(this.checkUploadFromLibrary) {
      documentInfo = this.docInfoFromLib;
    } else {
      documentInfo.offerdocumentid = uuidv1();
    }
    this.templateService.firstForm.subscribe( (firstFormInfo: any) => {
      const payload = {
        templateid: firstFormInfo.templateid,
        templatename: firstFormInfo.templatename,
        description: firstFormInfo.description,
        sendoffer: firstFormInfo.sendoffer,
        templatetype: firstFormInfo.templatetype,
        componenttype: firstFormInfo.componenttype,
        offerdocument: {
          offerdocumentid: documentInfo.offerdocumentid,
          documentname: documentInfo.documentname,
          documentoriginalname: documentInfo.documentoriginalname,
          extension: documentInfo.extension,
          documentpath: documentInfo.documentpath,
          size: documentInfo.size,
        },
        offercustomfield: [],
        isActive: 1,
      }
      if(this.activeStepper == 2) {
        this.templateListService.createOfferTemplate(payload).subscribe( res => {
          if(res.error) {
            this.snackBar.open(res.message);
          } else {
            this.snackBar.open(res.message);
            this.activeStepper = 0;
            if(res.data.acknowledged && !this.checkUploadFromLibrary){
              this.saveOfferDocument(documentInfo);
              this.saveOfferVLookUpdetails(firstFormInfo.templateid);
            }
            this.router.navigateByUrl('/dashboard/settings/offer/template');
          }
        })
      }
    });
  }

  saveOfferDocument(documentInfo: OfferDocumentI) {
    documentInfo.status = documentInfo.status = 1;
    documentInfo.latestversionid = '';
    this.libraryService.createOfferDocument(documentInfo).subscribe(res => {
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        //this.uploadFile();
      }
    })
  }

  saveOfferVLookUpdetails(templateid: string) {
    let data = this.templateService.uploadedExcelObject;
    if(data.length > 0) {
      const payload = {
        offertemplateid: templateid,
        exceldata: data
      }
      this.templateService.createVlookUpDocRecord(payload).subscribe(res=> {
        if(res.error) {
          this.snackBar.open(res.message);
        } else {
          this.templateService.uploadedExcelObject = [];
          this.snackBar.open(res.message);
        }
      }) 
    }
  }

  uploadFromLibrary($event: boolean) {
    if($event) {
      this.docInfoFromLib = $event;
      this.checkUploadFromLibrary = true;
    }
  }


  goToPrevs() {
    this.store.dispatch(setStepper({ data: 0 }));
    this.store.dispatch(setUserRole({ data: 0 }));
    this.router.navigate(["/dashboard/settings/offer/create-offer-first"]);
  }
  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }
  addComponents() {
    this.drawer.open();
    this.addComponent = true;
  }

  cancelOfferCreation() {
    const templateid = localStorage.getItem('templateid')  || '';
    this.templateService.deleteAllComponentsById(templateid).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.router.navigateByUrl('/dashboard/settings/offer/template');
      }
    })
  }
}
