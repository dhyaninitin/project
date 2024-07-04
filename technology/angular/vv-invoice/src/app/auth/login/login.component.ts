import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hide!: boolean;
  googleIcon = '../../../assets/icon/google-icon.png'
  auth2: any;

  @ViewChild('loginRef', { static: true }) loginElement!: ElementRef;
  constructor(
    private _authSer: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkuserToken();
    this.googleAuthSDK();
    this.initForm();
    this.reloadPage();
  }

  reloadPage() {
    if (localStorage.getItem('reload')) {
      location.reload()
      localStorage.removeItem('reload')
    }
  }

  checkuserToken() {
    let token = localStorage.getItem('token');
    if (token == null || "") {
      this.router.navigateByUrl('/auth/login')
    } else if(token !== null || ""){
      this.router.navigateByUrl('/dashboard');
    }
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.compose([
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        ],
      ],
      password: [
        '',
        [Validators.compose([Validators.required, Validators.minLength(8)])],
      ],
    });
    this.hide = true;
  }

  get email(): AbstractControl {
    return this.loginForm.get('email') as FormControl;
  }
  get password(): AbstractControl {
    return this.loginForm.get('password') as FormControl;
  }

  login() {
    let data = this.loginForm.value;
    this._authSer.login(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this._authSer.tokenDecoder(res.token);
        this.router.navigateByUrl('/dashboard');
      } else {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      } 
    });
  }

  /**
   * Write code on Method
   *
   * @return response()
   */
  callLoginButton() {

    this.auth2.attachClickHandler(this.loginElement.nativeElement, {},
      (googleAuthUser: any) => {

        let profile = googleAuthUser.getBasicProfile();

        const payload = {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail()
        }
        this._authSer.saveGoogleLoginInfo(payload).subscribe((res: any) => {
          if (res.status == 200) {
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['success-snackbar']
            })
            this._authSer.tokenDecoder(res.token);
            this.router.navigateByUrl('/dashboard');
            localStorage.setItem('reload', 'true');
          }
        })
      }, (error: any) => {
        console.log(error)
      });
  }

  /**
   * Write code on Method
   * @return response()
   */
  googleAuthSDK() {
    (<any>window)['googleSDKLoaded'] = () => {
      (<any>window)['gapi'].load('auth2', () => {
        this.auth2 = (<any>window)['gapi'].auth2.init({
          client_id: environment.CLIENT_ID,
          plugin_name: 'login',
          cookiepolicy: 'single_host_origin',
          scope: 'profile email'
        });
        this.callLoginButton();
      });
    }

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement('script');
      js.id = id;
      js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
      fjs?.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'google-jssdk'));
  }

}
