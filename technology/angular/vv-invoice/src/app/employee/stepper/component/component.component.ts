import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { AddNewComponent } from './add-new/add-new.component';

@Component({
  selector: 'app-component',
  templateUrl: './component.component.html',
  styleUrls: ['./component.component.scss'],
})
export class ComponentComponent implements OnInit {
  @ViewChild(MatDrawer, { static: true }) drawer!: MatDrawer;
  @ViewChild(AddNewComponent) addNewCom!: AddNewComponent
  displayedColumns: string[] = [
    'componentname',
    'componenttype',
    'status',
    'action'
  ];
  
  sort_by = [
    {name: 'Name'},
    {name: 'Status'},
  ]
  
  dataSource: any[] = [];
  disableNextBtn: boolean = true;
  componentname: any;
  isDataNOtNull: any;
  componentState: string = '';
  comDelMsg = 'If you delete the component here then it will be directly removed from the database.'
  componentName: string = ''
  componentType: string = ''
  showNoDataFoundText: boolean = false;
  componentNames: any[]=[];

  constructor(
    private dialog: MatDialog,
    private _empSer: EmployeeService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._empSer.changeTableName.subscribe(x => {
      this.componentName = x.componentName,
      this.componentType = x.componentType
    })
    this.initComponentData();
  }

  initComponentData() {
    this.dataSource = this._empSer.getComData;
    if(this._empSer.employeeData.length <= 0) {
    this.drawer.open()
    this.componentState = 'Add';
    this._empSer.callTheOninitSubject.next('');
    }
    this._empSer.delComDataFromTableSubject.subscribe((x) => {
      this.dataSource = [];
    });
    if (this._empSer.employeeData.length >= 1) {
      let comComData = this._empSer.employeeData.filter((x) => { return x.componentid });
      if (comComData.length >= 1) {
        this.isDataNOtNull = comComData;
        this.dataSource = comComData;
        this.componentNames = this.dataSource;
      }
    }
  }

  changeDisableButton(event: any) {
    (<any>this._empSer.employeeData).disableButton = event
  }

  onNextStep() {
    let isEdit = (<any>this._empSer.employeeData).isEdit;
    if (this.isDataNOtNull != undefined || isEdit) {
      this._empSer.changeSaveBtnToUpdate.next({ updateBtn: true });
    } else if (this.isDataNOtNull == undefined || isEdit == false) {
      this._empSer.changeSaveBtnToUpdate.next({ updateBtn: false });
    }
    this._empSer.callTheOninitSubject.next('');
  }

  getAddNewData(event: any) {
    this.dataSource.push(event);
    this.dataSource = [...this.dataSource];
    this._empSer.getComData = this.dataSource;
    if (this.dataSource.length <= 0) {
      this.disableNextBtn = true;
    } else if (this.dataSource.length >= 1) {
      this.disableNextBtn = false;
    }
  }

  onAddNew(event: any) {
    if (event.isTrusted == true) {
      this.drawer.open();
      this.componentState = 'Add';
      this._empSer.callTheOninitSubject.next('');
    }
    if (event == false) {
      this.drawer.close();
    }
  }

  onStatusClicked(componentid: string) {
    const index = this._empSer.employeeData.findIndex((x) => x.componentid === componentid);
    const employee = this._empSer.employeeData[index];
    employee.status = employee.status === 1 ? 0 : 1;
    (<any>this._empSer.employeeData).disableButton = false;
  }  

  onSearchComponent() {
    if (this.componentname == '') {
      this.showNoDataFoundText = false;
      this.ngOnInit();
    } else {
      this.dataSource = this.dataSource.filter((res: any) => {
        return (<any>res).componentname
          ?.toLocaleLowerCase()
          .match(this.componentname?.toLocaleLowerCase());
      });
      if(this.dataSource.length == 0){
        this.showNoDataFoundText = true
      }else{
        this.showNoDataFoundText = false;
      }
    }
  }

  onShortByFilter(event: any) {
    let shortBy = event.value;
    if (shortBy == 'Name') {
      let newArr = this.dataSource.sort(
        (a: { componentname: string }, b: { componentname: string }) => {
          return a.componentname.localeCompare(b.componentname);
        }
      );
      this.dataSource = [...newArr];
    } else if (shortBy == 'Status') {
      let newArr = this.dataSource.sort(
        (a: { status: any }, b: { status: any }) =>
          Number(b.status) - Number(a.status)
      );
      this.dataSource = [...newArr];
    } else if (shortBy == 'Last Updated') {
      let newArr = this.dataSource.sort((a,b) => {
        return a.createdat - b.createdat
      });
      this.dataSource = [...newArr];
    }
  }

  onEdit(element: any) {
    this.drawer.open();
    this.componentState = 'Edit';
    this._empSer.sendEditDataSubject.next(element);
  }

  onDelete(i: number, componentid: string, _id: string) {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '350px',
        height: 'auto',
        disableClose: true,
        data: 'component',
        panelClass: 'confirm-dialog-container',
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res == true && _id !== undefined) {
          let answer = window.confirm(this.comDelMsg);
          if (answer) {
            let deletedCom = this.dataSource[i];
            this._empSer.removeComponentFromEditorSubject.next(deletedCom)
            this.dataSource.splice(i, 1);
            this.dataSource = [...this.dataSource];
            const objWithIdIndex = this._empSer.employeeData.findIndex(
              (obj) => obj.componentid === componentid
            );

            if (objWithIdIndex > -1) {
              this._empSer.employeeData.splice(objWithIdIndex, 1);
            }
            this._empSer.employeeData = [...this._empSer.employeeData];

            if (this.dataSource.length <= 0) {
              this.disableNextBtn = true;
            }

            this._empSer.onDelCom(componentid).subscribe((res: any) => {
              if (res.status == 200) {
                this.snackbar.open(res.message, 'Cancel', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
              }
            });
            (<any>this._empSer.employeeData).disableButton = false;
          }
        } else if (res == true && _id == undefined) {
          let deletedCom = this.dataSource[i];
          this._empSer.removeComponentFromEditorSubject.next(deletedCom)
          this.dataSource.splice(i, 1);
          this.dataSource = [...this.dataSource];
          const objWithIdIndex = this._empSer.employeeData.findIndex(
            (obj) => obj.componentid === componentid
          );

          if (objWithIdIndex > -1) {
            this._empSer.employeeData.splice(objWithIdIndex, 1);
          }
          this._empSer.employeeData = [...this._empSer.employeeData];

          if (this.dataSource.length <= 0) {
            this.disableNextBtn = true;
          }
        }
        if(this._empSer.employeeData) {
          let data = this._empSer.employeeData.filter(x => x.componentid)
          if(data.length >= 1) {
            this.addNewCom.showSelectComDropdown = true
            this._empSer.showSelectComDropdown = true
          }else {
            this.addNewCom.showSelectComDropdown = false;
            this._empSer.showSelectComDropdown = false;
          }
        }
      });
  }
}
