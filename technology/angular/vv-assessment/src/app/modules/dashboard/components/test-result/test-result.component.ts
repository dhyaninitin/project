import { Component, OnInit } from '@angular/core';
import { ResultService } from '../../services/result.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { UpdateCandidateComponent } from '../update-candidate/update-candidate.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { Router } from '@angular/router';
import { TopCandidatesComponent } from '../top-candidates/top-candidates.component';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TestResultComponent implements OnInit {
  candidates: any = []
  dataSource: any;
  columnsToDisplay = ['firstname', 'lastname', 'email', 'feedbackRating', 'score', 'comment'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  filterControl = new FormControl('');
  expandedElement!: any | null;
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalPages: any;
  userAnswers: any = [];
  search: string = ''
  public files: NgxFileDropEntry[] = [];

  constructor(
    private dialog: MatDialog,
    private resultService: ResultService,
    private snackbar: MatSnackBar,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getCandidates()
    this.filterControl.valueChanges.pipe(debounceTime(300)).subscribe((value: any) => {
      this.search = value.trim().toLowerCase();
      this.getCandidates();
    });
  }

  getCandidates() {
    this.resultService.getCandidates(this.page, this.pageSize, this.search).subscribe((res: any) => {
      if (res.status === 200) {
        this.candidates = res.data;
        this.candidates.map((el: any) => {
          el.comment = this.getFixedNumberOfCharacters(el.comment, 45) + "...";
          return el;
        })
        this.totalPages = res.totalRecords;
        this.dataSource = new MatTableDataSource<any>(this.candidates);
      } else if (res.status === 401) {
        this.commonService.logout();
        this.router.navigateByUrl('/session-expired')
      }
    });
  }

  toggleRow(element: any): void {
    this.expandedElement = this.expandedElement === element ? null : element;
    if (this.expandedElement) {
      this.resultService.fetchAnswers(element.userId).subscribe((res: any) => {
        if (res.status === 200) {
          this.userAnswers = res.userAnswers
        }
      })
    }
  }

  calculateTotalCorrectAnswers(): number {
    let totalCorrect = 0;
    this.userAnswers.forEach((category: { value: any[]; }) => {
      category.value.forEach((question: { userAnswer: any; answer: any; }) => {
        if (question.userAnswer === question.answer) {
          totalCorrect++;
        }
      });
    });
    return totalCorrect;
  }

  openEditDialog(element: any) {
    const dialogRef = this.dialog.open(UpdateCandidateComponent, {
      width: '50%',
      data: { element }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resultService.updateCandidate(result).subscribe((res: any) => {
          if (res.status === 200) {
            this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
            this.getCandidates()
          } else {
            this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
          }
        })
      }
    });
  }

  getFixedNumberOfCharacters(str: string, numChars: any) {
    return str.substring(0, numChars);
  }

  pageChanged(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getCandidates()
  }

  logout() {
    this.commonService.logout();
    this.router.navigateByUrl('/session-expired')
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // console.log(droppedFile.relativePath, file);
          const formData = new FormData()
          formData.append('file', file, droppedFile.relativePath);

          this.resultService.uploadQuestions(formData).subscribe((res: any) => {
            if (res.status === 200) {
              this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
            } else {
              this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
            }
          })
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }

  deleteCandiate(element: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '350px',
      height: '150px',
      data: {
        title: 'Are you Sure you want to delete this candidate data?.',
        element: element
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resultService.deleteCandidate(element.userId).subscribe((res: any) => {
          if (res.status === 200) {
            this.snackbar.open(res.message, "Cancel", { duration: 3000 });
            this.getCandidates();
          } else {
            this.snackbar.open(res.message, "Cancel", { duration: 3000 });
          }
        })
      }
    });
  }

  getTopCandidates() {
    const dialogRef = this.dialog.open(TopCandidatesComponent, {
      width: '80%',
      height: '80%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

}
