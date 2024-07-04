import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.scss'],
})
export class UserFeedbackComponent implements OnInit {
  ratingArr: boolean[] = [];
  starRating = 0;
  starCount = 5;
  userRatingValue: number = 0;
  userFeedbackForm!: FormGroup;
  userFeedbackData: any[]=[];
  selectedCategory:string = 'Suggestion';
  reactionMsg: any;
  tab : any = 'tab1';
  tab1 : any;
  tab2 : any;
  tab3 : any;
  userId: any;
  userName: any;
  userEmail: any;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef:MatDialogRef<UserFeedbackComponent>,
    private fb: FormBuilder,
    private _empSer: EmployeeService,
    private snackBar: MatSnackBar,
    private _authSer:AuthService
  ) { this.ratingArr = Array(this.starCount).fill(false) }

  ngOnInit(): void {
    this.initForm();
    this.getUserDetails();
    if(this.data !== null || undefined) {
      this.userFeedbackForm.patchValue({
        userFeedback: [this.data.feedback],
        isEdit: true
      })
      this.ratingArr = Array(this.starCount).fill(this.starRating = this.data.rating)
    }
  }

  getUserDetails() {
    if(this._authSer.userId && this._authSer.userEmail && this._authSer.userName) {
      this.userId = this._authSer.userId;
      this.userName = this._authSer.userName;
      this.userEmail = this._authSer.userEmail;
    }else {
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
      this.userName = this._authSer.userName;
      this.userEmail = this._authSer.userEmail;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  initForm() {
    this.userFeedbackForm = this.fb.group({
      userFeedback: ['', Validators.required],
      isEdit: false,
    });
  }

  returnStar(i: number) {
    if (this.starRating >= i + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  starRatingBtn(i: number) {
  this.starRating = i + 1;
  switch (this.starRating) {
    case 1:
      this.reactionMsg = 'Very bad';
      break;
    case 2:
      this.reactionMsg = 'Bad';
      break;
    case 3:
      this.reactionMsg = 'Average';
      break;
    case 4:
      this.reactionMsg = 'Good';
      break;
    case 5:
      this.reactionMsg = 'Wonderful';
      break;
    default:
      this.reactionMsg = '';
    }
  }

  onSelectCategory(event: any) {
    if(event.currentTarget.id=='first'){
      this.tab = 'tab1';
    }else if(event.currentTarget.id=='second'){
      this.tab = 'tab2';
    }else{
      this.tab = 'tab3';
    }    
    this.selectedCategory = event.srcElement.innerText
  }

  onSubmit() {
    if (this.userFeedbackForm.valid && this.userFeedbackForm.value.isEdit == false) {
      let payload = {
        starRating: this.starRating,
        userData: this.userFeedbackForm.value,
        userName: this.userName,
        userEmail: this.userEmail,
        userId: this.userId,
        category: this.selectedCategory
      };
      this._empSer.postUserFeedback(payload).subscribe((res: any) => {
        if (res.status == 200) {
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close();
        }
      });
    }else if(this.userFeedbackForm.value.isEdit == true) {
      let payload = {
        id: this.data.id,
        starRating: this.starRating,
        userData: this.userFeedbackForm.value,
        category: this.selectedCategory
      };
      this._empSer.updateUserFeedback(payload).subscribe((res: any) => {
        if(res.status == 200) {
          this.snackBar.open(res.message , 'Cancel' , {
            duration: 3000,
            panelClass: ['success-snackbar']
          })
          this.dialogRef.close();
        }
      })
    }
  }
}
