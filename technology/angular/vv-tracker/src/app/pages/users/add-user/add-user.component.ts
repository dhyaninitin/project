import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AdminService } from "../../shared/services/admin.service";
import { DialogRef } from "@angular/cdk/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../../shared/services/auth.service";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";

@Component({
  selector: "vex-add-user",
  templateUrl: "./add-user.component.html",
  styleUrls: ["./add-user.component.scss"],
})
export class AddUserComponent implements OnInit {
  @ViewChild("select") select: MatSelect;

  addUserFrom: FormGroup;
  assigneddays = new FormControl<any[]>([], Validators.required);
  daysList: any = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  allSelected = false;
  showUpdateBtn: boolean = false;
  adminId: any;

  constructor(
    private fb: FormBuilder,
    private _adminSer: AdminService,
    private dialogRef: DialogRef<AddUserComponent>,
    private snackBar: MatSnackBar,
    private _authSer: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  initForm() {
    this.addUserFrom = this.fb.group({
      empid: ["", Validators.required],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: [
        "",
        [
          Validators.compose([
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
          ]),
        ],
      ],
      phone: [""],
      organizationname: ["VVT"],
      assignedhours: ["", Validators.required],
      assigneddays: this.assigneddays,
      status: [""],
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.getAdminDetails();

    this.addUserFrom.patchValue({ status: 1 });

    if (this.data.length > 0) {
      this.addUserFrom.patchValue({
        empid: this.data[0].empid.split("-")[1],
        firstname: this.data[0].firstname,
        lastname: this.data[0].lastname,
        email: this.data[0].email,
        phone: this.data[0].phone,
        assignedhours: this.data[0].assignedhours,
        assigneddays: this.data[0].assigneddays,
        status: this.data[0].status,
      });
      this.showUpdateBtn = true;
    }
  }

  getAdminDetails() {
    if (this._authSer.adminId) {
      this.adminId = this._authSer.adminId;
    } else {
      this._authSer.tokenDecoder(null);
      this.adminId = this._authSer.adminId;
    }
  }

  onCheckboxChange(event: any) {
    this.addUserFrom.value.status = event.checked ? 1 : 0;
  }

  addUser() {
    if (this.addUserFrom.invalid) {
      return;
    }
    if (this.showUpdateBtn) {
      this.addUserFrom.value.empid = "VVT-" + this.addUserFrom.value.empid;
      const id = this.data[0]._id;
      let payload = this.addUserFrom.value;
      this._adminSer.updateUser(id, this.adminId, payload).subscribe(
        (res: any) => {
          if (res) {
            this.dialogRef.close();
            this._adminSer.refreshUserTableSubject.next(true);
            this.snackBar.open(res.message, "Cancel", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.showUpdateBtn = false;
          }
        },
        (error) => {
          if (error.status === 409) {
            this.snackBar.open(error.error.message, "Cancel", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            });
          }
        }
      );
    } else {
      let data = this.addUserFrom.value;
      this.addUserFrom.value.empid = "VVT-" + this.addUserFrom.value.empid;
      this._adminSer.addUser(this.adminId, data).subscribe(
        (res: any) => {
          if (res) {
            this.dialogRef.close();
            this._adminSer.refreshUserTableSubject.next(true);
            this.snackBar.open(res.message, "Cancel", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
          }
        },
        (error) => {
          if (error.status === 409) {
            this.snackBar.open(error.error.message, "Cancel", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            });
          }
        }
      );
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  isNumberKey(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
}
