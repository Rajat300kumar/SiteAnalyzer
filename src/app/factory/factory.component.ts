import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';

// import {tasAlert} from FactoryService
import { FactoryService } from './factory.service';
import { CommonModule } from '@angular/common';
import { ContextMenuComponent } from './context-menu.component';

@Component({
  selector: 'app-factory',
  standalone: true,
  imports: [CommonModule, ContextMenuComponent],
  templateUrl: './factory.component.html',
  styleUrl: './factory.component.css'
})
export class FactoryComponent {

  factory = inject(FactoryService)
}