import { Component, OnInit } from '@angular/core';
import { ResultService } from '../../services/result.service';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-top-candidates',
  templateUrl: './top-candidates.component.html',
  styleUrls: ['./top-candidates.component.scss']
})
export class TopCandidatesComponent implements OnInit {
  page = 1;
  pageSize = 10;
  totalPages: any;
  target: string = '';
  search: string = '';
  pageSizeOptions = [10, 20, 50, 100];
  topCandidates: any = []
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'phonenumber', 'score'];
  dataSource = new MatTableDataSource();
  constructor(
    private resultService: ResultService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {

  }

  getTopCandidates() {
    this.resultService.getTopCandidates(this.page, this.pageSize, this.target, this.search).subscribe((res: any) => {
      if (res.status === 200) {
        this.topCandidates = res.data.reverse();
        this.dataSource = this.topCandidates
        this.totalPages = res.totalRecords
        this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
      } else {
        this.snackbar.open(res.message, 'Cancel', { duration: 3000 });
      }
    })
  }

  downloadExcel(): void {
    // let newArray = this.topCandidates.map((obj: { [x: string]: any; _id: any; userId: any; attempts: any; __v: any; }) => {
    //   const { _id, userId, attempts, __v, ...rest } = obj;
    //   return rest;
    // });

    let sortedArray: any[] = [];
    this.topCandidates.map((candidate: any) => {
      let data = {
        "First Name": candidate.firstname,
        "Last Name": candidate.lastname,
        "Email": candidate.email,
        "Phone Number": candidate.phone,
        "Course": candidate.education,
        "College Code": candidate.collegeCode,
        "College Name": candidate.collegeName,
        "Session Year": candidate.year
      }
      sortedArray.push(data);
    })
    this.exportAsExcelFile(sortedArray, 'excel_data');

  }

  exportAsExcelFile(jsonData: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = fileName + '.xlsx';
    a.click();
  }

  pageChanged(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getTopCandidates()
  }

}
