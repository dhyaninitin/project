import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../shared/services/auth.service";
import { AdminService } from "../../shared/services/admin.service";
import { DialogRef } from "@angular/cdk/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "vex-add-user-permission",
  templateUrl: "./add-user-permission.component.html",
  styleUrls: ["./add-user-permission.component.scss"],
})
export class AddUserPermissionComponent implements OnInit {
  addUserPermissionForm: FormGroup;
  showUpdateBtn: boolean = false;
  adminId: any;
  role: any;

  constructor(
    private snackBar: MatSnackBar,
    private _authSer: AuthService,
    private _adminSer: AdminService,
    private dialogRef: DialogRef<AddUserPermissionComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAdminDetails();

    this.addUserPermissionForm.patchValue({ status: 1 });

    if (this.data.length > 0) {
      this.addUserPermissionForm.patchValue({
        firstname: this.data[0].firstname,
        lastname: this.data[0].lastname,
        email: this.data[0].email,
        phone: this.data[0].phone,
        role: this.data[0].role ? "Admin" : "Manager",
      });

      if (this.data[0].role === 1) {
        this.addUserPermissionForm.get("role").setValue(1);
      } else if(this.data[0].role === 2) {
        this.addUserPermissionForm.get("role").setValue(2);
      }
      this.showUpdateBtn = true;
    }
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.adminId = this._authSer.adminId;
    this.role = this._authSer.role;
  }

  initForm() {
    this.addUserPermissionForm = this.fb.group({
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
      phone: [
        "",
        [
          Validators.compose([
            Validators.required,
            Validators.required,
            Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          ]),
        ],
      ],
      role: ["", Validators.required],
    });
  }

  isNumberKey(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  addUser() {
    if (this.addUserPermissionForm.invalid) {
      return;
    }
    if (this.showUpdateBtn) {
      const id = this.data[0]._id;
      let payload = this.addUserPermissionForm.value;
      this._adminSer.updateUserPermission(id, this.adminId, payload).subscribe(
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
      let data = this.addUserPermissionForm.value;

      this._adminSer.addUserPermission(this.adminId, data).subscribe(
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
}
