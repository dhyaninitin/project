import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { base64ToFile, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import * as actions from 'app/store/vehicledata/vehicledata.actions';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss']
})
export class EditModalComponent implements OnInit {
  public itemForm: FormGroup;
  public saving: Boolean = false;

  // image upload
  imageChangedEvent: any = '';
  croppedImage: any = '';
  uploadStart: boolean = false;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditModalComponent>,
    private fb: FormBuilder,
    private snack$: MatSnackBar,
    private store$: Store<AppState>,
    private _cdr: ChangeDetectorRef,
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      image: [''],
    });
   }

  ngOnInit(): void {
    this.itemForm.setValue({ 
      name: this.data.payload.name,
      image: null
    });

    if(this.data.payload?.file_url != null) {
      this.croppedImage = this.data.payload.file_url;
    }
  }

  isFileAllowed(fileExtention: string) {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'HEIF', 'HEVC','pdf'];
    if(allowedExtensions.includes(fileExtention)) {
      return true;
    } else {
      return false;
    }
  }
  
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
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

  submit(){
    let payload:any = {}
    if(this.croppedImage != '' && this.imageChangedEvent != '') {
      const file = this.imageChangedEvent.target.files[0];
      // const file = this.base64ToFile(this.croppedImage, 'croppedImg.png');
      const fileName = file.name.split('.');
      const fileExtention = fileName[fileName.length-1];
      if(this.isFileAllowed(fileExtention) && this.isFileSizeAllowed(file.size)) {
        payload.file = file;
        payload.file_extention = fileExtention;
      }else {
        this.snack$.open("File type is not allowed", 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
      }
    }
    payload.file_name = this.itemForm.value.name;
    payload.id = this.data.payload.id;
    this.checkAndcallStore(this.data.payload.from,payload);
    this.dialogRef.close();
    this._cdr.detectChanges();
  }

  checkAndcallStore(type:string,payload:any){
    switch (type) {
      case 'brand':
        return this.store$.dispatch(new actions.UpdateBrandValues(payload));
      case 'model':
        return this.store$.dispatch(new actions.UpdateModelValues(payload));
      case 'trim':
        return this.store$.dispatch(new actions.UpdateTrim(payload));
      default:
        return true;
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
