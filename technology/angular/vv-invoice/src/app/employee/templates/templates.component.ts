import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { ViewTemplateComponent } from '../view-template/view-template.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit , OnDestroy, AfterViewInit {
   
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription: Subscription = new Subscription();
  
  displayedColumns: string[] = [
    'templatename',
    'templatetype',
    'status',
    'action',
  ];

  sort_by = [
    {name: 'Name'},
    {name: 'Status'},
    {name: 'Last Updated'},
  ]

  dataSource: any[] = [];
  allTemplatesData:any = {};
  page: number = 1;
  size: number = 5;
  totalDataCount: number = 0;
  checkTemplateData:any[]=[];
  noDataFoundImg = '../../../assets/icon/no-data-found.jpg';
  showNoDataFoundImg: boolean = false;
  showNoDataFoundText: boolean = false;
  sortBy: string = '';
  searchedKeyword: string = '';
  hidePageSizeOption:boolean = false;
  currentPage: number = 0;
  totalPages!: number;
  startIndex!: number;
  endIndex!: number;
  searchForm!: FormGroup;
  previousPage: number = 0;
  userId: any;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private _empSer: EmployeeService,
    private _authSer:AuthService,
    private snackBar: MatSnackBar,
    private fb:FormBuilder
  ){ this.getUserId() }

  ngOnInit() {
    this.initForm()
    // Call getEmployeeTemplates() method to load data at first
    this.page = this._empSer.templatePage;
    this.size = this._empSer.templateSize;
    this.searchedKeyword = this._empSer.templateSearchedKeyword;
    this.sortBy = this._empSer.templateSortBy;
    this.searchForm.patchValue({search_box: [this.searchedKeyword]})
    if(this.searchedKeyword !== '') {
      this._empSer.templatePage = this.page;
      this._empSer.templateSize = this.size;
      this._empSer.templateSearchedKeyword = this.searchedKeyword;
      this._empSer.templateSortBy = this.sortBy;
      this.page = 1;
      this._empSer.getEmployeeTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
        if (res.status == 200) {
          this.allTemplatesData = res;
          this.dataSource = res.templateData;
          this.totalDataCount = res.totalDataCount;

          if (this.dataSource.length == 0) {
            this.hidePageSizeOption = true;
            this.showNoDataFoundText = true;
            this.totalDataCount = res.totalDataCount;

            this.searchedKeyword = '';
            this._empSer.templateSearchedKeyword = '';
            this._empSer.templateSortBy = this.sortBy;
          } else {
            this.hidePageSizeOption = false;
            this.showNoDataFoundText = false;
            this.totalDataCount = res.totalDataCount;
            
            this.page = this._empSer.templatePage;
            this.size = this._empSer.templateSize;
            this._empSer.templateSearchedKeyword = this.searchedKeyword;
            this._empSer.templateSortBy = this.sortBy;
          }

          if(this.paginator) {
            if (this.paginator.pageIndex === 0) {
              this.paginator.firstPage();
            }
            this.paginator.pageSize = this.size;
            this.paginator.pageIndex = 0;
          }
        }
      });
    }else{
      this.getEmployeeTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
    }
    
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => {
      // Check if searchedKeyword is empty, then call getEmployeeTemplates() method
      if(this.searchedKeyword === '') {
        this.getEmployeeTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
      } else {
        this._empSer.templatePage = this.page;
        this._empSer.templateSize = this.size;
        this._empSer.templateSearchedKeyword = this.searchedKeyword;
        this._empSer.templateSortBy = this.sortBy;
        this.page = 1;
        this._empSer.getEmployeeTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
          if (res.status == 200) {
            this.allTemplatesData = res;
            this.dataSource = res.templateData;
            this.totalDataCount = res.totalDataCount;
  
            if (this.dataSource.length == 0) {
              this.hidePageSizeOption = true;
              this.showNoDataFoundText = true;
              this.totalDataCount = res.totalDataCount;

              this.searchedKeyword = '';
              this._empSer.templateSearchedKeyword = '';
              this._empSer.templateSortBy = this.sortBy;
            } else {
              this.hidePageSizeOption = false;
              this.showNoDataFoundText = false;
              this.totalDataCount = res.totalDataCount;
              
              this._empSer.templatePage = this.page;
              this._empSer.templateSize = this.size;
              this._empSer.templateSearchedKeyword = this.searchedKeyword;
              this._empSer.templateSortBy = this.sortBy;
            }
  
            if(this.paginator) {
              if (this.paginator.pageIndex === 0) {
                this.paginator.firstPage();
              }
              this.paginator.pageSize = this.size;
              this.paginator.pageIndex = 0;
            }
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    this.getEmployeeTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }
  
  initForm() {
    this.searchForm = this.fb.group({
      search_box: ['']
    })
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  onStatusChange(event: any, templateid: any) {
    let status = event.checked == true ? 1 : 0;
    this._empSer.onTemplateStatusChange(templateid, status).subscribe((res: any) => {
      if (res.status == 200) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        if(this.searchedKeyword !== '') {
            this.page = this._empSer.templatePage;
            this.size = this._empSer.templateSize;
            this.searchedKeyword = this._empSer.templateSearchedKeyword;
            this.sortBy = this._empSer.templateSortBy;
            this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
        }else{
          this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
        }
      }
    });
  }

  onAddTemplate() {
    this._empSer.showSelectComDropdown = false;
    this._empSer.templateSearchedKeyword = this.searchedKeyword;
    this._empSer.templateSortBy = this.sortBy;
    this._empSer.employeeData = [];
    this._empSer.getComData = [];
    localStorage.removeItem('templateid');
    localStorage.removeItem('templateType');
    (<any>this._empSer.employeeData).isEdit = false;
  }

  getEmployeeTemplates(page: number, size: number, searchedKeyword: string, sortBy: string) {
    this._empSer.getEmployeeTemplates(this.userId, page, size, searchedKeyword, sortBy).subscribe((res: any) => {
      if (res.status == 200) {
        this.allTemplatesData = res;
        this.dataSource = res.templateData;
        this.checkTemplateData = res.templateData;
        this.totalDataCount = res.totalDataCount;

        if (res.templateData.length == 0) {
          this.showNoDataFoundImg = true;
        }
        if (res.templateData.length >= 1) {
          this.showNoDataFoundText = false;
        }

        if(this.paginator){
          // Calculate the page numbers
          this.page = page;
          this.size = size;
          this.currentPage = page;
          this.totalPages = Math.ceil(this.totalDataCount / this.size);
          this.startIndex = (this.page - 1) * this.size + 1;
          this.endIndex = Math.min(this.startIndex + this.size - 1, this.totalDataCount);

          // Set the paginator properties
          this.paginator.length = this.totalDataCount;
          this.paginator.pageIndex = this.page - 1;
          this.paginator.pageSize = this.size;

          // Disable the next button if the last page is reached
          if (this.paginator.pageIndex === this.totalPages - 1) {
            this.paginator._intl.nextPageLabel = '';
          } else {
            this.paginator._intl.nextPageLabel = 'Next page';
          }
        }
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    const sortBy = this.sortBy || '';
    const searchedKeyword = this.searchedKeyword || '';
    this.currentPage = this.page

    this._empSer.templatePage = this.page;
    this._empSer.templateSize = this.size; 
    this._empSer.templateSearchedKeyword = this.searchedKeyword;
    this._empSer.templateSortBy = this.sortBy;
    this.getEmployeeTemplates(this.page, this.size,searchedKeyword,sortBy);
  }

  onSearchTemplate(event: any) {
    this.searchedKeyword = event.target.value;
    if (this.searchedKeyword == '') {
      this.hidePageSizeOption = false;
      this.showNoDataFoundText = false;
      this.searchedKeyword = '';
      this.size = this._empSer.templateSize;
      this._empSer.templateSearchedKeyword = '';
      this.sortBy = this._empSer.templateSortBy;
      this.getEmployeeTemplates(this.currentPage, this.size, this.searchedKeyword, this.sortBy);
    } else {
      this.searchSubject.next(this.searchedKeyword);
    }
  }

  onShortBy() {
    this._empSer
      .getEmployeeTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy)
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.allTemplatesData = res
          this.dataSource = res.templateData
          this.totalDataCount = res.totalDataCount
          this._empSer.templateSortBy = this.sortBy
        }
      });
  }

  onEditTemplate(templateid: any) {
    let templateData = [];
    templateData = this.allTemplatesData.templateData.filter((x: any) => x.templateid === templateid);
    templateData.map((x: any) => (x.stepName = 'basic'));

    let componentData = [];
    componentData = this.allTemplatesData.componentData.filter((x: any) => x.templateid === templateid);
    componentData.map((x: any) => (x.stepName = 'component'));

    let libraryData = [];
    libraryData = this.allTemplatesData.libraryData.filter((x: any) => x.templateid === templateid);
    libraryData.map((x: any) => (x.stepName = 'library'));

    this._empSer.employeeData.splice(0,this._empSer.employeeData.length,...templateData,...componentData,...libraryData);
    (<any>this._empSer.employeeData).isEdit = true;
 
    this._empSer.templatePage = this.page;
    this._empSer.templateSize = this.size;
    this._empSer.templateSearchedKeyword = this.searchedKeyword;
    this._empSer.templateSortBy = this.sortBy;

    if(componentData.length >= 1) {
      this._empSer.showSelectComDropdown = true
    }
    this.router.navigateByUrl('/dashboard/add-template');
  }

  onViewTemplate(templateid: any) {
    let templateData = [];
    templateData = this.allTemplatesData.templateData.filter((x: any) => x.templateid === templateid);
    templateData.map((x: any) => (x.stepName = 'basic'));

    let componentData = [];
    componentData = this.allTemplatesData.componentData.filter((x: any) => x.templateid === templateid);
    componentData.map((x: any) => (x.stepName = 'component'));

    let libraryData = [];
    libraryData = this.allTemplatesData.libraryData.filter((x: any) => x.templateid === templateid);
    libraryData.map((x: any) => (x.stepName = 'library'));

    this._empSer.employeeData.splice(0,this._empSer.employeeData.length,...templateData,...componentData,...libraryData);

    this.dialog.open(ViewTemplateComponent,{
      width: '700px',
      height: '720px',
      disableClose: true,
      data: {
        templateData: templateData,
        componentData: componentData,
        libraryData: libraryData
      }
    })
  }

  openDelDialog(element: any) {
    if(element.status == true) {
      this.snackBar.open('Deactivate status first !' , 'Cancel' ,{
        duration: 3000,
        panelClass: ['error-snackbar']
      })
    }else{
      this.dialog
      .open(DeleteDialogComponent, {
        width: '350px',
        height: 'auto',
        disableClose: true,
        data: 'template',
        panelClass: 'confirm-dialog-container',
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res == true) {
          this._empSer
          .deleteEmployeeTemplate(element.templateid, this.userId)
          .subscribe((res: any) => {
            if (res.status == 200) {
              this.snackBar.open(res.message, 'Cancel', {
                duration: 3000,
                panelClass: 'success-snackbar'
              });
              if(this.dataSource.length == 1 && this.page >= 2 && this.searchedKeyword == '') {
                let previousPage = this.page - 1
                this.page = previousPage
                this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
              }else if(this.dataSource.length == 1 && this.searchedKeyword !== '' && this.page == 1) {
                this.searchedKeyword = ''
                this.searchForm.patchValue({search_box: ''})
                this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
              }else if(this.dataSource.length == 1 && this.page >= 2 && this.searchedKeyword !== '') {
                let previousPage = this.page - 1
                this.page = previousPage
                this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
              }
              else{
                if(this.searchedKeyword !== '') {
                  this._empSer.templatePage = this.page;
                  this._empSer.templateSize = this.size;
                  this._empSer.templateSearchedKeyword = this.searchedKeyword;
                  this._empSer.templateSortBy = this.sortBy;
                  this.page = 1;
                  this._empSer.getEmployeeTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
                    if (res.status == 200) {
                      this.allTemplatesData = res;
                      this.dataSource = res.templateData;
                      this.totalDataCount = res.totalDataCount;
            
                      if (this.dataSource.length == 0) {
                        this.hidePageSizeOption = true;
                        this.showNoDataFoundText = true;
                        this.totalDataCount = res.totalDataCount;
            
                        this.searchedKeyword = '';
                        this._empSer.templateSearchedKeyword = '';
                        this._empSer.templateSortBy = this.sortBy;
                      } else {
                        this.hidePageSizeOption = false;
                        this.showNoDataFoundText = false;
                        this.totalDataCount = res.totalDataCount;
                        
                        this.page = this._empSer.templatePage;
                        this.size = this._empSer.templateSize;
                        this._empSer.templateSearchedKeyword = this.searchedKeyword;
                        this._empSer.templateSortBy = this.sortBy;
                      }
            
                      if(this.paginator) {
                        if (this.paginator.pageIndex === 0) {
                          this.paginator.firstPage();
                        }
                        this.paginator.pageSize = this.size;
                        this.paginator.pageIndex = 0;
                      }
                    }
                  });
                }else{
                  this.getEmployeeTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
                }
              }
            }
          });
        }
      });
    }
  }
}
