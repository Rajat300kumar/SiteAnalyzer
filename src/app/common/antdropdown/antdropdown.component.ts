import { Component } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-antdropdown',
  standalone: true,
  imports: [NzDropDownModule, NzInputModule, FormsModule],
  templateUrl: './antdropdown.component.html',
  styleUrl: './antdropdown.component.css'
})
export class AntdropdownComponent {
  public searchTerm_ind: string = '';
  right_drop_action: string = '';
  popup_dis_ind: boolean = false;
  // popup_disply_ind(): void {
  //   console.log("popup click")
  //   this.popup_dis_ind = !this.popup_dis_ind
  //   console.log("true", this.popup_dis_ind)
  // }
}
