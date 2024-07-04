import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { fadeInUp400ms } from "@vex/animations/fade-in-up.animation";
import { scaleIn400ms } from "@vex/animations/scale-in.animation";
import { ProfilePreviewComponent } from "../profile-preview/profile-preview.component";

@Component({
    selector: 'app-profile-upload',
    templateUrl: './profile-upload.component.html',
    styleUrls: ['./profile-upload.component.scss'],
    animations: [fadeInUp400ms, scaleIn400ms]
  })
  export class ProfileUploadComponent implements OnInit, OnChanges {
    @Input() profile: any = null;
    @ViewChild('fileUpload', {static:true}) fileUpload: ElementRef;
    constructor (private readonly dialog: MatDialog, private _cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
      if(this.profile?.profile_url != null) {
        this.fileUpload.nativeElement.src = this.profile.profile_url;
        this._cdr.detectChanges();
      }
    }

    ngOnInit(): void {
    }

    openFileUpload() {
      this.dialog.open(ProfilePreviewComponent, 
      { width: '700px', 
        data: this.profile,
        disableClose: true
      }).afterClosed().subscribe((profile: any) => {})
    }
  }