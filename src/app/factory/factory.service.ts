import { Injectable, NgZone, inject } from '@angular/core'
import { Router } from '@angular/router'
import { Clipboard } from '@angular/cdk/clipboard'

@Injectable({
  providedIn: 'root'
})
export class FactoryService {
  zone = inject(NgZone)

  // TASALERT
  tasAlertData: any = {
    showTasAlert: false,
    type: '',
    message: '',
    timeout: 2000
  }
  tasAlert(message: any, type: string, timeout: number = 0) {

    this.tasAlertData.message = message || 'Default message', // Fallback for message
    this.tasAlertData.type = type
    this.tasAlertData.showTasAlert = true 
    if(timeout)
      setTimeout(() => {
        this.tasAlertData.showTasAlert = false
      }, timeout)
  }

  // LOADER
  loader: boolean = false
  apiCount = 0
  showLoader = () => {
    if (++this.apiCount > 0) {
      this.loader = true
    }
    // console.log('%csrc/app/factory/factory.service.ts:40 this.apiCount', 'background-color: #e0aa4c;color: #6a2131', this.apiCount);
  }
  hideLoader() {
    if (--this.apiCount === 0) {
      this.loader = false
    }
    // console.log('%csrc/app/factory/factory.service.ts:46 this.apiCount', 'background-color: #e0aa4c;color: #6a2131', this.apiCount);
  }

  // CONTEXTMENU
  contextMenuConfig: any = {
    list: [],
    visible: false,
    position: {
      left: '0',
      top: '0',
    },
    level: 0
  }

  contextMenus: any = {}

  addContextMenu(data: any, id: string) {
    console.log('%csrc/app/factory/factory.service.ts:68 data, id', 'color: #007acc;', data, id)
    this.contextMenus[id] = {
      id: id,
      list: [],
      visible: false,
      position: {
        left: '0',
        top: '0',
      },
      level: 0
    }
    Object.assign(this.contextMenus[id], data)
    if(typeof data.list[0] == 'string') {
      if(data.type == 'single' || data.type == 'multiple')
        this.contextMenus[id].list = data.list.map((item: any)=>{
          return {
            value: item,
          }
        })
      else
        this.contextMenus[id].list = data.list.map((item: any)=>{
          return {
            value: item,
            callback: data.callback
          }
        })
    }
    if(data.iframe) {
      if(!this.iframeContextMenuList.includes(id))
        this.iframeContextMenuList.push(id)
      window.onblur = (e: any) => {
        this.initIframeContextMenu()
      }
      this.initIframeContextMenu()
    }
    if(Object.keys(this.contextMenus).length)
      this.contextMenuConfig = this.contextMenus[id]
    // console.log('%csrc/app/factory/factory.service.ts:80 this.contextMenus', 'color: #007acc;', this.contextMenus[id])
  }

  getPosition(mouse: any, size: any, screen: any) {
    // console.log(
    //   '%csrc/app/factory/factory.service.ts:62 object',
    //   'color: #007acc;',
    //   '\nmouse', mouse,
    //   '\nsize', size,
    //   '\nscreen', screen,
    //   '\nmouse + size < screen', mouse + size < screen,
    //   '\nmouse - size < 0', mouse - size < 0,
    //   '\nscreen - size', screen - size,
    //   '\nmouse - size', mouse - size,
    // )
    if (mouse + size < screen) return mouse
    else if (mouse - size < 0) return screen - size
    else return mouse - size
  }

  showContextMenu(event: any, id: any) {
    event.preventDefault()
    this.zone.run(() => {
      this.contextMenuConfig = this.contextMenus[id]
      var contextMenu = document.querySelector('#' + id + '_0') as HTMLElement
      var position = {
        left:
          this.getPosition(
            event?.clientX,
            contextMenu?.clientWidth,
            document.body?.clientWidth
          ) + 'px',
        top:
          this.getPosition(
            event?.clientY,
            contextMenu?.clientHeight,
            document.body?.clientHeight
          ) + 'px',
      }
      Object.assign(this.contextMenuConfig, {
        visible: true,
        position: position
      })
    })

  }

  hideContextMenu() {
    // console.log('%cHello src/app/factory/factory.service.ts:97 hide', 'background: green; color: white; display: block;');
    this.zone.run(() => {
      this.contextMenuConfig.visible = false
    })
  }

  // Context Menu inside iframe
  showContextMenuIframe(event: any, id: any) {
    event.preventDefault()
    this.zone.run(() => {
      this.contextMenuConfig = this.contextMenus[id]



      var ele = document.querySelector('#' + id) as HTMLIFrameElement

      var contextMenu = document.querySelector('#' + id + '_0') as HTMLElement
      // distance of mouse from top left of iframe + distance of iframe from top left of screen
      var position = {
        left:
          this.getPosition(
            event?.clientX + ele.getBoundingClientRect().x,
            contextMenu?.clientWidth,
            document.body?.clientWidth
          ) + 'px',
        top:
          this.getPosition(
            event?.clientY + ele.getBoundingClientRect().y,
            contextMenu?.clientHeight,
            document.body?.clientHeight
          ) + 'px',
      }
      Object.assign(this.contextMenuConfig, {
        visible: true,
        position: position
      })
    })
  }
  // list of ids of iframes to have contextmenu
  iframeContextMenuList: string[] = []

  // add onblur to document which will be triggered if any iframe is clicked
  addIframeContextMenu(id: string) {
    this.iframeContextMenuList.push(id)
    // console.log('%csrc/app/factory/factory.service.ts:175 id', 'color: #007acc;', id, this.iframeContextMenuList, document, document.onblur, window, !window.onblur);
      if(!window.onblur)
        window.onblur = (e: any) => {
          // console.log('%cHello src/app/factory/factory.service.ts:178 factory blur', 'background: purple; color: white; display: block;', window.onblur, this.iframeContextMenuList);
          this.initIframeContextMenu()
        }
      this.initIframeContextMenu()
  }

  // access element inside iframe and add contextmenu event to it
  initIframeContextMenu() {
    this.iframeContextMenuList.map((id: any) => {
      console.log(' idid', id)
      console.log("DOMDOM", document.querySelector('#' + id))
      var ele = document.querySelector('#' + id) as HTMLIFrameElement
      console.log('ELE', ele)
      var noContext = ele?.contentWindow?.document.querySelector('html') as HTMLElement
      // console.log('%csrc/app/factory/factory.service.ts:151 document', 'color: #007acc;', id, document, ele, noContext, ele?.onclick, noContext?.oncontextmenu);
      if(noContext && !noContext?.oncontextmenu) {
        noContext.oncontextmenu = (e: any) => {
          e.preventDefault()
          this.showContextMenuIframe(e, id)
        }
        // noContext.onclick = (e: any) => {
          // this.hideContextMenu()
          // console.log('%csrc/app/factory/factory.service.ts:194 e', 'color: #007acc;', e);
        // }
        // document.onclick = (e: any) => {
        //   this.hideContextMenu()
        //   // console.log('%csrc/app/factory/factory.service.ts:198 e', 'color: #007acc;', e);
        // }
        return false
      }
      return true
    })


  // if(!this.iframeContextMenuList.length) window.onblur = null

  // console.log('%csrc/app/factory/factory.service.ts:206 ', 'color: #007acc;', this.iframeContextMenuList);
  }
  // selectedItem: any = this.contextMenuItems[0]
  
  // CLIPBOARD
	clipboard = inject(Clipboard)
	copy2DToClipboard = (array: string | any[]) => {
		console.log('%c factory.service.js line:9 array', 'color: #007acc;', array);
		var string = '', row, cell;
		for (row = 0; row < array.length; row++) {
			for (cell = 0; cell < array[row].length; cell++) {
				string += (array[row][cell] + '').replace(/[\n\t]+/g, ' ');
				if (cell + 1 < array[row].length) string += '\t';
			}
			if (row + 1 < array.length) string += '\n';
		}
		this.clipboard.copy(string)
		// this.copyTextToClipboard(string);
		return string
	}

  // LOGOUT
  router = inject(Router)

  logout_func() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}
