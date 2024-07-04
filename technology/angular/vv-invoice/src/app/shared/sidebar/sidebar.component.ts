import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserFeedbackComponent } from 'src/app/employee/user-feedback/user-feedback.component';
import { EmployeeService } from '../services/employee.service';
import { AuthService } from '../services/auth.service';
import { Observable, Subscriber } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  userId: any;
  userName: any;
  showEditIcon = false;
  selectedImage: any;
  imageToBase64: any = '';

  constructor
  (
    private dialog: MatDialog,
    private _empSer: EmployeeService,
    private _authSer: AuthService,
    private snackBar:MatSnackBar,
    private _sanitizer: DomSanitizer  
    ) { this.getUserDetails() }

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this._empSer.getUserProfile(this.userId).subscribe((res: any) => {
      if(res.image !== null) {
        this.selectedImage = this._sanitizer.bypassSecurityTrustUrl(res.image);
      }else{
        this.selectedImage = "../../../assets/icon/user-default.png"
      }
    })
  }

  getUserDetails() {
    if (this._authSer.userId && this._authSer.userEmail) {
      this.userId = this._authSer.userId;
      this.userName = this._authSer.userName;
    } else {
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId
      this.userName = this._authSer.userName;
    }
  }

  openFeedbackDialog() {
    this.dialog.open(UserFeedbackComponent, {
      width: '25rem',
      height: '645px',
      disableClose: true,
    });
  }

  onComponentChange() {
    this._empSer.employeeData = [];
    this._empSer.getComData = [];
    localStorage.removeItem('templateid');
    localStorage.removeItem('templateType');
  }

  selectedImageForUpload(event: any) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.convertToBase64(file)
  };

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber)
    })

    observable.subscribe((data: any) => {
      this.selectedImage = data
      this.imageToBase64 = data

      this._empSer.uploadUserProfile(this.userId, this.imageToBase64).subscribe((res: any) => {
        if(res.status == 200) {
          this.snackBar.open(res.message, 'Cancel' ,{
            duration: 3000,
            panelClass: ['success-snackbar']
          })
        }
      })
    })
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      subscriber.next(fileReader.result);
      subscriber.complete()
    }

    fileReader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    }
  }
  
  onImageHover(event: MouseEvent) {
    const container = event.target as HTMLElement;
    const icon = container.querySelector('.edit-icon') as HTMLElement;
    if(icon) {
      icon.style.display = 'block';
    }
  }
  
  onImageLeave(event: MouseEvent) {
    const container = event.target as HTMLElement;
    const icon = container.querySelector('.edit-icon') as HTMLElement;
    icon.style.display = 'none';
  }

}
