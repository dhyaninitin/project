import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'app/shared/models/user.model';
import { UserService } from 'app/shared/services/apis/users.service';

@Component({
  selector: 'app-contact-secondary-emails',
  templateUrl: './contact-secondary-emails.component.html',
  styleUrls: ['./contact-secondary-emails.component.scss']
})
export class ContactSecondaryEmailsComponent implements OnInit {
  @Input() userDetails: any;
  public secondaryEmailForm: FormGroup;
  @Output() onMenuClose: EventEmitter<any> = new EventEmitter();
  public user: User;
  public isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private service$: UserService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.buildItemForm(this.userDetails);
    const secondaryEmails = this.userDetails.secondary_emails.split(',');
    this.setValuesForEmails(secondaryEmails)
  }
  
  get secondaryEmails(): FormArray {
    return this.secondaryEmailForm.get('secondary_emails') as FormArray;
  }
  

  buildItemForm(item:User){
    this.secondaryEmailForm = this.fb.group({
      primary_email: [item.email_address, [Validators.required, Validators.email]],
      secondary_emails: this.fb.array([])
    });
  }

  addSecondaryEmail(){
    this.secondaryEmails.push(this.addEmail());
  }

  setValuesForEmails(values: any[]){
    values.forEach((value) => {
      this.secondaryEmails.push(this.addEmail(value?.trim()));
    });
  }

  addEmail(email: string = ''): FormGroup {
    return this.fb.group({
      additional_email: [email, [Validators.required, Validators.email]],
    });
  }

  removeEmail(index: number): void {
    this.secondaryEmails.removeAt(index);
  }

  submit(){
    if (this.secondaryEmailForm.valid) {
      const secondaryEmails = this.secondaryEmailForm.value.secondary_emails;
      const additionalEmails = secondaryEmails.map(item => item.additional_email);
      const payload: {primary_email: string, secondary_emails: any } = {
          primary_email: this.secondaryEmailForm.value.primary_email,
          secondary_emails: additionalEmails,
      };
      this.onMenuClose.emit(payload);
    }
  }

  makePrimaryEmail(index:number,secondaryEmail:any){
    if(this.secondaryEmailForm.value.primary_email){
      const primaryEmail = this.secondaryEmailForm.value.primary_email;
      this.secondaryEmailForm.patchValue({ primary_email: secondaryEmail.value.additional_email });
      this.secondaryEmails.at(index).patchValue({ additional_email: primaryEmail });
    }
  }


  closeMenu(): void {
    this.onMenuClose.emit(null);
  }

  checkForDuplicateEmail(newEmail:string,index:number){
    if (this.secondaryEmailForm.valid) {
      const primaryEmail = this.secondaryEmailForm.value.primary_email;
      const emailsArray = this.secondaryEmails.controls.map(control => control.value.additional_email);
      emailsArray.push(primaryEmail);
      const isDuplicate = emailsArray.filter((value, i) => value === newEmail && i !== index).length > 0;
        if(!isDuplicate){
          const payload: {email: string} = {
            email: newEmail,
          };
          this.isLoading = true;
          this.service$.checkContactSecondaryEmail(payload).subscribe(response=> {
              if(response) {
                if(response.data) {
                  this.isLoading = true;
                  this.secondaryEmails.controls[index].get('additional_email').setErrors({ 'duplicate': true });
                } else {
                  this.isLoading = false;
                  this.secondaryEmails.controls[index].get('additional_email').setErrors(null);
                }
              }
              this.changeDetectorRefs.detectChanges();
            });
        }else{
          this.isLoading = true;
          this.secondaryEmails.controls[index].get('additional_email').setErrors({ 'duplicate': true });
        }
    }
  }
}
