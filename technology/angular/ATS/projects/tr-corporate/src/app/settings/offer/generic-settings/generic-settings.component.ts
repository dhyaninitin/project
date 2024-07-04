import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ROUTE_CONFIGS } from '../../../utility/configs/routerConfig';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { SETTINGS_LN } from '../../shared/settings.lang';
import { GenericSettingsPayload } from '../shared/interfaces/genericSettings';
import { TemplateService } from '../shared/services/template.service';
@Component({
  selector: 'app-generic-settings',
  templateUrl: './generic-settings.component.html',
  styleUrls: ['./generic-settings.component.scss'],
})
export class GenericSettingsComponent implements OnInit {
  ln = SETTINGS_LN;
  route_conf = ROUTE_CONFIGS;
  genericSetting!:FormGroup;
  allowToAddCC: boolean = false;
  isOfferRelaseenable:boolean = false
  currentDate: string = '';
  candidateMan: boolean = false;
  candidateAuto: boolean = false;
  agencyManually: boolean = false;
  agencyAuto: boolean = false;
  candidate: string = '';
  agency: string = '';
  jobtype = [
    {value: "permanent", name: 'Permanent'},
    {value: "gig", name:'GIG'},
    {value: "contract", name:'Contract'}
  ];
  offerrelease =[{candidate:['']},{agency : ['']}]
  candArr=[''];
  agencyArr=[''];

  constructor(
    private formBuilder: FormBuilder,
    private route:Router,
    private snackBar: SnackBarService,
    private templateService: TemplateService,
  ) 
  {
    this.initForm();
  }
  
  ngOnInit(): void {
    this.getGenericSettings()
    const today = new Date();
    const currentMonth = today.getMonth()+1;
    this.currentDate = (today.getDate() + '/' + (currentMonth > 9 ? currentMonth : "0"+currentMonth ) + '/' + today.getFullYear());
  }

  initForm(){
    this.genericSetting = this.formBuilder.group({
      jobcodeTR:['',[Validators.required]],
      jobcodedate:['',[Validators.required]],
      offersalaryconvention:['None',[Validators.required]],
      displayvaluesin:['Decimal',[Validators.required]],
      internalapproval:['No'],
      isofferrelaseenable:[''],
      allowedccmails:[''],
      allowtoaddcc:[''],
      offervalidity:[''],
      permanent: [''],
      gig: [''],
      contract: [''],
     });   
  }

  get jobcodeTR(): AbstractControl {
    return this.genericSetting.get('jobcodeTR') as FormControl;
  }
  get jobcodedate(): AbstractControl {
    return this.genericSetting.get('jobcodedate') as FormControl;
  }
  get offersalaryconvention(): AbstractControl {
    return this.genericSetting.get('offersalaryconvention') as FormControl;
  }
  get displayvaluesin(): AbstractControl {
    return this.genericSetting.get('displayvaluesin') as FormControl;
  }
  get internalapproval(): AbstractControl {
    return this.genericSetting.get('internalapproval') as FormControl;
  }
  get isofferrelaseenable(): AbstractControl {
    return this.genericSetting.get('isofferrelaseenable') as FormControl;
  }
  get allowtoaddcc(): AbstractControl {
    return this.genericSetting.get('allowtoaddcc') as FormControl;
  }
  get offervalidity(): AbstractControl {
    return this.genericSetting.get('offervalidity') as FormControl;
  }
  get allowedccmails(): AbstractControl {
    return this.genericSetting.get('allowedccmails') as FormControl;
  }

  markAsTouch($event: any) {
    this.genericSetting.markAllAsTouched();
  }

  getGenericSettings(){
      this.templateService.getGenericSetting().subscribe(res => {
      if (res.error) {
        // error from api
        this.snackBar.open(res.message);
      } else {
        // success from api
        this.snackBar.open(res.message);
        const data  = res.data;
        let jobcode = '001';
        if(data.jobcode !== '') {
          const jobcodeArr = data.jobcode.split('/');
          jobcode = jobcodeArr[jobcodeArr.length-1];
          this.currentDate = jobcodeArr[1]+'/'+jobcodeArr[2]+'/'+jobcodeArr[3];
        }
        let jobTypeArr = ['','',''];
        if(data.jobtype) {
          const perm = data.jobtype.findIndex(x=>{ return x=='Permanent' });
          jobTypeArr[0] = perm !== -1 ? 'Permanent' : '';
          const gig = data.jobtype.findIndex(x=>{ return x=='GIG' });
          jobTypeArr[1] = gig !== -1 ? 'GIG' : '';
          const contr = data.jobtype.findIndex(x=>{ return x=='Contract' });
          jobTypeArr[2] = contr !== -1 ? 'Contract' : '';
        }
        if(data.offerrelase.length > 0) {
            const obj = Object.values(data.offerrelase);
            this.candArr = obj[0]['candidate'];
            this.agencyArr = obj[1]['agency'];
            for(let i=0;i<2;i++) {
              this.candidateAuto = obj[0]['candidate'][i] === 'auto' ? true : false;
              this.candidateMan = obj[0]['candidate'][i] === 'manually' ? true : false;
              this.agencyAuto = obj[1]['agency'][i] === 'auto' ? true : false;
              this.agencyManually  = obj[1]['agency'][i] === 'manually' ? true : false;
              this.candidate = obj[0]['candidate'][0] === 'auto' ? 'auto' : 'manually';
              this.agency = obj[1]['agency'][0] === 'auto' ? 'auto' : 'manually';
            }       
        }
        this.genericSetting.setValue({
          permanent: jobTypeArr[0],
          gig: jobTypeArr[1],
          contract: jobTypeArr[2],
          jobcodeTR: jobcode,
          jobcodedate: this.currentDate,
          offersalaryconvention: data.offersalaryconvention,
          displayvaluesin: data.displayvaluesin,
          internalapproval: data.internalapproval,
          isofferrelaseenable: data.isofferrelaseenable,
          allowtoaddcc: data.allowtoaddcc,
          offervalidity: data.offervalidity,
          allowedccmails: data.allowedccmails
        })
        this.allowToAddCC = data.allowtoaddcc == 1? true: false;
        this.isOfferRelaseenable = data.isofferrelaseenable == 1? true:false;
       }
    })
  }

  updateGenericSetting(){
    this.genericSetting.markAllAsTouched();
    if(this.genericSetting.status === "VALID" && this.genericSetting.touched){
      let jobCodeDate = this.genericSetting.get('jobcodedate')?.value;
      let yearFromJobCode = jobCodeDate.substring(jobCodeDate.length-2, jobCodeDate.length);
      let jobCode = "TR/" +  jobCodeDate  + '/' + yearFromJobCode + '/' +this.genericSetting.get('jobcodeTR')?.value 
      const { value } = this.genericSetting;
      value.isofferrelaseenable = this.isOfferRelaseenable ? 1 : 0;
      value.allowtoaddcc = this.allowToAddCC ? 1 : 0;
      let jobtype = []
      if(value.permanent){ jobtype.push('Permanent') }
      if(value.gig){ jobtype.push('GIG') }
      if(value.contract){ jobtype.push('Contract') }
      const payload : GenericSettingsPayload = {
        jobtype: jobtype,
        jobcode: jobCode,
        offersalaryconvention: value.offersalaryconvention,
        displayvaluesin: value.displayvaluesin,
        internalapproval: value.internalapproval,
        isofferrelaseenable: value.isofferrelaseenable,
        offerrelase: value.isofferrelaseenable == 1 ? this.offerrelease : [],
        allowtoaddcc: value.allowtoaddcc,
        allowedccmails: value.allowtoaddcc == 1 ? [this.allowedccmails.value] : [],
        offervalidity: value.offervalidity
      }
      this.templateService.updateGenericSetting(payload).subscribe( res => {
        if(res.error){
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          // this.route.navigateByUrl('/dashboard/settings/offer/template');
        }
      });
    }else{
      if(!this.genericSetting.valid) {
        this.genericSetting.markAllAsTouched();
        this.snackBar.open("Please fill all the details")
      }
    }
  }
  
  changeOfferRelease($event: any, item: number){
    if(item == 0){
      this.candArr = ['']
      this.candArr.push($event.source.value);
    } else if(item == 1){
      this.candArr = ['']
      this.candArr.push($event.source.value);
    } else if(item == 2){
      this.agencyArr = [''];
      this.agencyArr.push($event.source.value);
    } else{
      this.agencyArr = [''];
      this.agencyArr.push($event.source.value);
    }  
    const i = this.candArr.findIndex(x=>{ return x== ''});
    if( i !== -1) { this.candArr.splice(i,1); }
    const j = this.agencyArr.findIndex(x=>{ return x== ''});
    if( j !== -1) { this.agencyArr.splice(j,1); }
    this.offerrelease[0]['candidate'] = this.candArr;
    this.offerrelease[1]['agency'] = this.agencyArr;
    this.genericSetting.markAllAsTouched();
  }

  changeOfferIsRelease() {
    this.isOfferRelaseenable = !this.isOfferRelaseenable;
    if(!this.isOfferRelaseenable) {
      this.offerrelease[0]['candidate'] = [''];
      this.offerrelease[1]['agency'] = ['']
    }
    this.genericSetting.markAllAsTouched();
  }
}
