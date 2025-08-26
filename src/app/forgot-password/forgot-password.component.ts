import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { APIConfig } from '../../../SETTINGS.service';
import { FactoryService } from '../factory/factory.service';
import { TasService } from '../services/data-service.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [MatError, MatFormFieldModule, MatCardModule, MatInputModule,CommonModule, ReactiveFormsModule, NgOtpInputModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  tasService = inject(TasService)
  apiConfig = inject(APIConfig)
  factory = inject(FactoryService)
  router = inject(Router)
  
  user_id = sessionStorage['user_id']
	mail_id: string = ''
  loading = false
  valid = false

  generateOTP() {
    console.log('%csrc/app/forgot-password/forgot-password.component.ts:33 this.mail_id', 'color: #007acc;', this.mail_id);
    if(this.mail_id.length){
      this.stage = 'validate'
    }
  }

  validateOTP() {
    this.stage = 'reset'

    console.log('%cforgot.component.ts line:46 this.otp', 'color: #007acc;', this.otp);
    // var pd = {cmd_id: 19,user_id: this.user_id || '', 'otp': this.otp || ''}
    // console.log('%cforgot.component.ts line:48 otp', 'color: #007acc;', this.otp);
    // this.tasservice.ajaxrequest(pd,'post',(res:any)=>{
    //   console.log('RES 1::',res)
    //   console.log('%clogin.component.ts line:43 res', 'color: #002acc;', res, this.otp, this.otp, pd);
    //   if(res[0]['message']=='Valid'){
    //       this.valid = true
    //   }
    //   else{
    //     this.factory.tasAlert('error', res[0]['message'], 1000)
    //   }
    //   this.loading = false
    // })
  }

  stage = 'generate'

  otp: any
  onChangeOTP(event: any){
    this.otp = event
  }

  password: any = new FormGroup({
    npass: new FormControl('', [Validators.minLength(8), Validators.required]),
    cpass: new FormControl('', [Validators.minLength(8), Validators.required]),
  })

  reset(){
    console.log('%cforgot.component.ts line:82 valid', 'color: #007acc;', this.valid, this.password.value);
    if(this.password.value.npass == this.password.value.cpass){
      var pd = {cmd_id :20, user_id: this.user_id, new_password : this.password.value.npass}
      // this.tasservice.ajaxrequest(pd,'post',(res:any)=>{
      //   console.log('RES 1::',res)
      //   console.log('%clogin.component.ts line:43 res', 'color: #002acc;', res, this.otp, this.otp, pd);
      //   if(res[0]['message']=='done'){
      //       this.factory.tasAlert('success', 'Password Reset', 1000)
      //       this.router.navigate(['login']);
      //   }
      //   else
      //     this.factory.tasAlert('error', res[0]['message'], 1000)
      //   this.loading = false
      // })
    }
    else{
      this.factory.tasAlert('error', 'Passwords don\'t match', 1000)
    }
  }
}
