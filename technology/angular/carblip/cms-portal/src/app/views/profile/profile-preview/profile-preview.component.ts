import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { fadeInUp400ms } from "@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "@vex/animations/scale-in.animation";
import { Profile, UpdateProfile } from "app/shared/models/user.model";
import { PortalUserService } from "app/shared/services/apis/portalusers.service";
import { AppState } from "app/store";
import * as actions from 'app/store/auth/authentication.action';
import {
  dataSelector
} from 'app/store/auth/authentication.selector';
import { debounceTime, Subject, takeUntil, tap } from "rxjs";
import { base64ToFile, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
    selector: 'app-profile-preview',
    templateUrl: './profile-preview.component.html',
    styleUrls: ['./profile-preview.component.scss'],
    animations: [fadeInUp400ms, scaleIn400ms]
  })
  export class ProfilePreviewComponent implements OnInit {
  private onDestroy$ = new Subject<void>();
  
  imageChangedEvent: any = '';
  croppedImage: any = '';
  uploadStart: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ProfilePreviewComponent>,
    private portalUserService$: PortalUserService, 
    @Inject(MAT_DIALOG_DATA) public profile: any,
    private store$: Store<AppState>,
    private _cdr: ChangeDetectorRef,
    private snack$: MatSnackBar
  ) {}

  ngOnInit() {
    if(this.profile?.profile_url != null) {
      this.croppedImage = this.profile.profile_url;
    }
  }

  uploadFile($event: any) {
    const fileData = $event;
    const fileName = fileData.name.split('.');
    const fileExtention = fileName[fileName.length-1];
    if(this.isFileAllowed(fileExtention) && this.isFileSizeAllowed(fileData.size)) {
      this.portalUserService$.uploadProfile(fileExtention, $event).subscribe(response=> {
        if(response.url) {
          this.updateProfileDetails(response);
        }
      });
    } else {
      this.snack$.open("File type is not allowed", 'OK', {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
    }
  }

  isFileAllowed(fileExtention: string) {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'HEIF', 'HEVC'];
    if(allowedExtensions.includes(fileExtention)) {
      return true;
    } else {
      return false;
    }
  }

  isFileSizeAllowed(fileSize: number) {
    const sizeInKb = fileSize / 1024;
    const sizeInMb = sizeInKb / 1024;
    if(sizeInMb < 5) {
      return true
    } else {
      return false;
    }
  }

  updateProfileDetails(res: any) {
    const payload: UpdateProfile = {
      first_name: this.profile.first_name,
      last_name: this.profile.last_name,
      profile_name: res.filename,
      profile_path: res.filepath
    };
    this.store$.dispatch(new actions.UpdateUserInfo(payload));
    this.dialogRef.close();
    this._cdr.detectChanges();
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
  }
  imageLoaded(image: LoadedImage) {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }

  startUpload() {
    if(this.croppedImage != '' && this.imageChangedEvent != '') {
      const file = this.base64ToFile(this.croppedImage, 'croppedImg.png');
      this.uploadStart = true;
      this.snack$.open("Uploading...", 'OK', {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
      this.uploadFile(file);
    } else {
      this.snack$.open("Please choose a picture to upload", 'OK', {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
    }
  }

  base64ToFile(data: any, filename: any) {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}