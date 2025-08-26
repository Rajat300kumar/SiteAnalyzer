import { Component, inject, Input } from '@angular/core';
import { FactoryService } from '../../factory/factory.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  review = true
  @Input() title: string = 'Default Title';
  factory = inject(FactoryService)
  constructor() { }
  __logout(): void {
    console.log("Login")
    this.factory.logout_func()
  }
}
