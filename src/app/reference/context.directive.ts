import { Directive, ElementRef, HostListener, Input,ViewChild, Renderer2 } from '@angular/core';
import { ReferenceComponent as RefrenceComponent } from './reference.component';
// import {RefrenceComponent} from './refrence.component'
// ReferenceComponent
@Directive({
  selector: '[appContext]',
  standalone: true,
})
export class ContextDirective {
  @Input() menuItems: string[] = []; // Array of menu items
  @ViewChild(RefrenceComponent) refrence!: RefrenceComponent
  constructor(private el: ElementRef, private renderer: Renderer2) {
    console.log("ele", el, "renderer", renderer)
    console.log("nativeElement", el.nativeElement, "\n", el.nativeElement);
  }
  @HostListener('contextmenu', ['$event'])
  
  onRightClick(event: MouseEvent) {
    console.log("ele", "renderer", event, "\n",event.clientX,"refrence",this.refrence)
    event.preventDefault(); // Prevent default context menu

    // Create the context menu
    const contextMenu = this.renderer.createElement('div');
    // const contextMenu = this.el.nativeElement
    console.log("contextMenu", contextMenu);
    this.renderer.addClass(contextMenu, 'context-menu');

    // Add menu items
    this.menuItems.forEach(item => {
      const menuItem = this.renderer.createElement('div');
      this.renderer.addClass(menuItem, 'context-menu-item');
      this.renderer.appendChild(menuItem, this.renderer.createText(item));
      this.renderer.appendChild(contextMenu, menuItem);
    });

    // Position the context menu
    this.renderer.setStyle(contextMenu, 'position', 'absolute');
    this.renderer.setStyle(contextMenu, 'left', `${event.clientX}px`);
    this.renderer.setStyle(contextMenu, 'top', `${event.clientY}px`);

    // Append the context menu to the document body
    this.renderer.appendChild(document.body, contextMenu);

    // Handle click outside the context menu to remove it
    this.renderer.listen('window', 'click', (e: MouseEvent) => {
      if (!contextMenu.contains(e.target as Node)) {
        this.renderer.removeChild(document.body, contextMenu);
      }
    });
  }

}
