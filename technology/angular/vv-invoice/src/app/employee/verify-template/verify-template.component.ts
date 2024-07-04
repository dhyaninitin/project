import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { DownloadInvoiceComponent } from '../download-invoice/download-invoice.component';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-verify-template',
  templateUrl: './verify-template.component.html',
  styleUrls: ['./verify-template.component.scss'],
})
export class VerifyTemplateComponent implements OnInit , OnDestroy{
  templateData: any[] = [];
  showVerifyTemplate: boolean = false;
  allTemplateData: any;
  componentData: any;
  dividedSalaryForm !: FormGroup;
  salarySlipBtns: boolean = false;
  numberInWords!: string;
  EmployeeTemplate: any[] = [];
  totalValue!: any;
  componentName: any[] = [];
  Total: string = '';
  templateType: string = '';
  templatehtml: any;
  serialNo: number = 0;
  userId: any;
  templatetype: any;

  total = 100;
  limit = 8;
  offset = 0;
  page = 1;
  options = new BehaviorSubject<any[]>([]);
  options$ = this.options.asObservable();
  isComplete$ = new BehaviorSubject<any>(false);

  constructor(
    private _empSer: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authSer:AuthService,
   ){ this.getUserId() 
    this.dividedSalaryForm = new FormGroup({});}

  ngOnDestroy(): void {
    this.removeSessionStorage()
  }

  ngOnInit() {
    this.getEmployeeTemplates();
    this.getGeneratedDocumentSerialNo();
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  getEmployeeTemplates() {
    this._empSer.getEmployeeTemplatesWhileScroll(this.userId, this.page, this.limit)
      .subscribe((res: any) => {
        if (res && res.templateData.length > 0) {
          this.options.next([...this.options.getValue(), ...res.templateData]);
          this.page++;
          this.offset += this.limit;
        } else {
          this.isComplete$.next(true);
        }
      }, () => {
        this.isComplete$.next(true);
      });
  }

  getNextBatch() {
    if (this.isComplete$.getValue()) {
      return;
    }
    this.getEmployeeTemplates();
  }

  verifyTemplate(event: any) {
    let templateid = event.value.templateid;
    this._empSer.onVerifytemplate(templateid).subscribe((res: any) => {
      if(res.status == 200) {
        this.allTemplateData = [...res.templatesData, ...res.componentsData , ...res.libraryTemplatesData];
        let template = this.allTemplateData.filter((x: any) => x.templatename);
        this.templatetype = template[0].templatetype
        let components = this.allTemplateData.filter((x: any) => x.componentname && x.status == true);
        let library = this.allTemplateData.filter((x: any) => x.html);

        this.dividedSalaryForm.reset();
        this.Total = '';
        this.totalValue = '';
        this.showVerifyTemplate = true;

        this.templateType = template[0].templatetype;
        this.templatehtml = library[0].html;
        this.componentData = components;
        localStorage.setItem('templateType', event.value.templatetype)
        
    
        this.componentData.map((comp: any) => {
            this.dividedSalaryForm.addControl(
              comp.componentname,
              new FormControl('')
            );
        });
        if (template[0].templatetype == 'Based On Total Compensation') {
          this.dividedSalaryForm.disable();
          this.salarySlipBtns = false;
        } else if (template[0].templatetype == 'Based On Offer') {
          this.dividedSalaryForm.enable();
          this.salarySlipBtns = false;
        } else {
          this.dividedSalaryForm.enable();
          this.salarySlipBtns = true;
        }
      }
    })
    this.removeSessionStorage()
  }

  calculateCustomValues(event: any,componentname: string) {
    let value = event.target.value;
    let inputValue: number;
    if(value == '' && value == 0){
        inputValue = 0
    }else{
      inputValue = value;
    }

    let compTempArray: any[] =  [];
    
    sessionStorage.setItem(componentname,event.target.value)
    for (let i = 0; i < this.componentData.length; i++) {
      let newObj = Object.assign({}, this.componentData[i]);
      compTempArray.push(newObj);
    }

    compTempArray.map((component: any) => {
      if(component.rule == null || undefined) {
        component.rule = ''
      }
    });
    let filteredArray: any[] = []

    compTempArray.map((comp:any)=>{
      if(comp.rule.includes(componentname.split(' ').join('').toLowerCase())){
        filteredArray.push(comp)
      }
    })

    filteredArray.map((comp:any)=>{
      let rule = comp.rule
      rule = rule.replace(componentname.split(' ').join('').toLowerCase(), inputValue);
         comp.rule = rule;
     })

    filteredArray.map((comp:any)=>{
        let rule = comp.rule
        Object.keys(sessionStorage).forEach((key) =>{
          if(rule.includes(key)){
            rule = rule.replace(key.split(' ').join('').toLowerCase(), sessionStorage.getItem(key));
            comp.rule = rule;
          }
        })
    })

    filteredArray.map((comp:any)=>{
      var regExp = /[a-zA-Z]/g;
      if(!regExp.test(comp.rule)){
        let rule = comp.rule
        rule =  eval(comp.rule)
        comp.rule = rule
        this.dividedSalaryForm.patchValue({
          [comp.componentname]: comp.rule ,
        });
      }
    })

//     filteredArray.map((comp:any)=>{
//   let rule = comp.rule;
//   var regExp = /[a-zA-Z]/g;
//   if (typeof rule === "number") {
//     comp.rule = rule;
//   } else if (!regExp.test(rule)){
//     rule = eval(rule);
//     comp.rule = rule;
//   } else {
//     rule = rule.replace(component_name.split(' ').join('').toLowerCase(), inputValue);
//     Object.keys(sessionStorage).forEach((key) => {
//       if (rule.includes(key)) {
//         rule = rule.replace(key.split(' ').join('').toLowerCase(), sessionStorage.getItem(key));
//       }
//     });
//     if (!regExp.test(rule)) {
//       rule = eval(rule);
//     }
//     comp.rule = rule;
//   }
//   this.dividedSalaryForm.patchValue({
//     [comp.component_name]: comp.rule,
//   });
// });


    compTempArray.map((component) => {
      compTempArray.map((comp: any) => {
        if (typeof(comp.rule) != 'number') {
          if (comp.rule.includes(component.componentname.split(' ').join('').toLowerCase())) {
            let rule = comp.rule;
            rule = rule.replace(
              component.componentname.split(' ').join('').toLowerCase(),
              component.rule
            );
            comp.rule = rule;
            var regExp = /[a-zA-Z]/g;
            if(!regExp.test(comp.rule)){
              let rule = comp.rule
              rule =  eval(rule)
              comp.rule = rule
              this.dividedSalaryForm.patchValue({
                [comp.componentname]: comp.rule ,
              });
            }
          }
        }
      });
    });

  }

  customValues(event:any,componentname:string){
    let value = event.target.value;
    let inputValue: number;
    if(value == '' && value == 0){
        inputValue = 0
    }else{
      inputValue = value;
    }
    let compTempArray: any[] =  [];
    sessionStorage.setItem(componentname,event.target.value)
    for (let i = 0; i < this.componentData.length; i++) {
      let newObj = Object.assign({}, this.componentData[i]);
      compTempArray.push(newObj);
    }
    compTempArray.map((component: any) => {
      var regExp = /[a-zA-Z]/g;
      if(component.rule == null || undefined) {
        component.rule = ''
      }else 
      if(!regExp.test(component.rule)){
        component.rule = eval(component.rule);
        this.dividedSalaryForm.patchValue({
          [component.componentname]: component.rule ,
        });
      }
    });
  }

  removeSessionStorage(){
    Object.keys(sessionStorage).forEach((key) =>{
        sessionStorage.removeItem(key)
    })
  }

  checkInput() {
    if (this.totalValue == '' || this.totalValue == null) {
      this.dividedSalaryForm.reset();
      this.Total = '';
    } else {
      this.filterComponentData();
    }
  }

  filterComponentData() {
    this.componentName = [];
    let tempComponents: any = [];
    let total = 0;

    this.componentData.map((component: any) => {
      tempComponents.push({
        name: component.componentname,
        rule: component.rule,
      });
    });

    this.componentData.map((comp: any) => {
      this.componentName.push({
        name: comp.componentname,
        rule: comp.rule,
        type: comp.componenttype,
        value: comp.status,
      });
    });

    this.componentName.map((comp: any) => {
      let rule = comp.rule.toLowerCase();
      rule = rule.replace(
        'total',
        this.totalValue == '' ? '0' : this.totalValue
      );
      comp.rule = rule;
      return comp;
    });

    this.componentName.map((component) => {
      this.componentName.map((comp: any) => {
        let rule = comp.rule.toLowerCase();
        rule = rule.replace(
          component.name.split(' ').join('').toLowerCase(),
          component.rule.toLowerCase()
        );
        comp.rule = rule;
        return comp;
      });
    });

    this.componentName.map((comp) => {
      let rule = comp.rule;
      if (this.containsAnyLetters(rule)) {
        this.snackBar.open(comp.name + ' ' + 'Rule not found', 'Cancel', {
          duration: 3000,
        });
      } else {
        rule = parseFloat(eval(rule).toFixed(2));
      }
      comp.rule = rule;
      this.dividedSalaryForm.patchValue({
        [comp.name]: rule,
      });
      return comp;
    });

    this.componentName.map((comp) => {
      let type = comp.type;
      if (type == 'Positive') {
        total += comp.rule;
      }
      if (type == 'Negative') {
        total -= comp.rule;
      }
      if (type == 'Informative') {
        total += 0;
      }
      return total;
    });
    this.Total = total.toString();
    this.numberInWords = this.toWords(+this.Total)
  }

  containsAnyLetters(str: any) {
    return /[a-zA-Z]/.test(str);
  }

  calculateOfferTotal() {
    const dividedSalaryFormArray = Object.keys(
      this.dividedSalaryForm.value
    ).map((key) => {
      return {
        [key]:
          this.dividedSalaryForm.value[
          key as keyof typeof this.dividedSalaryForm.value
          ],
      };
    });

    let total = 0;
    dividedSalaryFormArray.map((value: any) => {
      this.componentData.map((element: any) => {
        let key = Object.keys(value).toString();
        if (key == element.componentname) {
          if (element.componenttype == 'Positive') {
            total += +Object.values(value).toString();
          } else if (element.componenttype == 'Negative') {
            total -= +Object.values(value).toString();
          } else if (element.componenttype == 'Informative') {
            total = total;
          }
        }
        this.Total = total.toString();
        this.numberInWords = this.toWords(+this.Total)
      });
    });
  }

  toWords(s: any) {
    var th = ['', 'thousand', 'million', 'billion', 'trillion'];
    var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s)) return 'not a number';
    var x = s.indexOf('.');
    if (x == -1)
      x = s.length;
    if (x > 15)
      return 'too big';
    var n = s.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++) {
      if ((x - i) % 3 == 2) {
        if (n[i] == '1') {
          str += tn[Number(n[i + 1])] + ' ';
          i++;
          sk = 1;
        } else if (n[i] != 0) {
          str += tw[n[i] - 2] + ' ';
          sk = 1;
        }
      } else if (n[i] != 0) { // 0235
        str += dg[n[i]] + ' ';
        if ((x - i) % 3 == 0) str += 'hundred ';
        sk = 1;
      }
      if ((x - i) % 3 == 1) {
        if (sk)
          str += th[(x - i - 1) / 3] + ' ';
        sk = 0;
      }
    }

    if (x != s.length) {
      var y = s.length;
      str += 'point ';
      for (var j = x + 1; j < y; j++)
        str += dg[n[j]] + ' ';
    }
    return str.replace(/\s+/g, ' ');
  }


  showInvoice() {
    this.dialog.open(DownloadInvoiceComponent, {
      width: '800px',
      height: '720px',
      disableClose: true,
      data: {
        fieldData: this.dividedSalaryForm.value,
        componentName: this.componentName,
        total: this.Total,
        totalInWords: this.numberInWords,
        templatehtml: this.templatehtml,
        serialNo: this.serialNo,
        templatetype: this.templatetype
      },
    }).afterClosed().subscribe(res => {
      if (res.pdfGenerated == true) {
        const payload = {
          userid: this.userId,
          generateddocumentid: uuidv4(),
          templatetype: res.templatetype,
          generateddocument: res.generatedDocumentData
        }
        this._empSer.saveGeneratedDocument(this.userId, payload).subscribe()
        this._empSer.createGeneratedDocumentSerialNo(this.userId).subscribe((res) => {
          if (res) {
            this.getGeneratedDocumentSerialNo()
          }
        })
      }
    })
  }

  getGeneratedDocumentSerialNo() {
    this._empSer.getGeneratedDocumentSerialNo(this.userId).subscribe((res: any) => {
      if (res.status == 200) {
        this.serialNo = res.serialNo
      }
    })
  }
}
