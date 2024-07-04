import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Handlebars from 'handlebars';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { DomSanitizer } from '@angular/platform-browser';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-download-invoice',
  templateUrl: './download-invoice.component.html',
  styleUrls: ['./download-invoice.component.scss'],
})
export class DownloadInvoiceComponent implements OnInit {
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  @ViewChild('emailRef') emailRef!: ElementRef;

  getrecipientEmailForm!: FormGroup;
  showEmailInput: boolean = false;
  EmployeehtmlText: any;
  handleBarsData: any[] = [];
  result: any;
  total: any;
  issue_date!:Date
  due_date: any
  pdfGenerated: boolean = false
  generatedDocumentData: any;
  serialNo: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DownloadInvoiceComponent>,
    private _empSer: EmployeeService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.renderHtml();
    this.formatDate();
    this.formatSerialNo()
    this.runhandleBar()
  }

  formatSerialNo() {
    if(this.data.serialNo <= 9) {
      this.serialNo = '000' + this.data.serialNo
    }else if(this.data.serialNo > 9 && this.data.serialNo < 99) {
      this.serialNo = '00' + this.data.serialNo
    }else if(this.data.serialNo > 99 && this.data.serialNo < 999 ) {
      this.serialNo = '0' + this.data.serialNo
    }else if(this.data.serialNo > 999) {
      this.serialNo = this.data.serialNo
    }
  }

  formatDate() {
    this.issue_date = new Date()
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    this.due_date = dueDate
  }

  renderHtml() {
    this.EmployeehtmlText = this.data.templatehtml
  }

  runhandleBar() {
    let source = this.EmployeehtmlText;
    let template = Handlebars.compile(source);
    this.data.componentName.map((element: any) => {
      let data = element.name
      this.handleBarsData[data] = element.rule
    });
    this.data.fieldData = Object.keys(this.data.fieldData).reduce((c: any, k) => (c[k.toLowerCase().split(' ').join('_').split('_').join('')] = this.data.fieldData[k], c), {});
    this.handleBarsData = Object.assign(
      this.handleBarsData,
      this.data.fieldData
    );
       
    (<any>this.handleBarsData).total = this.data.total;
    (<any>this.handleBarsData).totalInWords = this.data.totalInWords;
    (<any>this.handleBarsData).serialNo = this.serialNo;
    (<any>this.handleBarsData).issue_date = this.issue_date.toLocaleDateString('en-US');
    (<any>this.handleBarsData).due_date = this.due_date.toLocaleDateString('en-US');

    this.result = template(this.handleBarsData);
    this.generatedDocumentData = this.result;
    return this.sanitizer.bypassSecurityTrustHtml(this.result);
  }

  initForm() {
    this.getrecipientEmailForm = this.fb.group({
      email: [
        '',
        [
          Validators.compose([
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        ],
      ],
    });
  }

  get email(): AbstractControl {
    return this.getrecipientEmailForm.get('email') as FormControl;
  }

  onClose() {
    const payload = {
      pdfGenerated: this.pdfGenerated,
      generatedDocumentData: this.generatedDocumentData,
      templatetype: this.data.templatetype
    }
    this.dialogRef.close(payload);
  }

  showEmailInputBox() {
    this.showEmailInput = true;
    setTimeout(() => {
      const emailRef = this.emailRef.nativeElement;
      if (emailRef) {
        emailRef.focus();
      }
    }, 0);
  }

  onCancel() {
    this.showEmailInput = false;
    this.getrecipientEmailForm.reset();
  }

  sendInvoiceThroughEmail() {
    const pdfTable = this.pdfTable.nativeElement;
    let recipientEmail = this.getrecipientEmailForm.value.email;
    const invoice = {
      invoice: pdfTable.innerHTML,
    };
    this._empSer
      .sendInvoiceThroughEmail(recipientEmail, invoice)
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.showEmailInput = false;
          this.pdfGenerated = true;
        }else {
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  downloadAsPDF() {
    const pdfTable = this.pdfTable.nativeElement;
    html2canvas(pdfTable,{
      scale:5
    }).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p', 'mm', 'a4');
      var width = pdf.internal.pageSize.getWidth();
      var height = (canvas.height * width) / canvas.width;
      pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);
      pdf.save('invoice.pdf');
    });
      this.pdfGenerated = true
  }
}
