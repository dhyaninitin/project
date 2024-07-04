import { Component, ElementRef, Inject, OnInit, ViewChild, } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
})
export class LibraryComponent implements OnInit {
  @ViewChild('img', { static: false }) public img!: ElementRef<HTMLImageElement>;
  showCloseBtn: boolean = false
  page: number = 1;
  size: number = 5;
  capturedImage: any;
  allTemplates: any[]=[];
  sortedobj: any = {};
  sortedTemplates: any[]=[];
  customTemplatesData: any[]=[];
  entries:any=[];
  showNoDataFoundText: boolean = false;
  insert_padding: boolean = true;
  selectTemplateQuestion = 'If you select template from here then the the editor data will be replaced to this template.';
  userId: any;

  constructor
    (
      public dialogRef: MatDialogRef<LibraryComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private _empSer: EmployeeService,
      private router: Router,
      private dialog: MatDialog,
      private snackBar:MatSnackBar,
      private _authSer:AuthService,
      private sanitizer:DomSanitizer
    ){ this.getUserId() }

    customOptions: OwlOptions = {
      loop: true,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: false,
      dots: false,
      navSpeed: 600,
      navText: ['&#8249', '&#8250;'],
      responsive: {
        0: {
          items: 1
        },
        400: {
          items: 2
        },
        740: {
          items: 3
        },
        940: {
          items: 4
        }
      },
      nav: true
    }

  ngOnInit() {
    this.getLibraryTemplates()
    if (this.data.showCloseBtn == true) {
      this.showCloseBtn = this.data.showCloseBtn
    } else {
      this.showCloseBtn = false;
    }
    this.insert_padding = this.data.insert_padding
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  getLibraryTemplates() {
    this._empSer.getLibraryTemplates(this.userId).subscribe((res: any) => {
    if(res.status == 200) {
      this.customTemplatesData = res.customTemplatesData
      this.allTemplates = [...this.customTemplatesData]
      if(this.allTemplates.length == 0) {
        this.showNoDataFoundText = true;
      }   
    }
    let sorted: any = {};
      for (var i = 0, max = this.allTemplates.length; i < max; i++) {
        if (sorted[this.allTemplates[i].category] == undefined) {
          sorted[this.allTemplates[i].category] = [];
        }
        sorted[this.allTemplates[i].category].push(this.allTemplates[i]);
        if(this.allTemplates[i].html) {
          this.allTemplates[i].html = this.sanitizer.bypassSecurityTrustHtml(this.allTemplates[i].html)
        }
      }
      this.entries = Object.entries(sorted)
    })
  }

  selectTemplate(data: any) {
    let answer = window.confirm(this.selectTemplateQuestion);
    if(answer) {
      this.dialogRef.close(data);
      this.showCloseBtn = false;
    }
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.getLibraryTemplates();
  }

  onCloseDialog() {
    this.dialog.closeAll()
  }

  setTemplate(data: any) {
    this.router.navigateByUrl('/dashboard/add-template')
    localStorage.setItem('html', data)
    this._empSer.employeeData = []
  }

  onDeleteTemplate(id: any) {
  this.dialog.open(DeleteDialogComponent, {
    width: '350px',
    height: 'auto',
    disableClose: true,
    data: 'template',
    panelClass: 'confirm-dialog-container',
  })
    .afterClosed()
    .subscribe((res: any) => {
      if (res == true) {
        this._empSer.deleteCustomTemplate(id).subscribe((res: any) => {
          if (res.status == 200) {
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['success-snackbar']
            })
            this.getLibraryTemplates();
          }
        })
      }
    });
  }
}