import { Component, HostListener, inject, input } from '@angular/core';

// import {tasAlert} from FactoryService
import { FactoryService } from './factory.service';
import { CommonModule } from '@angular/common';
import { BypassHtmlSanitizerPipe, Filter } from '../services/pipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Config {
  id: string;
  list: any[];
  visible: boolean;
  selectionType?: string;
  search?: boolean;
  save?: boolean;
  callback?: Function;
  position: any;
  level: any;
}
@Component({
  selector: 'app-context-menu',
  standalone: true,
  template: `
    <ul
      id="{{ config().id + '_' + config().level }}"
      class="contextMenu"
      (click)="$event.stopPropagation()"
      [hidden]="!config().visible"
      [ngStyle]="config().position"
    >
      @if(config().search) {
      <li class="search" (click)="$event.stopPropagation()">
        <input [(ngModel)]="filter" placeholder="Search">
      </li>
      } @for(item of config().list | filter:filter:'value'; track item) {
        <li
          id="contextMenuItem_{{ config().level + '_' + $index }}"
          class="contextMenuItem flexCenter"
          (mouseenter)="hoverOn($event, $index)"
          (mouseleave)="hoverOff($event)"
          (click)="select($event, item)"
          [ngClass]="{active: selection.includes(item)}"
        >
          <!-- <label for="ip_{{ config().level + '_' + $index }}" class="visual"> -->
          @if(config().selectionType) {
          <i class="fa fa-check" aria-hidden="true"></i>
          } @if(item.iconBefore) {
          <div
            style="display: flex;align-items: center"
            [innerHTML]="item.iconBefore | bypassHtmlSanitizer"
          ></div>
          }
          <span style="flex-grow: 1;">{{ item.text || item.value }}</span>
          @if(item.iconAfter) {
          <div
            style="display: flex;align-items: center"
            [innerHTML]="item.iconAfter | bypassHtmlSanitizer"
          ></div>
          }
          <!-- </label> -->
          @if(item.children?.length) {
            <svg style="height: 10px" viewBox="0 0 5 10" focusable="false">
            <polygon points="0,0 5,5 0,10"></polygon>
            </svg>
            <app-context-menu
              [config]="getChildConfig(item.children, $index)"
            ></app-context-menu>
          }
        </li>
      } @if(config().save) {
        <li class="save flexCenter" (click)="execute($event)">
          <button>
          <i class="fa fa-save" aria-hidden="true"></i>
          Save
          </button>
        </li>
      }
    </ul>
  `,
  styles: `
    [hidden] {
      display: block !important;
      visibility: hidden !important;
    }
    .contextMenu {
      position: fixed;
      z-index: 20;
      /* font-size: 14px; */
      display: flex;
      flex-direction: column;
      gap: 2px;
      background-color: #f5f5f5;
      /* border: 1px solid #ccc; */
      border-radius: 8px;
      box-shadow: 2px 4px 16px rgb(64 64 64 / 20%);
      padding: 0;
      /* margin: 0; */
      max-height: 400px;
      overflow-y: auto;
      /* list-style: none; */
    }
    .contextMenuItem {
      /* width: 100%; */
      /* display: flex; */
      gap: 8px;
      /* align-items: center; */
      /* font-weight: 500; */
      cursor: pointer;
      padding: 4px 16px;
      text-align: left;
    }
    .visual {
      flex-grow: 1;
      display: flex;
      gap: 8px
    }
    .contextMenuItem:hover {
      /* background: #0000000a; */
      background: #e0f3ff;
      /* color: #4b00ff; */
    }
    .contextMenuItem:active {
      background:#cce7ff;
    }
    .active {
      /* background-color: #d3e2d6; */
      font-weight: 600;
      background-color:#cfeafc;
      color: #0384fc;

    }
    .search {
      padding: 8px;
      border-bottom: 1px solid #DADEE7;
      background-color: #F7F8FB;
      position: sticky;
      top: 0;
      /* z-index: 1; */
    }
    .search>input {
      /* width: 100%; */
      height: 28px;
      padding: 0px 8px;
      border-radius: 4px;
      /* background-color: #FFFFFF; */
      border: 1px solid #EBEDF3;
    }
    .save {
      position: sticky;
      bottom: 0;
      /* z-index: 1; */
      background: #f5f5f5;
      /* height: auto; */
      /* display: flex; */
      /* justify-content: center; */
      padding: 8px
    }
    .save>button {
      padding: 4px 8px;
      margin: 0;
      /* display: flex; */
      gap: 4px;
      /* text-align: center; */
      /* align-items: center; */
      font-size: 12px;
      /* font-style: normal; */
      /* font-weight: 700; */
      /* line-height: 150%; */
      /* letter-spacing: 0.24px; */
      border-radius: 4px;
      background: #0384FC;
      /* border: none; */
      color: white;
    }
  `,
  imports: [CommonModule, BypassHtmlSanitizerPipe, FormsModule, ReactiveFormsModule, Filter],
})
export class ContextMenuComponent {
  
  config = input.required<Config>()

  filter = ''
  selection: any = []

  factory = inject(FactoryService)

  ngOnInit() {
    // console.log(
    //   '%csrc/app/factory/context-menu.component.ts:35 visible',
    //   'color: #aa7acc;',
    //   this.visible,
    //   this.position,
    //   this.itemList,
    //   this.level
    // );
  }

  hoveredElement: any;

  newPosition = {
    left: '0',
    top: '0',
  };

  hoverOn($event: MouseEvent, $index: number) {
    this.hoveredElement = ($event.target as HTMLElement).id;
    // var list = document.querySelector('#contextMenu_'+this.level) as HTMLElement
    var itemElement = document.querySelector(
      '#contextMenuItem_' + this.config().level + '_' + $index
    ) as HTMLElement;
    var childList = document.querySelector(
      '#' + this.config().id + '_' + (this.config().level + 1)
    ) as HTMLElement;

    // console.log(
    //   '%csrc/app/factory/context-menu.component.ts:139',
    //   'color: #007acc;',
    //   '#contextMenuItem_' + this.config().level + '_' + $index,
    //   item,
    //   '#contextMenu_' + (this.config().level + 1),
    //   childList
    // );
    if (childList)
      this.newPosition = {
        left:
          (parseInt(this.config().position.left) +
            itemElement?.clientWidth +
            childList.clientWidth <
          document.body?.clientWidth
            ? parseInt(this.config().position.left) + itemElement?.clientWidth
            : parseInt(this.config().position.left) - childList?.clientWidth) + 'px',
        top:
          (parseInt(this.config().position.top) +
            (itemElement.clientHeight + 8) * $index +
            childList.clientHeight <
          document.body?.clientHeight
            ? parseInt(this.config().position.top) + (itemElement.clientHeight + 8) * $index
            : parseInt(this.config().position.top) +
              (itemElement.clientHeight + 8) * ($index + 1) -
              childList?.clientHeight) + 'px',
      };

    // console.log(
    //   '%csrc/app/factory/context-menu.component.ts:95 ele, ',
    //   'color: #007acc;',
    //   '\n\nlevel',
    //   this.level,
    //   $index,
    //   '\n\n$event',
    //   $event,
    //   '\n$event.target',
    //   $event.target,
    //   '\nthis.hoveredElement',
    //   this.hoveredElement,
    //   '\nthis.visible',
    //   this.visible,
    //   '\nitem',
    //   item,
    //   '\nitem.clientWidth',
    //   item.clientWidth,
    //   '\nitem.clientHeight',
    //   item.clientHeight,
    //   '\nthis.config().position',
    //   this.config().position,
    //   '\nthis.newPosition',
    //   this.newPosition,
    //   '\nthis.config().position.left',
    //   this.config().position.left,
    //   parseInt(this.config().position.left),
    //   parseInt(this.config().position.top) +
    //     (item.clientHeight + 8) * $index +
    //   childList.clientHeight,
    //   document.body?.clientHeight,
    //   parseInt(this.config().position.top) + (item.clientHeight + 8) * $index,
    //   parseInt(this.config().position.top) + (item.clientHeight + 8) * ($index + 1) - childList?.clientHeight
    // );
  }
  hoverOff($event: MouseEvent) {
    // setTimeout(() => {
    this.hoveredElement = '';
    // }, 4000);
    // console.log(
    //   '%csrc/app/context-menu/context-menu.component.ts:93 $event',
    //   'color: #007acc;',
    //   $event,
    //   this.hoveredElement,
    //   this.visible
    // );
  }
  select($event: MouseEvent, item: any) {
    $event.stopPropagation();
    // console.log('%csrc/app/factory/context-menu.component.ts:248 $event, item', 'color: #007acc;', $event, item, this.config().selectionType);
    switch(this.config().selectionType) {
      case 'single':
        this.selection = [item]
        break
      case 'multiple':
        var ind = this.selection.indexOf(item)
        ind > -1 ? this.selection.splice(ind, 1) : this.selection.push(item)
        break
      default:
        // console.log('%cHello src/app/factory/context-menu.component.ts:331 ', 'background: green; color: white; display: block;');
        try {
          item.callback(item.value)
          this.factory.hideContextMenu()
        } catch(error) {
          // console.log('%cerror src/app/factory/context-menu.component.ts line:261 ', 'color: red; display: block; width: 100%;', error);
          this.factory.tasAlert('ERROR', 'error', 2000);
        }
    }
  }
  execute($event: MouseEvent) {
    try {
      // console.log(
      //   '%cHello src/app/factory/context-menu.component.ts:179 operaztion',
      //   'background: green; color: white; display: block;',
      //   item.operation
      // );
      $event.stopPropagation();
      if (this.config().callback) {
        // item.callback(item.text);
        // item?.callback(this.selection);
        (this.config() as any).callback(this.selection.map((item: { value: any }) => item.value))
        this.factory.hideContextMenu()
        this.selection = []
      }
    } catch (e) {
      this.factory.tasAlert('ERROR', 'error', 2000)
    }
  }
  getChildConfig(children: any, ind: number): Config {
    var config = JSON.parse(JSON.stringify(this.config()))

    Object.assign(config, {
      list: children,
      visible: this.hoveredElement == 'contextMenuItem_' + this.config().level + '_' + ind,
      position: this.newPosition,
      level: this.config().level + 1
    })
    return config
  }
  
  @HostListener('document:click')
    hideContextMenu(){
    // console.log('click hidecm')
    this.factory.hideContextMenu()
  }
}
