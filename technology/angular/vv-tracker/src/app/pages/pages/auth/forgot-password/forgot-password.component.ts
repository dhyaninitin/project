import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { AuthService } from "src/app/pages/shared/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "vex-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
  animations: [fadeInUp400ms],
})
export class ForgotPasswordComponent implements OnInit {
  forgetPasswordForm!: FormGroup;
  hide!: boolean;
  showOtpField: boolean = false;
  showPasswordField: boolean = false;
  showResendOtpLink: boolean = false;
  showSendEmailIcon: boolean = true;

  constructor(
    private fb: FormBuilder,
    private _authSer: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.forgetPasswordForm = this.fb.group({
      email: [
        "",
        [
          Validators.compose([
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
          ]),
        ],
      ],
      password: [
        "",
        [Validators.compose([Validators.required, Validators.minLength(8)])],
      ],
    });
    this.hide = true;
  }

  get email(): AbstractControl {
    return this.forgetPasswordForm.get("email") as FormControl;
  }
  get password(): AbstractControl {
    return this.forgetPasswordForm.get("password") as FormControl;
  }

  sendOtpToUserEmail() {
    let email = this.forgetPasswordForm.value.email;
    this._authSer.sendOtpToUserEmail(email).subscribe(
      (res: any) => {
        if (res) {
          this.snackBar.open(res.message, "Cancel", {
            duration: 3000,
            panelClass: "success-snackbar",
          });
          this.showOtpField = true;
          this.showSendEmailIcon = false;
        }
      },
      (error) => {
        if(error.status === 400) {
          this.snackBar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: "error-snackbar",
          });
          this.showPasswordField = false;
        }
      }
    );
  }

  resendOtpToUserEmail() {
    this.showResendOtpLink = false;
    this.showOtpField = false;
    let email = this.forgetPasswordForm.value.email;
    this._authSer.sendOtpToUserEmail(email).subscribe(
      (res: any) => {
        if (res) {
          this.snackBar.open(res.message, "Cancel", {
            duration: 3000,
            panelClass: "success-snackbar",
          });
          this.showOtpField = true;
        }
      },
      (error) => {
        if(error.status === 400) {
          this.snackBar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: "error-snackbar",
          });
          this.showPasswordField = false;
          this.showResendOtpLink = false;
        }
      }
    );
  }

  onOtpChange(event: any) {
    if (event.length == 4) {
      const payload = {
        otp: event,
        email: this.forgetPasswordForm.value.email,
      };
      this._authSer.checkOtp(payload).subscribe(
        (res: any) => {
          if (res) {
            this.snackBar.open(res.message, "Cancel", {
              duration: 3000,
              panelClass: "success-snackbar",
            });
            this.showOtpField = false;
            this.showPasswordField = true;
          }
        },
        (error) => {
          if (error.status === 400) {
            this.snackBar.open(error.error.message, "Cancel", {
              duration: 3000,
              panelClass: "error-snackbar",
            });
            this.showPasswordField = false;
            this.showResendOtpLink = true;
          } else if(error.status === 510) {
            this.snackBar.open(error.error.message, "Cancel", {
              duration: 3000,
              panelClass: "error-snackbar",
            });
            this.showPasswordField = false;
          }else if(error.status == 409) {
            this.snackBar.open(error.error.message, "Cancel", {
              duration: 3000,
              panelClass: "error-snackbar",
            });
            this.showPasswordField = false;
          }
        }
      );
    }
  }

  submit() {
    let data = this.forgetPasswordForm.value;
    this._authSer.forgetPassword(data).subscribe(
      (res: any) => {
        if (res) {
          this.router.navigateByUrl("/login");
          this.snackBar.open(res.message, "Cancel", {
            duration: 3000,
            panelClass: "success-snackbar",
          });
        }
      },
      (error) => {
        if (error.status === 400) {
          this.snackBar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: "error-snackbar",
          });
        } else {
          this.snackBar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: "error-snackbar",
          });
        }
      }
    );
  }
}
