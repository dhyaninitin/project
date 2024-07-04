import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { fadeInUp400ms } from "../../../../../@vex/animations/fade-in-up.animation";
import { AuthService } from "src/app/pages/shared/services/auth.service";
import { NavigationService } from "src/@vex/services/navigation.service";

@Component({
  selector: "vex-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  inputType = "password";
  visible = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private _authSer: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
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
  }

  signIn() {
    this.loginForm.markAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    let payload = this.loginForm.value;
    this._authSer.login(payload).subscribe(
      async (res: any) => {
        if (res) {
          let role = await this._authSer.tokenDecoder(res.token);
          this.router.navigateByUrl("/users");
          this.snackbar.open(res.message, "Cancel", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          localStorage.removeItem("navigationItems");
          this.navigationService.items = [];
          this.setNavigationItems(role);
        }
      },
      (error) => {
        if (error.status === 501) {
          this.snackbar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
        } else if (error.status == 402) {
          this.snackbar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
        } else if (error.status == 403) {
          this.snackbar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
        } else {
          this.snackbar.open(error.error.message, "Cancel", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
        }
      }
    );
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = "password";
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = "text";
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  setNavigationItems(role: any) {
    if (role == 1) {
      this.navigationService.items = [
        {
          type: "link",
          label: "Users",
          route: "/users",
          icon: "mat:group",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "Work Diary",
          route: "/work-diary",
          icon: "mat:work_history",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "Reports",
          route: "/reports",
          icon: "mat:report",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "User Permission",
          route: "/user-permission",
          icon: "mat:manage_accounts",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "Error Logs",
          route: "/error-logs",
          icon: "mat:manage_accounts",
          routerLinkActiveOptions: { exact: true },
        },
      ];
      localStorage.setItem(
        "navigationItems",
        JSON.stringify(this.navigationService.items)
      );
    } else {
      this.navigationService.items = [
        {
          type: "link",
          label: "Users",
          route: "/users",
          icon: "mat:group",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "Work Diary",
          route: "/work-diary",
          icon: "mat:work_history",
          routerLinkActiveOptions: { exact: true },
        },
        {
          type: "link",
          label: "Reports",
          route: "/reports",
          icon: "mat:report",
          routerLinkActiveOptions: { exact: true },
        },
      ];
      localStorage.setItem(
        "navigationItems",
        JSON.stringify(this.navigationService.items)
      );
    }
  }
}
