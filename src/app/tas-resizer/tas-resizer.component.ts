import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { timer } from 'rxjs';
declare var $: any;

export interface TasResizerInterface {
  id: string;
  type?: 'w' | 'h';
  initialSize: string[];
  minSize: number
}

@Component({
  selector: 'app-tas-resizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tas-resizer.component.html',
  styleUrl: './tas-resizer.component.css'
})
export class TasResizerComponent {
  config = input.required<TasResizerInterface>()

  startX: number = 0
  startY: number = 0

  dragX: number = 0
  dragY: number = 0

  isDrag: boolean = false

  resizer: any
  parent: any
  div1: any
  div2: any

  parentSize: any

  ngOnInit() {
    timer(100).subscribe(()=>{
      this.resizer = document.querySelector<HTMLElement>('#' + this.config().id)?.parentNode
      console.log('%csrc/app/tas-resizer/tas-resizer.component.ts:34 id, resizer', 'color: #007acc;', this.config().id, this.resizer);
      this.parent = this.resizer?.parentNode as HTMLElement
  
      this.config().initialSize[0] = `calc(${this.config().initialSize[0]} - 10px)`
  
      this.div1 = this.resizer.previousSibling as HTMLElement
      this.div2 = this.resizer.nextSibling as HTMLElement

      this.resize(this.config().initialSize[0], this.config().initialSize[1])
    })
  }

  dragStart(event: MouseEvent) {
    this.isDrag = true
    this.startX = event.clientX
    this.startY = event.clientY
  }

  drag(event: MouseEvent) {
    if(!this.isDrag) return

    if(this.config().type == 'h') {
      this.dragY = event.clientY

      var p = this.parent.clientHeight
      var div1h = Math.min(Math.max(this.div1.clientHeight + (this.dragY - this.startY), this.config().minSize), this.parent.clientHeight - this.config().minSize - 10)
      var div2h = Math.max((p - parseInt(this.div1.style.height) - 10), this.config().minSize)

      console.log('%csrc/app/tas-resizer/tas-resizer.component.ts:69 div1.clientHeight, this.dragY, this.startY, parent.clientHeight', 'color: #007acc;', 
      '\nthis.parent.clientHeight: ', this.parent.clientHeight, 
      '\nthis.dragY: ', this.dragY, 
      '\nthis.startY: ', this.startY, 
      '\n(this.dragY - this.startY): ', (this.dragY - this.startY), 
      '\n(this.div1.clientHeight + (this.dragY - this.startY)): ', (this.div1.clientHeight + (this.dragY - this.startY)), 
      '\nthis.div1.clientHeight + this.div2.clientHeight: ', this.div1.clientHeight + this.div2.clientHeight,
      '\nthis.div1.style.height old: ', this.div1.style.height, parseInt(this.div1.style.height), 'this.div1.clientHeight', this.div1.clientHeight, parseInt(this.div1.clientHeight),
      '\nthis.div1.style.height new', div1h,
      '\nthis.div2.style.height old: ', this.div2.style.height, parseInt(this.div2.style.height), 'this.div2.clientHeight', this.div2.clientHeight, parseInt(this.div2.clientHeight),
      '\nthis.div2.style.height new', div2h,
      '\ndiv1h + div2h', div1h + div2h + 10
      );
      
      this.div1.style.height = div1h + 'px'
      this.div2.style.height = div2h + 'px'
      this.startY = this.dragY
      
      console.log('%csrc/app/tas-resizer/tas-resizer.component.ts:86 div1.clientHeight, this.dragY, this.startY, parent.clientHeight', 'color: #007acc;', 
      '\nthis.parent.clientHeight: ', this.parent.clientHeight, 
      '\nthis.dragY: ', this.dragY, 
      '\nthis.startY: ', this.startY, 
      '\nthis.div1.clientHeight: ', this.div1.clientHeight,
      '\nthis.div2.clientHeight: ', this.div2.clientHeight,
      '\nthis.div1.style.height old: ', this.div1.style.height, parseInt(this.div1.style.height), 'this.div1.clientHeight', this.div1.clientHeight, parseInt(this.div1.clientHeight),
      '\nthis.div1.style.height new', div1h,
      '\nthis.div2.style.height old: ', this.div2.style.height, parseInt(this.div2.style.height), 'this.div2.clientHeight', this.div2.clientHeight, parseInt(this.div2.clientHeight),
      '\nthis.div2.style.height new', div2h,
      '\ndiv1h + div2h', div1h + div2h + 10
      );
    }
    else if(this.config().type == 'w') {
      this.dragX = event.clientX

      console.log('%csrc/app/tas-resizer/tas-resizer.component.ts:57 div1.clientWidth, this.dragX, this.startX, parent.clientWidth', 'color: #007acc;', 
      '\nthis.div1.clientWidth: ', this.div1.clientWidth, 
      '\nthis.dragX: ', this.dragX, 
      '\nthis.startX: ', this.startX, 
      '\n(this.dragX - this.startX): ', (this.dragX - this.startX), 
      '\n(this.div1.clientWidth + (this.dragX - this.startX)): ', (this.div1.clientWidth + (this.dragX - this.startX)), 
      '\nthis.parent.clientWidth: ', this.parent.clientWidth, 
      'this.div1.style.width', Math.min(Math.max(this.div1.clientWidth + (this.dragX - this.startX), this.config().minSize), this.parent.clientWidth - this.config().minSize - 10),
      'this.div2.style.width', Math.max((this.parent.clientWidth - parseInt(this.div1.style.width) - 10), this.config().minSize));

      this.div1.style.width = Math.min(Math.max(this.div1.clientWidth + (this.dragX - this.startX), this.config().minSize), this.parent.clientWidth - this.config().minSize - 10) + 'px'
      this.div2.style.width = Math.max((this.parent.clientWidth - parseInt(this.div1.style.width) - 10), this.config().minSize) + 'px'
      this.startX = this.dragX
    }
  }

  dragEnd(event: MouseEvent) {
    this.isDrag = false
  }

  resize(div1px: any, div2px: any) {
    var type = this.config().type == 'h' ? 'height' : 'width'
    this.div1.style[type] = div1px
    this.div2.style[type] = div2px
  }
}