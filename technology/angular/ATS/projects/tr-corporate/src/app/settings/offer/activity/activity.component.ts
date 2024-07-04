import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { TemplateService } from '../shared/services/template.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() templateid: string = '';
  today : Date = new Date();
  loggedUserName: string = '';
  activity!:FormGroup

  activites : Activity [] = [];

  constructor(
    private templateService: TemplateService,
    private snackBar: SnackBarService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loggedUserName = localStorage.getItem('userName') || '';
    this.loadAllActivities('','');
  }

  initForm(){
    this.activity = this.fb.group({
      selectDropdown:[''],
      fromDate:['',[Validators.required]],
      toDate:['',[Validators.required]]
    })
  }

  filter(){
    this.activity.markAllAsTouched();
    if(this.activity.valid){
      const { value } = this.activity;
      let fromDate = new Date(value.fromDate);
      const from = fromDate.getFullYear() +'-'+ (fromDate.getMonth()+1) +'-'+ fromDate.getDate()
      let toDate = new Date(value.toDate);
      toDate.setDate(toDate.getDate()+1)
      const to = toDate.getFullYear() +'-'+ (toDate.getMonth()+1) +'-'+ toDate.getDate()
      this.loadAllActivities(from , to);
    } 
  }

    loadAllActivities(from: string, to:string) {
    this.templateService.getOfferActivity(this.templateid, from, to).subscribe( res => {
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.activites = res.data;
      }
    })
  }

  get selectDropdown(): AbstractControl {
    return this.activity.get("selectDropdown") as FormControl;
  }
  get fromDate(): AbstractControl {
    return this.activity.get("fromDate") as FormControl;
  }
  get toDate(): AbstractControl {
    return this.activity.get("toDate") as FormControl;
  }
}

interface Activity {
  offertemplateid: string;
  actiontext: string;
  activitytime: Date;
}
