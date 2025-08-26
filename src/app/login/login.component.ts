import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { FactoryService } from '../factory/factory.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { TasService } from '../services/data-service.service';
import { APIConfig, ICON, TITLE } from '../../../SETTINGS.service';
import { NgOtpInputModule } from 'ng-otp-input';
import { BypassHtmlSanitizerPipe } from "../services/pipe.pipe";


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    NgOtpInputModule,
    BypassHtmlSanitizerPipe
  ]
})
export class LoginComponent {

  title = ''
  icon = ''

  isLogin = true;

  vfy = false;
  otp: any;

  tasService = inject(TasService)
  apiConfig = inject(APIConfig)
  factory = inject(FactoryService);
  router = inject(Router);

  login: any = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.minLength(8),
      Validators.required,
    ]),
  });

  register: any = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.minLength(8),
      Validators.required,
    ]),
    cpassword: new FormControl('', [
      Validators.minLength(8),
      Validators.required,
    ]),
    mail_id: new FormControl('', [Validators.minLength(8), Validators.email]),
    otp: new FormControl(0, [Validators.minLength(6), Validators.required]),
  });

  ngOnInit() {
    // this.tasService.apiCall(this.apiConfig.groupviewURL(1)).subscribe({
    //   next: (res: any) => {
    this.title = TITLE
    this.icon = ICON
    //   }
    // })
  }

  onSubmit(): void {
    console.log('I am onsubmit!!!!', this.login);
    if (this.login) {
      const { username, password } = this.login.value;
      console.log(
        '%csrc/app/login/login.component.ts:53 username, password',
        'color: #007acc;',
        username,
        password
      );
      if (username === 'tas-user1' && password === 'tas@user1') {
        this.router.navigate(['projects']);
        sessionStorage['user_id'] = /* 'tas_'+ */username;
      } else {
        this.factory.tasAlert(
          'Incorrect username or password',
          'error',
          1000
        );
      }
    }
  }
  // onSubmit(): void {
  //   console.log('I am onsubmit!!!!', this.login);
  //   if (this.login) {
  //     const { username, password } = this.login.value;
  //     console.log(
  //       '%csrc/app/login/login.component.ts:53 username, password',
  //       'color: #007acc;',
  //       username,
  //       password
  //     );
  //     if (username != '' && password != '') {
  //       this.tasService.apiCall(this.apiConfig.authenticationAPI(username, password)).subscribe({
  //         next: (res: any) => {
  //           console.log('%csrc/app/services/data-service.service.ts:66 res', 'color: #007acc;', res);
  //           this.factory.hideLoader()
  //           if(res.data == 'ValidUser') {
  //             this.router.navigate(['/grid']);
  //             sessionStorage['user_id'] = /* 'tas_'+ */username;
  //           } else {
  //             this.factory.tasAlert('Incorrect Username or Password', 'error', 2000)
  //           }
  //         },
  //         error: (error: any) => {
  //           console.log('ERROR',error);
  //           this.factory.hideLoader()
  //           this.factory.tasAlert('There was an error in retrieving data from the server', 'error', 2000)
  //         }
  //       })

  //     } else {
  //       this.factory.tasAlert(
  //         'Incorrect username or password',
  //         'error',
  //         1000
  //       );
  //     }
  //   }
  // }

  onSubmitRegister(): void {
    console.log('I am onsubmit!!!!', this.register)
    if (this.register.value.password !== this.register.value.cpassword) {
      this.factory.tasAlert('error', 'passwords don\'t match', 1000)
      return
    }
    if (this.register.valid) {
    }
  }
  forgotPassword() {
    this.router.navigate(['forgot']);
  }
  verify() {
    console.log('%clogin.component.ts line:118 this.register.controls', 'color: #007acc;', this.register.controls, this.register.controls.username.valid, this.register.controls.mail_id.valid);
    if (!this.register.controls.username.valid || !this.register.controls.mail_id.valid) return
  }
}