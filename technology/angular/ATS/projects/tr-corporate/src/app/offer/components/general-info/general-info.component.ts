import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { OfferService } from '../../shared/services/offer.service';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss']
})
export class GeneralInfoComponent implements OnInit, OnChanges {
  @Input() jobLocation: any;
  generalInfoForm!: FormGroup;
  isRemote: number = 0;
  existedUser: boolean = false;
  constructor(
    private offerService: OfferService,
    private fb: FormBuilder,
    private snackBar: SnackBarService
    ){
      this.initialize();
    }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.jobLocation) {
      this.generalInfoForm.patchValue({joblocation: this.jobLocation})
    }
  }

  ngOnInit(): void {
    this.offerService.generalInfoForm.subscribe(res=> {
      if(res){
        let isEmpty = Object.keys(res).length === 0
        if(!isEmpty) {
          this.generalInfoForm.patchValue({
            offerdesignation: res.offerDesignation,
            joblocation: res.offerLocation,
            dateofjoining: res.dateOfJoining  
          })
          this.existedUser = true;
        }
      }
    })
  }

  initialize() {
    this.generalInfoForm = this.fb.group({
      joblocation: ['', [Validators.required]],
      offerdesignation: ['', Validators.required],
      dateofjoining: ['', Validators.required]
    });
  }

  get joblocation(): AbstractControl {
    return this.generalInfoForm.get('joblocation') as FormControl;
  }
  get offerdesignation(): AbstractControl {
    return this.generalInfoForm.get('offerdesignation') as FormControl;
  }
  get dateofjoining(): AbstractControl {
    return this.generalInfoForm.get('dateofjoining') as FormControl;
  }

  next(){
    if(this.generalInfoForm.valid) {
      const {value} = this.generalInfoForm;
      const payload = {
        jobid: this.offerService.jobid,
        candidateEmail: this.offerService.email,
        status: 1,
        generalinfo : {
          offerLocation: value.joblocation,
          offerDesignation: value.offerdesignation,
          isRemote: this.isRemote,
          dateOfJoining: value.dateofjoining
        }
      }
      this.offerService.dateOfJoining = payload.generalinfo.dateOfJoining
      if(this.existedUser) {
        if(this.generalInfoForm.dirty) {
          this.offerService.updateGeneralInfo(payload).subscribe(res=> {
            if(res.error) {
              this.snackBar.open(res.message);
            } else {
              this.snackBar.open(res.message);
              this.offerService.generalInfoForm.next(payload.generalinfo);
              this.offerService.step += 1;
            }
          })
        } else {
          this.offerService.step += 1;
        }
      } else {
        this.offerService.createGeneralInfo(payload).subscribe(res=> {
          if(res.error) {
            this.snackBar.open(res.message);
          } else {
            this.snackBar.open(res.message);
            this.offerService.generalInfoForm.next(payload.generalinfo);
            this.offerService.step += 1;
          }
        })
      }
    } else {
      this.generalInfoForm.markAllAsTouched();
    }
  }

  changeIsRemote(event: any) {
    this.isRemote = event.checked ? 1 : 0;
  }

  previous() {
    this.offerService.step -= 1;
  }
}
