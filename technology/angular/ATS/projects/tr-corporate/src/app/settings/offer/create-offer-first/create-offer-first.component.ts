import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ROUTE_CONFIGS } from '../../../utility/configs/routerConfig';
import { SETTINGS_LN } from '../../shared/settings.lang';
import { Store } from '@ngrx/store';

import { CreateOffer } from '../store/interface/create';
import { Observable } from 'rxjs';
import { fadeAnimation } from '../../../animations';
import {
  setStepperShow,
  setUserRole,
  setStepper,
} from '../store/actions/create.action';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationConstants } from '../../../utility/configs/app.constants';
import { TemplateService } from '../shared/services/template.service';
import { v1 as uuidv1 } from 'uuid';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { TEMPLATE_TYPE } from '../shared/enums/enums';
@Component({
  selector: 'app-create-offer-first',
  templateUrl: './create-offer-first.component.html',
  styleUrls: ['./create-offer-first.component.scss'],
})
export class CreateOfferFirstComponent implements OnInit, OnDestroy {
  @Input() detectChangeOffer = 0;
  @Output() isValid = new EventEmitter();
  route_conf = ROUTE_CONFIGS;
  ln = SETTINGS_LN;
  leftPanelImg!: string;
  stepperPages: string[] = ['first', 'second', 'final'];
  showStepper$!: Observable<boolean>;
  activeStepper: number = 0;
  roles: any[] = [];
  templateid : any;

  createTemplate!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router, 
    private store: Store<CreateOffer>,
    private templateService: TemplateService,
    private snackBar: SnackBarService,
    ) {
    this.store.dispatch(setStepperShow({ data: true }));
    this.store.dispatch(setUserRole({ data: 0 }));
    this.initialize();
  }

  ngOnInit(): void {
    if(this.detectChangeOffer == 1) {
      this.templateid = localStorage.getItem('templateid');
      this.setOfferValues();
    } else {
      this.templateid = uuidv1();
      localStorage.setItem('templateid', this.templateid);
    }
  }

  initialize() {
      // Form initialization
      this.createTemplate = this.fb.group({
        templatename: [
          '',
          [
            Validators.required,
            Validators.minLength(ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH),
            Validators.maxLength(ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH)
          ],
        ],
        description: [
          '',
          [ Validators.required ],
        ],
        sendoffer: ['Candidate', [ Validators.required ] ],
        templatetype: [TEMPLATE_TYPE.BASED_ON_OFFER, [ Validators.required ] ],
        componenttype: ['Yearly', [ Validators.required ] ]
  });
  }

  get templatename(): AbstractControl {
    return this.createTemplate.get('templatename') as FormControl;
  }
  get description(): AbstractControl {
    return this.createTemplate.get('description') as FormControl;
  }
  get sendoffer(): AbstractControl {
    return this.createTemplate.get('sendoffer') as FormControl;
  }
  get templatetype(): AbstractControl {
    return this.createTemplate.get('templatetype') as FormControl;
  }
  get componenttype(): AbstractControl {
    return this.createTemplate.get('componenttype') as FormControl;
  }

  ngOnDestroy() {
    this.store.dispatch(setStepperShow({ data: false }));
  }

  roleHandler(role: number) {
    this.store.dispatch(setStepper({ data: 1 }));
    this.router.navigate(['/dashboard/settings/offer/create-offer-second']);
  }

  validateForm() {
    if(this.createTemplate.status === "VALID") {
      const { value } = this.createTemplate;
      const payload = {
        templateid: this.templateid,
        templatename: value.templatename,
        description: value.description,
        sendoffer: value.sendoffer,
        templatetype: value.templatetype,
        componenttype: value.componenttype
      }
  
      this.templateService.firstForm.next(payload);
      this.isValid.emit(true); 
    } else {
      this.createTemplate.markAllAsTouched();
      this.isValid.emit(false);
      this.snackBar.open("Please fill all the details");
    }
  }
  
  setOfferValues(){
    this.templateService.firstForm.subscribe( offer => {
      if(offer) {
        this.createTemplate.setValue(
          {
            templatename: (<any>offer).templatename, 
            description: (<any>offer).description, 
            sendoffer: (<any>offer).sendoffer, 
            templatetype: (<any>offer).templatetype,
            componenttype: (<any>offer).componenttype
          })}
    })
  }
}
