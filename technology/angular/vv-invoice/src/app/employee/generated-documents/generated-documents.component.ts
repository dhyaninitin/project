import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { ViewDocumentComponent } from './view-document/view-document.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generated-documents',
  templateUrl: './generated-documents.component.html',
  styleUrls: ['./generated-documents.component.scss']
})
export class GeneratedDocumentsComponent implements OnInit ,OnDestroy ,AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription: Subscription = new Subscription();

  generatedDocumentsLength: number = 0;
  showNoDataFoundText: boolean = false;
  dataSource: any[] = [];
  checkDocumentData:any[]=[];
  userId: any;
  page: number = 1;
  size: number = 5;
  totalDataCount: any;
  sortBy: string = '';
  searchedKeyword: string = '';
  currentPage: number = 0;
  totalPages!: number;
  startIndex!: number;
  endIndex!: number;
  searchForm!: FormGroup;

  displayedColumns: string[] = [
    'templatetype',
    'generatedat',
    'action'
  ];

  sort_by = [
    {name: 'Based On Offer'},
    {name: 'Based On Total Compensation'},
    {name: 'Based On Salary Slip'},
    {name: 'Custom Type'}
  ]

  constructor
  (
    private _empSer:EmployeeService,
    private _authSer:AuthService,
    private dialog:MatDialog,
    private fb: FormBuilder,
    private snackBar:MatSnackBar
  ){ this.getUserId() }

  ngOnInit() {
    this.initForm();
        // Call getEmployeeTemplates() method to load data at first
        this.page = this._empSer.generatedDocumentPage;
        this.size = this._empSer.generatedDocumentSize;
        this.searchedKeyword = this._empSer.generatedDocumentSearchedKeyword;
        this.sortBy = this._empSer.generatedDocumentSortBy;
        this.searchForm.patchValue({search_box: [this.searchedKeyword]})
        if(this.searchedKeyword !== '') {
          this._empSer.generatedDocumentPage = this.page;
          this._empSer.generatedDocumentSize = this.size; 
          this._empSer.generatedDocumentSortBy = this.sortBy;
          this._empSer.generatedDocumentSearchedKeyword = this.searchedKeyword;
          this.page = 1;
          this._empSer.getGeneratedDocuments(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
            if (res.status == 200) {
              this.dataSource = res.data;
              this.totalDataCount = res.totalDataCount;
    
              if (this.dataSource.length == 0) {
                this.showNoDataFoundText = true;
                this.totalDataCount = res.totalDataCount;
                this.checkDocumentData = res.data;
    
                this.searchedKeyword = '';
                this._empSer.generatedDocumentSearchedKeyword = '';
                this._empSer.generatedDocumentSortBy = this.sortBy;
              } else {
                this.showNoDataFoundText = false;
                this.totalDataCount = res.totalDataCount;
                
                this.page = this._empSer.generatedDocumentPage;
                this.size = this._empSer.generatedDocumentSize;
                this._empSer.generatedDocumentSearchedKeyword = this.searchedKeyword;
                this._empSer.generatedDocumentSortBy = this.sortBy;
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
          this.getGeneratedDocuments();
        }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => {
      // Check if searchedKeyword is empty, then call getEmployeeTemplates() method
      if(this.searchedKeyword === '') {
        this.getGeneratedDocuments();
      } else {
        this._empSer.generatedDocumentPage = this.page;
        this._empSer.generatedDocumentSize = this.size; 
        this._empSer.generatedDocumentSortBy = this.sortBy;
        this._empSer.generatedDocumentSearchedKeyword = this.searchedKeyword;
        this.page = 1;
        this._empSer.getGeneratedDocuments(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy).subscribe((res: any) => {
          if (res.status == 200) {
            this.dataSource = res.data;
            this.totalDataCount = res.totalDataCount;
  
            if (this.dataSource.length == 0) {
              this.showNoDataFoundText = true;
              this.totalDataCount = res.totalDataCount;
              this.checkDocumentData = res.data;

              this.searchedKeyword = '';
              this._empSer.generatedDocumentSearchedKeyword = '';
              this._empSer.generatedDocumentSortBy = this.sortBy;
            } else {
              this.showNoDataFoundText = false;
              this.totalDataCount = res.totalDataCount;
              
              this._empSer.generatedDocumentPage = this.page;
              this._empSer.generatedDocumentSize = this.size;
              this._empSer.generatedDocumentSearchedKeyword = this.searchedKeyword;
              this._empSer.generatedDocumentSortBy = this.sortBy;
            }
  
            if(this.paginator) {
              if (this.paginator.pageIndex === 0) {
                this.paginator.firstPage();
              }
              this.paginator.pageSize = this.size;
              this.paginator.pageIndex = 0;
            }
          }else {
            this.snackBar.open(res.message, 'Cancel' ,{
              duration: 3000,
              panelClass: ['error-snackbar']
            })
          }
        });
      }
    });
  }

  initForm() {
    this.searchForm = this.fb.group({
      search_box: [''],
      sort_by: ['']
    })
  }

  ngAfterViewInit() {
    this.getGeneratedDocuments();
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  getGeneratedDocuments() {
    this._empSer.getGeneratedDocuments(this.userId,this.page,this.size,this.searchedKeyword, this.sortBy).subscribe((res: any) => {
      if (res.status == 200) {
        this.dataSource = res.data;
        this.generatedDocumentsLength = this.dataSource.length;
        this.checkDocumentData = res.data;
        this.totalDataCount = res.totalDataCount;

        if (this.totalDataCount == 0) {
          this.showNoDataFoundText = true;
        }
        if (this.dataSource.length >= 1) {
          this.showNoDataFoundText = false;
        }

        if(this.paginator){
          // Calculate the page numbers
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
    if(this.generatedDocumentsLength >= 1){
      this.searchedKeyword = event.target.value;
      if (this.searchedKeyword == '') {
        this.showNoDataFoundText = false;
        this.page = 1;
        this.searchedKeyword = '';
        this._empSer.generatedDocumentSearchedKeyword = '';
        this.size = this._empSer.generatedDocumentSize;
        this.sortBy = this._empSer.generatedDocumentSortBy;
        this.getGeneratedDocuments();
      } else {
         this.searchSubject.next(this.searchedKeyword);
      }
    }else {
      this.snackBar.open('Cannot search if there is no data','Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar']
      })
    }
  }

  onShortBy() {
    this.sortBy = this.searchForm.value.sort_by
    this._empSer.generatedDocumentSortBy = this.sortBy
    if(this.generatedDocumentsLength >= 1) {
      this._empSer
      .getGeneratedDocuments(this.userId, this.page, this.size, this.searchedKeyword, this.sortBy)
      .subscribe((res: any) => {
        if (res.status == 200) {
          if(res.data.length == 0){
            this.dataSource = [];
            this.checkDocumentData = res.data;
            this.totalDataCount = res.totalDataCount;
            this.showNoDataFoundText = true;
          } else {
            this.dataSource = res.data;
            this.checkDocumentData = res.data;
            this.totalDataCount = res.totalDataCount;
            this.showNoDataFoundText = false;
            this._empSer.generatedDocumentSortBy = this.sortBy
          }
        }else {
          this.snackBar.open(res.message, 'Cancel' ,{
            duration: 3000,
            panelClass: ['error-snackbar']
          })
        }
      });
    }else {
      this.searchForm.patchValue({sort_by: ''})
      this.snackBar.open('Cannot sort if there is no data','Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar']
      })
    }
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.currentPage = this.page
    this._empSer.generatedDocumentPage = this.page;
    this._empSer.generatedDocumentSize = this.size; 
    this._empSer.generatedDocumentSortBy = this.sortBy;
    this._empSer.generatedDocumentSearchedKeyword = this.searchedKeyword;
    this.getGeneratedDocuments();
  }

  onViewDocument(element: any) {
    this.dialog.open(ViewDocumentComponent,{
      width:'700px',
      height: '720px',
      disableClose: true,
      data: {
        templatetype: element.templatetype,
        generateddocument: element.generateddocument
      }
    })
  }

}
