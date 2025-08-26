import { Component } from '@angular/core';

@Component({
  selector: 'app-tas-alert',
  standalone: true,
  imports: [],
  templateUrl: './tas-alert.component.html',
  styleUrl: './tas-alert.component.css'
})
export class TasAlertComponent {

  message: any = 'message'
  type: any = 'success'
  showAlert: boolean = true

  alert(type: string, message: any, timeout: number = 2000) {
    console.log('%csrc/app/tas-alert/tas-alert.component.ts:21 type, message, timeout', 'color: #007acc;', type, message, timeout, this.showAlert);

    this.message = message
    this.type = type

    this.showAlert = true

    setTimeout(() => {
      this.showAlert = false
    }, timeout);
  }
}
