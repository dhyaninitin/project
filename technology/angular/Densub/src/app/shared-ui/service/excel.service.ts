import { Injectable } from '@angular/core';
// import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
// const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExcelService {
constructor() { }
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    console.log(json);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis');
    /* save to file */
    XLSX.writeFile(workbook, excelFileName + EXCEL_EXTENSION);
  }

}

