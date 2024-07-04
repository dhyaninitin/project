import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

@Component({
  selector: 'app-global-templates',
  templateUrl: './global-templates.component.html',
  styleUrls: ['./global-templates.component.scss']
})
export class GlobalTemplatesComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription: Subscription = new Subscription();
  dataSource: any[] = [];
  displayedColumns: string[] = [
    'templatename',
    'description',
    'templatetype',
    'action'
  ];

  sort_by = [
    {name: 'Name'},
    {name: 'Last Updated'}
  ]
  showNoTemplateFoundText: boolean = false;
  totalDataCount: number = 0;
  page: number = 1;
  size: number = 5;
  checkTemplateData:any[]=[];
  searchForm!: FormGroup;
  sortBy: string = '';
  searchedKeyword: string = '';
  allTemplatesData:any = {};
  currentPage: number = 0;
  totalPages!: number;
  startIndex!: number;
  endIndex!: number;
  userId: any;

  constructor
  (
    private _empSer:EmployeeService,
    private snackBar:MatSnackBar,
    private dialog:MatDialog,
    private router:Router,
    private fb:FormBuilder,
    private _authSer: AuthService
  ){ this.getUserId() }

  ngOnInit(): void {
    this.initForm();
    this.page = this._empSer.globalTemplatePage;
    this.size = this._empSer.globalTemplateSize;
    this.searchedKeyword = this._empSer.globalTemplateSearchedKeyword;
    this.sortBy = this._empSer.globalTemplateSortBy;
    this.searchForm.patchValue({search_box: [this.searchedKeyword]})
    if(this.searchedKeyword !== '') {
      this._empSer.globalTemplatePage = this.page;
      this._empSer.globalTemplateSize = this.size;
      this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
      this._empSer.globalTemplateSortBy = this.sortBy;
      this.page = 1;
      this._empSer.getGlobalTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
        if (res.status == 200) {
          this.allTemplatesData = res;
          this.dataSource = [...res.userSpecificTemplates]
          this.totalDataCount = res.totalData;

          if (this.dataSource.length == 0) {
            this.totalDataCount = res.totalData;

            this.searchedKeyword = '';
            this._empSer.globalTemplateSearchedKeyword = '';
            this._empSer.globalTemplateSortBy = this.sortBy;
          } else {
            this.totalDataCount = res.totalData;
            
            this._empSer.globalTemplatePage = this.page;
            this._empSer.globalTemplateSize = this.size;
            this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
            this._empSer.globalTemplateSortBy = this.sortBy;
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
      this.getGlobalTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
    }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => {
      // Check if searchedKeyword is empty, then call getEmployeeTemplates() method
      if(this.searchedKeyword === '') {
        this.getGlobalTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
      } else {
        this._empSer.globalTemplatePage = this.page;
        this._empSer.globalTemplateSize = this.size;
        this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
        this._empSer.globalTemplateSortBy = this.sortBy;
        this.page = 1;
        this._empSer.getGlobalTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
          if (res.status == 200) {
            this.allTemplatesData = res;
            this.dataSource = [...res.userSpecificTemplates]
            this.totalDataCount = res.totalData;
  
            if (this.dataSource.length == 0) {
              this.totalDataCount = res.totalData;
  
              this.searchedKeyword = '';
              this._empSer.globalTemplateSearchedKeyword = '';
              this._empSer.globalTemplateSortBy = this.sortBy;
            } else {
              this.totalDataCount = res.totalData;
              
              this._empSer.globalTemplateSize = this.size;
              this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
              this._empSer.globalTemplateSortBy = this.sortBy;
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

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  initForm() {
    this.searchForm = this.fb.group({
      search_box: ['']
    })
  }

  ngAfterViewInit() {
    this.getGlobalTemplates(this.page, this.size, this.searchedKeyword, this.sortBy);
  }

  getGlobalTemplates(page: number, size: number, searchedKeyword: string, sortBy: string) {
    this._empSer.getGlobalTemplates(this.userId, page, size, searchedKeyword, sortBy).subscribe((res: any) => {
      if(res.status == 200) {
        this.allTemplatesData = res;
        this.dataSource = [...res.userSpecificTemplates];
        this.totalDataCount = res.totalData;
        this.checkTemplateData = this.dataSource;
        if(this.dataSource.length == 0) {
          this.showNoTemplateFoundText = true;
        }
        if(this.dataSource.length >= 1) {
          this.showNoTemplateFoundText = false;
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
    })
  }

  onSearchTemplate(event: any) {
    this.searchedKeyword = event.target.value;
    if (this.searchedKeyword == '') {
      this.searchedKeyword = '';
      this.currentPage = this._empSer.globalTemplatePage;
      this.size = this._empSer.globalTemplateSize;
      this._empSer.globalTemplateSearchedKeyword = '';
      this.sortBy = this._empSer.globalTemplateSortBy;
      this.getGlobalTemplates(this.currentPage, this.size, this.searchedKeyword, this.sortBy);
    } else {
      this.searchSubject.next(this.searchedKeyword);
    }
  }

  onShortBy() {
    this._empSer
      .getGlobalTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy)
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.allTemplatesData = res;
          this.dataSource = [...res.userSpecificTemplates];
          this.totalDataCount = res.totalData;
          this._empSer.globalTemplateSortBy = this.sortBy;
        }
      });
  }
  
  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    const sortBy = this.sortBy || '';
    const searchedKeyword = this.searchedKeyword || '';
    this.currentPage = this.page;

    this._empSer.globalTemplatePage = this.page;
    this._empSer.globalTemplateSize = this.size; 
    this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
    this._empSer.globalTemplateSortBy = this.sortBy;
    this.getGlobalTemplates(this.page, this.size,searchedKeyword,sortBy);
  }

  addGlobalTemplate() {
    this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
    this._empSer.globalTemplateSortBy = this.sortBy;
    this._empSer.employeeData = [];
    this._empSer.getComData = [];
    this.router.navigateByUrl('/dashboard/add-global-template');
    this._empSer.editGlobalTemplateSubject.next({isEdit: false});
  }

  onEditGlobalTemplate(element: any) {
    const payload = {
      templatename: element.templatename,
      description: element.description,
      templatetype: element.templatetype,
      html: element.html,
      isEdit: true,
      id: element._id
    }
    this.router.navigateByUrl('/dashboard/add-global-template');
    this._empSer.editGlobalTemplateSubject.next(payload);
  }

  openDelDialog(id: any) {
    this.dialog
    .open(DeleteDialogComponent, {
      width: '350px',
      height: 'auto',
      disableClose: true,
      data: 'global template',
      panelClass: 'confirm-dialog-container',
    })
    .afterClosed()
    .subscribe((res: any) => {
      if (res == true) {
        this._empSer.deleteGlobalTemplate(id).subscribe((res: any) => {
          if(res.status == 200) {
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            if(this.dataSource.length == 1 && this.page >= 2 && this.searchedKeyword == '') {
              let previousPage = this.page - 1
              this.page = previousPage
              this.getGlobalTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
            }else if(this.dataSource.length == 1 && this.page == 1 && this.searchedKeyword !== '') {
              this.searchedKeyword = ''
              this._empSer.globalTemplateSearchedKeyword = '';
              this.searchForm.patchValue({search_box: ''})
              this.page = this._empSer.globalTemplatePage;
              this.size = this._empSer.globalTemplateSize;
              this.sortBy = this._empSer.globalTemplateSortBy;
              this.getGlobalTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
            }else if(this.dataSource.length == 1 && this.page >= 2 && this.searchedKeyword !== '') {
              let previousPage = this.page - 1
              this.page = previousPage
              this.getGlobalTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
            }else {
              if(this.searchedKeyword !== '') {
                this._empSer.globalTemplatePage = this.page;
                this._empSer.globalTemplateSize = this.size;
                this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
                this._empSer.globalTemplateSortBy = this.sortBy;
                this.page = 1;
                this._empSer.getGlobalTemplates(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
                  if (res.status == 200) {
                    this.allTemplatesData = res;
                    this.dataSource = [...res.userSpecificTemplates]
                    this.totalDataCount = res.totalData;
          
                    if (this.dataSource.length == 0) {
                      this.totalDataCount = res.totalData;
        
                      this.searchedKeyword = '';
                      this._empSer.globalTemplateSearchedKeyword = '';
                      this._empSer.globalTemplateSortBy = this.sortBy;
                    } else {
                      this.totalDataCount = res.totalData;
                      
                      this._empSer.globalTemplatePage = this.page;
                      this._empSer.globalTemplateSize = this.size;
                      this._empSer.globalTemplateSearchedKeyword = this.searchedKeyword;
                      this._empSer.globalTemplateSortBy = this.sortBy;
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
                this.getGlobalTemplates(this.page, this.size,this.searchedKeyword,this.sortBy);
              }
            }
          }
        })
      }
    });
  }
}
