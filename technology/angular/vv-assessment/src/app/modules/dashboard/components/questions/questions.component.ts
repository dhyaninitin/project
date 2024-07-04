import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ResultService } from '../../services/result.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateQuestionComponent } from '../update-question/update-question.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  page: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalPages: any;
  search: string = '';
  category: string = '';
  level: string = '';
  allQuestions: any;
  filterControl = new FormControl('');
  displayedColumns: string[] = ['category', 'level', 'answer', 'question', 'actions'];
  dataSource = new MatTableDataSource<any>();
  categories = ['JS', 'SQL', 'HTML & CSS', 'C & C++', 'C#', 'Aptitude'];
  levels = ['1', '2', '3'];
  categoryControl = new FormControl('All');
  levelControl = new FormControl('All');

  constructor(
    private resultService: ResultService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllQuestions();
    this.filterControl.valueChanges.pipe(debounceTime(300)).subscribe((value: any) => {
      this.search = value.trim().toLowerCase();
      this.getAllQuestions();
    });
    this.categoryControl.valueChanges.pipe(debounceTime(300)).subscribe((value: any) => {
      this.category = value.trim().toLowerCase();
      this.getAllQuestions();
    });
    this.levelControl.valueChanges.pipe(debounceTime(300)).subscribe((value: any) => {
      this.level = value.trim().toLowerCase();
      this.getAllQuestions();
    });
  }
  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

  getFixedNumberOfCharacters(str: string, numChars: any) {
    return str.substring(0, numChars);
  }

  getAllQuestions() {
    this.resultService.getAllQuestions(this.page, this.pageSize, this.search, this.category, this.level).subscribe((res: any) => {
      if (res.status === 200) {
        this.allQuestions = res.data;
        this.totalPages = res.totalRecords
        this.dataSource = this.allQuestions;
      } else if (res.status == 401) {
        this.commonService.logout();
        this.router.navigateByUrl('/session-expired');
      }
    })
  }

  pageChanged(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getAllQuestions()
  }

  editQuestion(element: any) {
    const dialogRef = this.dialog.open(UpdateQuestionComponent, {
      width: '50%',
      data: { element }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resultService.updateQuestion(result).subscribe((res: any) => {
          if (res.status === 200) {
            this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
            this.getAllQuestions()
          } else {
            this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
          }
        })
      }
    });
  }

  deleteQuestion(element: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '350px',
      height: '150px',
      data: {
        title: 'Are you Sure you want to delete this Question data?.',
        element: element
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.resultService.deleteQuestion(element._id).subscribe((res: any) => {
          if (res.status === 200) {
            this.snackbar.open(res.message, "Cancel", { duration: 3000 });
            this.getAllQuestions();
          } else {
            this.snackbar.open(res.message, "Cancel", { duration: 3000 });
          }
        })
      }
    });
  }

}