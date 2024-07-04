import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { User } from 'app/shared/models/user.model';
import { UserService } from 'app/shared/services/apis/users.service';

@Component({
  selector: 'app-contact-secondary-phone-number',
  templateUrl: './contact-secondary-phone-number.component.html',
  styleUrls: ['./contact-secondary-phone-number.component.scss']
})
export class ContactSecondaryPhoneNumberComponent implements OnInit {
  @Input() userDetails: any;
  public secondaryPhoneForm: FormGroup;
  @Output() onPhoneMenuClose: EventEmitter<any> = new EventEmitter();
  public user: User;
  public isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private service$: UserService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.buildItemForm(this.userDetails);
    const secondaryphone = this.userDetails.secondary_phone.split(',');
    this.setValuesForPhones(secondaryphone)
  }

  get secondaryPhone(): FormArray {
    return this.secondaryPhoneForm.get('secondary_phone') as FormArray;
  }

  buildItemForm(item:User){
    this.secondaryPhoneForm = this.fb.group({
      primary_phone: [item.phone, Validators.required],
      secondary_phone: this.fb.array([])
    });
  }

  addSecondaryPhone(){
    this.secondaryPhone.push(this.addPhone());
  }

  setValuesForPhones(values: any[]){
    values.forEach((value) => {
      if (value.trim().startsWith('+1')) {
        const phoneNumber = value.trim().substr(2).trim();
        this.secondaryPhone.push(this.addPhone(phoneNumber));
      }else{
        this.secondaryPhone.push(this.addPhone(value.trim()));
      }
    });
  }

  addPhone(phone: string = ''): FormGroup {
    return this.fb.group({
      additional_phone: [phone, [Validators.required, Validators.pattern(/^\d{3}[- ]?\d{3}[- ]?\d{4}$/)]],
    });
  }

  removePhone(index: number): void {
    this.secondaryPhone.removeAt(index);
  }

  phoneCloseMenu(): void {
    this.onPhoneMenuClose.emit(null);
  }

  submit(){
    if (this.secondaryPhoneForm.valid) {
      const secondaryPhones = this.secondaryPhoneForm.value.secondary_phone;
      const additionalPhoneNUmbers = secondaryPhones.map(item => item.additional_phone);
      const payload: {primary_phone: string, secondary_phone: any } = {
          primary_phone: this.secondaryPhoneForm.value.primary_phone,
          secondary_phone: additionalPhoneNUmbers,
      };
      this.onPhoneMenuClose.emit(payload);
    }
  }

  checkForDuplicatePhone(phone:string,index:number){
    if (this.secondaryPhoneForm.valid) {
      const phoneNumber = formatPhoneNumber(phone);
      const phoneArray = this.secondaryPhone.controls.map(control => {
          const formattedPhoneNumber = formatPhoneNumber(control.value.additional_phone);
          return formattedPhoneNumber['nationalNumber'];
        });
      const isDuplicate = phoneArray.filter((value, i) => value === phoneNumber['nationalNumber'] && i !== index).length > 0;
        if(!isDuplicate){
          const payload: {phone_number: string} = {
            phone_number: phoneNumber['number'],
          };
          this.isLoading = true;
          this.service$.checkContactSecondaryPhoneNumber(payload).subscribe(response=> {
              if(response) {
                if(response.data) {
                  this.isLoading = true;
                  this.secondaryPhone.controls[index].get('additional_phone').setErrors({ 'duplicate': true });
                } else {
                  this.isLoading = false;
                  this.secondaryPhone.controls[index].get('additional_phone').setErrors(null);
                }
              }
              this.changeDetectorRefs.detectChanges();
            });
        }else{
          this.isLoading = true;
          this.secondaryPhone.controls[index].get('additional_phone').setErrors({ 'duplicate': true });
        }
    }
  }

  makePrimaryPhone(index:number,secondaryPhone:any){
    if(this.secondaryPhoneForm.value.primary_phone){
      const primaryPhone = this.secondaryPhoneForm.value.primary_phone;
      this.secondaryPhoneForm.patchValue({ primary_phone: secondaryPhone.value.additional_phone });
      this.secondaryPhone.at(index).patchValue({ additional_phone: primaryPhone });
    }
    
  }

}