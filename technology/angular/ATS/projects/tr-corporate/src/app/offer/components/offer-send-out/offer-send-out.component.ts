import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OfferService } from '../../shared/services/offer.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material/chips';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offer-send-out',
  templateUrl: './offer-send-out.component.html',
  styleUrls: ['./offer-send-out.component.scss']
})
export class OfferSendOutComponent implements OnInit, OnDestroy {
  config = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['link', 'blockquote', 'code-block','image'],
      [{ 'list': 'bullet' }, { 'list': 'ordered'}, { 'list': 'unordered'}] 
    ]
  }
  @ViewChild('CCInput')
  CCInput!: ElementRef<HTMLInputElement>;
  @ViewChild('BCCInput')
  BCCInput!: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  allCC: string[] = [];
  allBCC: string[] = [];
  hideCC: boolean =  false;
  hideBCC: boolean =  false;

  sendEmail!: FormGroup;
  emailTempltes: any = [];
  invalid: boolean = true;

  constructor( 
    private offerService: OfferService,
    private snackBar: SnackBarService,
    private fb: FormBuilder,
    private route: Router) { 
      this.initialize();
    }

    initialize() {
      this.sendEmail = this.fb.group({
        to: ['', [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
        emailTemplate: ['', [Validators.required]],
        subject: ['', Validators.required],
        description: ['', Validators.required],
        validTill: ['', Validators.required],
        dateOfJoining: ['', Validators.required]
      });
    }

    
  get to(): AbstractControl {
    return this.sendEmail.get('to') as FormControl;
  }
  get emailTemplate(): AbstractControl {
    return this.sendEmail.get('emailTemplate') as FormControl;
  }
 
  get subject(): AbstractControl {
    return this.sendEmail.get('subject') as FormControl;
  }
  get description(): AbstractControl {
    return this.sendEmail.get('description') as FormControl;
  }
  get validTill(): AbstractControl {
    return this.sendEmail.get('validTill') as FormControl;
  }
  get dateOfJoining(): AbstractControl {
    return this.sendEmail.get('dateOfJoining') as FormControl;
  }

  ngOnDestroy(): void {
    this.offerService.generalInfoForm.next({});
    this.offerService.salaryStructureTemplate.next({});
    this.offerService.previewDrawer.next(false);
    this.offerService.offerBreakdownDrawer.next(false);
    this.offerService.salaryStructureCreated = false;
    this.offerService.offerJSON = [];
    this.offerService.equalJSON = false;
    this.offerService.oldJson = [];
    this.offerService.salaryDetailsForMobile = [];
  }

  ngOnInit(): void {
    this.getEmailTemplates();
    this.sendEmail.patchValue({
      dateOfJoining: this.offerService.dateOfJoining,
      description : this.offerService.offerUrl
    })
    // this.sendEmail.get('dateOfJoining')?.disable();
  }

  finalOffer() {
    let ccValid = false;
    let bccValid = false;
    if(this.hideCC) {
      if(this.allCC.length == 0)  {
        ccValid = false;
      } else {
        ccValid = true;
      }
    } else {
      ccValid = true;
    }
    if(this.hideBCC) {
      if(this.addBCC.length == 0)  {
        bccValid = false;
      } else {
        bccValid = true;
      }
    } else {
      bccValid = true;
    }
    if(this.sendEmail.valid && ccValid && bccValid) {
      this.invalid = true;
      const {value} = this.sendEmail;
      let cc: { email: string; name: string; }[] = [];
      let bcc: { email: string; name: string; }[] = [];

      if(this.allBCC.length > 0) {
        this.allBCC.map(bccEmail=> {
          bcc.push({email: bccEmail, name: bccEmail})
        })
      }
      if(this.allCC.length > 0) {
        this.allCC.map(ccEmail=> {
          cc.push({email: ccEmail, name: ccEmail})
        })
      }
      
      const payload = {
        jobid: this.offerService.jobid,
        candidateEmail: this.offerService.email,
        status: 1,
        offersendout : {
          to : value.to,
          name: value.to,
          templateid: value.emailTemplate,
          cc: cc,
          bcc: bcc,
          subject: value.subject,
          description: value.description,
          validTill: value.validTill.toLocaleDateString(),
          dateOfJoining: value.dateOfJoining,
          attachments: this.offerService.offerUrl
        }
      }
      this.offerService.updateFinalOffer(payload).subscribe(res=> {
        if(res.error) {
          this.snackBar.open(res.message)
        } else {
          this.snackBar.open(res.message);
          const object = {
            sendto: [{
              name : payload.offersendout.to,
              email: payload.offersendout.to 
            }],
            cc: payload.offersendout.cc,
            bcc: payload.offersendout.bcc,
            subject: payload.offersendout.subject,
            body: payload.offersendout.description
          }
          this.offerService.sendEmail(object).subscribe(res=> {
            if(res.error) {
              this.snackBar.open(res.message)
            } else {
                 this.updateJobId();
              this.snackBar.open("Email successfully sent.")
              this.route.navigateByUrl('/dashboard');
            }
          })
        }
      })
    } else {
      this.invalid = false;
      this.sendEmail.markAllAsTouched();
      this.snackBar.open("Please fill all the required fields");
    }
  }

  previous() {
    this.offerService.step -= 1;
  }

  addCC(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if(this.validEmail(value)) {
        this.allCC.push(value);
      } else {
        this.snackBar.open("Enter valid email");
      }
    }
    event.chipInput!.clear();
  }

  addBCC(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if(this.validEmail(value)) {
        this.allBCC.push(value);
      } else {
        this.snackBar.open("Enter valid email");
      }
    }
    event.chipInput!.clear();
  }

  removeCC(fruit: string): void {
    const index = this.allCC.indexOf(fruit);

    if (index >= 0) {
      this.allCC.splice(index, 1);
    }
  }

  removeBCC(fruit: string): void {
    const index = this.allBCC.indexOf(fruit);

    if (index >= 0) {
      this.allBCC.splice(index, 1);
    }
  }

  call() {
    console.log('dskjbkcjb')
  }

  validEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  getEmailTemplates() {
    this.offerService.getEmailTemplates().subscribe(res=> {
      if(res.error) {
        this.snackBar.open(res.message)
      } else {
        this.emailTempltes = res.data;
      }
    })
  }


  updateJobId() {
    let code = this.offerService.jobCode.split('/');
    code[code.length-1] = (Number(code[code.length-1]) + 1).toString();
    let jobCode = code.join('/');
    const object  =  {
      jobcode : jobCode
    }
    this.offerService.updateGenericSetting(object).subscribe(res=> {
      if(res.error) {
        this.snackBar.open(res.message)
      } else {
        this.snackBar.open("Offer Sent");
      }
    })
  }

}
