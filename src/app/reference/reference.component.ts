import { Component, OnInit, Output, OnChanges, EventEmitter, ViewChild, forwardRef, ElementRef, SimpleChanges, input, computed, effect, inject, Renderer2, ChangeDetectorRef, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe.pipe';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {
  NzDropDownModule,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { MatDialogModule } from '@angular/material/dialog';
import { AGGridConfig, AgGridComponent } from "../ag-grid/ag-grid.component";
import { DropdownComponent, dropdownConfig } from "../dropdown/dropdown.component";
import { APIConfig } from '../../../SETTINGS.service';
import { interval, timer } from 'rxjs';
import { FactoryService } from '../factory/factory.service';
declare var $: any;

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);
interface toolbarConfig {
  leftMinimise?: boolean,
  title?: string;
  leftMenu?: boolean;
  docTypes?: any[];
  customTabList?: any[];
  markClear?: Boolean;
  getpage?: boolean
  select_doctype?: boolean
  center?: string;
  docInfo?: Boolean;
  pagination?: Boolean;
  save?: Boolean;
  dropdown?: {
    [key: string]: dropdownConfig;
  },
  close?: Boolean;
  rightMinimise?: boolean;
}
export interface referenceConfig {
  viewChange?: Function;
  id: string;
  active: any;
  pnoList: Number[];
  // selet_doctype: boolean;
  selectedPno: Number;
  filePaths: any;
  crop_callback: Function;
  selectedTab: string;
  toolbarConfig?: toolbarConfig;
  errorSummaryGrid?: AGGridConfig;
  ref?: any;
  clear?: Function;
  save?: Function;
  leftMenu?: Function;
  contextMenu?: any;
  selectedOption?: string;
  pdfvisible?: boolean;
  minimiseFlg?: boolean;
  active_page?: number;
  select_page?: boolean;
}
export interface UserModel {
  name: string;
  age: Number;
  address: string;
  email: string;
}
@Component({
  selector: 'app-reference',
  standalone: true,
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReferenceComponent),
      multi: true,
    },
  ],
  imports: [
    SafePipe,
    CommonModule,
    FormsModule,
    MatTab,
    MatTabGroup,
    MatTabsModule,
    SafePipe,
    CommonModule,
    FormsModule,
    MatDialogModule,
    NzTabsModule,
    NzDropDownModule,
    NzDropdownMenuComponent,
    MatMenuModule,
    MatIconModule,
    RouterModule,
    PdfJsViewerModule,
    AgGridComponent,
    DropdownComponent,
  ]
})
export class ReferenceComponent implements OnInit, OnChanges {
  @Output() newItemEvent = new EventEmitter<string>();
  user = input<UserModel>();

  /*  userSocial = computed(() => {
    const {...userSocial} =  this.user();
    console.log('userSocial',userSocial);
    return Object.values(userSocial);
  }); */
  // @Input() config: any;
  @Input() pdfReference!: referenceConfig;  // ✅ Get reference config from `review.ts`

  active_page: any = 1
  config = input.required<referenceConfig>();
  selectedPno = computed(() => this.config().selectedPno)

  @ViewChild('footer') footer!: ElementRef;
  contextMenuCoords: { [klass: string]: any } | null | undefined;
  footerHeight: number = 50;

  constructor(private factory: FactoryService, private renderer: Renderer2, private cdr: ChangeDetectorRef) {
    console.log('constructor ->');
    effect(() => {
      console.log('effect----------------------------------------');
    });
  }

  api = inject(APIConfig)

  dropdownOpen: boolean = false;
  dropdownItems: string[] = ['Class Based', 'Batch Based', 'Doc Based'];
  act_sd_mnu: Boolean = false;
  selectedOption: string = 'Class Based';
  selectedItem: string | undefined;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  selectItem(item: string) {
    /* switch (item) {
      case 'Class Based':
        this.router.navigate(['/class-based']);
        break;
      case 'Batch Based':
        this.router.navigate(['/batch-based']);
        break;
      case 'Doc Based':
        this.router.navigate(['/doc-based']);
        break;
      default:
        break;
    } */
    this.dropdownOpen = false; // Close the dropdown after selection
    this.config().selectedOption = item;
    (this.config() as any).viewChange(item)
  }
  // this.selectedOption = item;

  defaultGrid = {
    columnDefs: [],
    rowData: [],
    gridOptions: {},
    defaultColDef: {},
    flags: {},
  }

  docTypes = ['WEB DOC', 'IMAGE', 'PDF'];
  active: any = ''; // = this.docTypes[0]
  tabList = ['Reference', 'Add/Edit Formula', 'Add/Edit Relationship'];
  selectedTab: any; // = this.tabList[0]

  // page numbers
  pnoList!: any[];


  docInfo!: any;

  ngOnChanges(changes: SimpleChanges): void {
    console.log("🔄 ngOnChanges triggered:", changes);

    if (changes['pdfReference']) {
      console.log("📌 PDF Reference Updated:", changes['pdfReference']);
    }

    if (this.config().select_page) {
      console.log("📌 select_page is TRUE, triggering __handleClick()");
      this.select_page = false;
      timer(1000).subscribe(() => {
        this.selet_page();
        this.cdr.detectChanges()
      })
    }
  }

  // toolbarConfig = {
  //   left: 0, // 1, 2, 3
  //   // center: 'customTabs',
  //   center: 'markClear',
  //   docInfo: true,
  //   pagination: true,
  //   save: true,
  //   right: 1, // 0, 1, 2
  // };

  // url for iframe
  // webDoc = '/assets/no_page_found.html';
  // pdf = '/assets/no_page_found.html';
  // img = '/assets/no_page_found.html';
  @ViewChild('pdfViewerOnDemand', { static: false }) pdfViewerOnDemand: any;


  ngAfterViewInit() {
    console.log('ngAfterViewInit', this.config);
    if (this.pdfViewerOnDemand != undefined) {

      /*  console.log('this.pdfViewerOnDemand', this.pdfViewerOnDemand);
       this.pdfViewerOnDemand.pdfSrc = this.config().pdf;
       this.pdfViewerOnDemand.refresh(); */
    }
  }
  value: any;
  mark_annotation = false;
  select_page: boolean = false;
  select_doctype_: boolean = false
  select_doctype_1: boolean = false
  ngOnInit() {
    console.log("ngoninit", this.config(), this.config().select_page)
    // this.getImgWidth('refImg')
    // this.config().pdf =  encodeURIComponent('/getDataNew?projid=10001&docid=5181&pgno=1&get=pdfpagedata')
    if (this.config().contextMenu)
      this.factory.addContextMenu(this.config().contextMenu, this.config().id)
    this.config().pdfvisible = true;
    this.config().select_page = true;
    this.config().selectedOption = 'Class Based'
    // this.selet_doctype_()
    console.log("ngoninit inside", this.config(), this.config().select_page)
    this.docTabChange(this.config().active)
  }
  pdfvisible: boolean = true

  // image zoom level
  zoomSize: any = 1;
  zoomPercent: any = 100;
  imgZoomDims: any = {
    width: 'auto',
  };
  imgZoom(id: any, zoom: any = 1) {
    console.log('config', this.config());
    // setTimeout(() => {
    // return target?.offsetWidth * this.zoomSize + 'px' || 0
    console.log('document.querySelector', document.querySelector('#' + id));
    var target = document.querySelector('#' + id) as HTMLImageElement;
    console.log('Target', target);
    // var target = document.querySelector('img') as HTMLImageElement

    // this.imgZoomDims.width = 'auto'

    // if(target?.offsetWidth){
    // target.style.width = (target?.offsetWidth ? target?.offsetWidth*this.zoomSize : 600) + 'px'
    // this.imgZoomDims = target?.offsetWidth*this.zoomSize + 'px'
    // return {
    //     'width': (target?.offsetWidth*this.zoomSize) + 'px'
    //   }
    // }
    // else
    this.zoomSize = zoom;
    // setTimeout(() => {
    console.log(
      '%csrc/app/reference/reference.component.ts:58 target, target.target',
      'color: #007acc;',
      id,
      target,
      target?.offsetWidth,
      target?.naturalWidth,
      this.zoomSize,
      zoom,
      this.imgZoomDims
    );
    if (zoom == 'fitW')
      this.imgZoomDims = {
        width: '100%',
      };
    else if (zoom == 'fitH')
      this.imgZoomDims = {
        height: '100%',
      };
    else
      this.imgZoomDims = {
        width: target?.naturalWidth * zoom + 'px',
        'max-width': 'unset',
      };

    // var target = document.querySelector('#'+id) as HTMLImageElement
    // return {
    //   'width': (target?.offsetWidth*this.zoomSize) + 'px'
    // }
    // }, 1);
    // return
    // }, 10);
  }

  toogleFooter() {
    this.config().minimiseFlg = !this.config().minimiseFlg;
    // if (this.config().minimiseFlg) {
    //   console.log('this.footer', this.footer);
    //   const footerElement = this.footer.nativeElement;
    //   console.log('footerElement', footerElement);
    //   if (footerElement) {
    //     const footerHeight = footerElement.clientHeight;
    //     this.footerHeight = footerHeight;
    //     // Adjusting top margin to move parent div up
    //     const parentElement = document.querySelector('.parent');
    //     if (parentElement) {
    //       parentElement.setAttribute(
    //         'style',
    //         `margin-bottom: ${footerHeight + 50}px`
    //       );
    //     }
    //   }
    // } else {
    //   // Resetting top margin to move parent div down
    //   const parentElement = document.querySelector('.parent');
    //   if (parentElement) {
    //     parentElement.setAttribute('style', 'margin-bottom: 100px');
    //   }
    // }
  }
  componentHeight() {
    if/* (this.config().minimiseFlg) return '0%'
    else if */(this.config().toolbarConfig) return 'calc(100% - 40px)'
    else return '100%'
  }
  pdf1() {
    console.log("clicked")
  }
  @Output() bboxOutput = new EventEmitter()
  @Output() pageNumber = new EventEmitter()//pageNumber
  @Output() doctype_info = new EventEmitter()//doctype_info
  // change doc type
  docTabChange(type: string) {
    console.log('Type :', type);
    console.log('this.config()', this.config());
    // if (this.config().active == type) return;
    this.config().active = type
    timer(100).subscribe(() => {
      if (this.config().filePaths[type].type == 'iframe') {
        var iframe = document.getElementById(this.config().id) as HTMLIFrameElement
        console.log('%csrc/app/reference/reference.component.ts:378 iframe, this.config().id', 'color: #007acc;', iframe, this.config().id, document.getElementById(this.config().id), iframe.contentWindow!.document.querySelector('html'), iframe.contentWindow!.document.querySelector('html')!.onclick);

        iframe.contentWindow!.document.querySelector('html')!.onclick = (e: any) => {
          e.preventDefault()
          var target = e.target
          var n = target.nodeName
          if (target.childNodes?.[0]?.nodeName == 'P')
            target = target.childNodes[0]
          else if (n == 'SPAN')
            target = target.parentNode
          var bboxes: number[][] = []
          if (target.nodeName == 'P') {
            target.childNodes.forEach((node: any) => {
              var bbox = [node.getAttribute('rects').split('_').map((r: any) => parseInt(r))]
              bbox.map((box: number[]) => {
                box[2] = box[2] - box[0]
                box[3] = box[3] - box[1]
              })
              bboxes.push(...bbox)
            });
            this.bboxOutput.emit(bboxes)
          }
        }
      }
      this.clearAll_hightlights(this.config().id);
    })

    // switch (type) {
    //   case 'WEB DOC':
    //     // this.config().active = 'WEB DOC';
    //     break;
    //   case 'IMAGE':
    //     // this.config().active = 'IMAGE';
    //     setTimeout(() => {
    //       this.imgZoom(this.config().id, this.zoomSize);
    //     }, 100);
    //     // var int = setInterval(() => {
    //     //   this.getImgWidth('refImg')
    //     //   console.log('%csrc/app/reference/reference.component.ts:94 document.querySelector("#refImg")', 'color: #007acc;', document.querySelector("#refImg"));
    //     //   if(document.querySelector('#refImg')!=null)
    //     //     clearInterval(int)
    //     // }, 1);
    //     break;
    //     break;
    //     case 'PDF':
    //       // this.config().active = 'PDF';
    //       break;
    //   case 'Type 3':
    //     // this.config().active = 'Type 3';
    //     break;
    //   case 'Error Summary':
    //     // this.config().active = 'Error Summary';

    //     break;
    // }
    // this.factory.tasAlert(type, '', 200)
    console.log('this.config().acctive ---------', this.config().active);
  }

  // Called on click, handles CTRL + Click detection
  __handleClick(): void {
    console.log("Rajat Ranjan Mark Annotaion")
    // Select the iframe element
    const iframe = this.pdfViewerOnDemand.iframe.nativeElement as HTMLIFrameElement;
    console.log("Iframe Element:", iframe);

    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    console.log("iframeDoc", iframeDoc);

    if (iframeDoc) {
      // Listen to the click event inside the iframe document
      console.log("insider iframeDoc", iframeDoc);
      this.renderer.listen(iframeDoc, 'click', (event: MouseEvent) => {
        // Check if CTRL key is pressed
        console.log("click event", event);
        // if (event.ctrlKey) {
        // Find the closest page element
        const clickedElement = event.target as HTMLElement;
        const pageElement = clickedElement.closest('.page[data-page-number]');

        if (pageElement) {
          // Get the page number from the data attribute
          const pageNumber = pageElement.getAttribute('data-page-number');
          console.log(`CTRL + Clicked on Page Number: ${pageNumber}`);
          this.pageNumber.emit(pageNumber)
          this.config().crop_callback(pageNumber)
        }
        // }
      });
    } else {
      console.error('Unable to access iframe document.');
    }
    return

  }

  // this.__handleClick()
  selet_page() {
    this.select_page = true
    console.log("this.select_page")
    if (this.select_page)
      this.__handleClick()
  }
  selet_doctype_() {
    console.log(this.config())
    // this.select_doctype_ = !this.select_doctype_
    console.log("select_doctype_", this.select_doctype_)
    if (this.select_doctype_)
      this.selcted_Document_Type(this.config().id)
  }

  selet_doctype_1() {
    console.log(this.config())
    this.select_doctype_1 = !this.select_doctype_1
    console.log("select_doctype_1", this.select_doctype_1)
    if (this.select_doctype_1)
      this.selcted_Document_Type1(this.config().id)
  }

  markAnnotation() {
    this.config().filePaths['PDF'] = this.config().filePaths['PDF'];
    this.mark_annotation = !this.mark_annotation;
    // Rajat Ranjan Kumar
    console.log("this.pdf", this.pdfViewerOnDemand)



    if (this.mark_annotation) {
      console.log('mark_annotation');
      return
      if (this.config().active == 'IMAGE') {
        var iframedom = document;
        var img_iframe = '#img_cnc_' + this.config().id;
        this.canvasInit(iframedom, img_iframe, [], '');
        this.createcanvas();
      } else if (this.config().active == 'PDF') {
        if (
          document.querySelector('#' + this.config().id + '_pdf') != undefined
        ) {
          console.log('canvasWrapper');
          var iframe_dom = $(`${'#' + this.config().id + '_pdf'} iframe`)[0]
            .contentWindow.document;
          var img_iframe = '.canvasWrapper';
          this.canvasInit(iframe_dom, img_iframe, [], '');
          this.createcanvas();
        }
      }
    } else {
      if (this.config().active == 'IMAGE') {
        const elements = document.querySelectorAll('.drawcanvas');
        console.log('elements', elements);
        elements.forEach((element) => {
          element.remove();
        });
      } else {
        const elements = $(
          `${'#' + this.config().id + '_pdf'} iframe`
        )[0].contentWindow.document.querySelectorAll(
          '.canvasWrapper .drawcanvas'
        );
        console.log('elements', elements);
        elements.forEach((element: any) => {
          element.remove();
        });
      }

      this.clear_canvas();
    }
  }

  img_pdf_reference(bbox: number[][], coord: number[]) {
    // let bbox: number[][] = [];
    // let coord: number[] = [];
    // if (seq == 1) {
    //   bbox = [[211, 102, 171, 7]];
    //   coord = [0, 0, 595, 841];
    // } else if (seq == 2) {
    //   bbox = [[283, 127, 80, 7]];
    //   coord = [0, 0, 595, 841];
    // } else if (seq == 3) {
    //   bbox = [[78, 288, 241, 7]];
    //   coord = [0, 0, 595, 841];
    // } else if (seq == 4) {
    //   bbox = [[184, 373, 76, 7]];
    //   coord = [0, 0, 595, 841];
    // } else if (seq == 5) {
    //   bbox = [[240, 177, 113, 7]];
    //   coord = [0, 0, 595, 841];
    // }
    console.log('this.config().active', this.config().active, bbox, coord);
    if (this.config().active == 'IMAGE')
      this.highlightsbbox_withclass_image(
        '#img_cnc_' + this.config().id,
        bbox,
        coord,
        'parent_iframe_tag',
        true,
        '',
        '',
        '',
        ''
      );
    else if (this.config().active == 'PDF')
      this.highlightsbbox_withclass_pdf(
        '#' + this.config().id + '_pdf',
        bbox,
        coord,
        'parent_iframe_tag',
        true,
        '',
        '',
        '',
        ''
      );
  }
  clearAllHighlights() {
    this.clear_all_highlight(this.config().id);
  }

  // Implement the writeValue method
  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      this.value = value;
      // Perform other necessary operations
    } else {
      // Handle the case when value is null or undefined
      console.error('Cannot write value. Value is null or undefined.');
    }
  }
  cprms: any;
  canvasInit(doc: any, appendcon: any, taxolst: any, savecallback: any) {
    this.cprms = {
      document: doc || null,
      appendcon: ($(doc).find(appendcon) || [])[0] || null,
      canvasdom: null,
      w: 0,
      h: 0,
      ctx: null,
      s_mx: 0,
      s_my: 0,
      mx: 0,
      my: 0,
      offsetaxolsteft: 0,
      offsettop: 0,
      mousedown: false,
      st_clr: '#14c7e7',
      st_w: 2,
      resize_str_clr: 'red',
      resize_str_w: 2,
      resize_rect: 6,
      resize_options: {
        'nw-resize': {},
        'n-resize': {},
        'ne-resize': {},
        'w-resize': {},
        'e-resize': {},
        'sw-resize': {},
        's-resize': {},
        'se-resize': {},
      },
      canvas_cur: 'crosshair',
      resizedrawn: false,
      isResize: false,
      mousemove: false,
      taxolst: taxolst || [],
      tw: 200,
      // 'th':280,
      savecallback: savecallback || null,
    };
    console.log('this.cprms', this.cprms);
  }
  createcanvas = () => {
    // var this		= this;
    var containerdm = this.cprms['appendcon'];
    var doc = this.cprms['document'];
    console.log('containerdm', containerdm);

    if (!containerdm) return;
    var maxH = Math.max(
      Math.max(containerdm.scrollHeight, doc.documentElement.scrollHeight),
      Math.max(containerdm.offsetHeight, doc.documentElement.offsetHeight),
      Math.max(containerdm.clientHeight, doc.documentElement.clientHeight)
    );
    var maxW = Math.max(
      Math.max(containerdm.scrollWidth, doc.documentElement.scrollWidth),
      Math.max(containerdm.offsetWidth, doc.documentElement.offsetWidth),
      Math.max(containerdm.clientWidth, doc.documentElement.clientWidth)
    );
    console.log('doc.documentElement.clientWidth', containerdm.clientWidth);
    maxW = containerdm.clientWidth;
    console.log('containerdm', maxH, '\n', maxW);
    var vtt = $(containerdm).find('canvas.drawcanvas');
    console.log('vttvtt', vtt);
    if (vtt.length) {
      vtt.remove();
    }
    var canv = doc.createElement('canvas');
    $(canv).css({
      position: 'absolute',
      top: '0px',
      left: '0px',
      'z-index': 99,
      cursor: 'crosshair',
      display: 'block',
      width: '-webkit-fill-available !important',
    });
    $(canv).attr('width', maxW);
    $(canv).attr('height', maxH);
    $(canv).addClass('drawcanvas');
    this.cprms['w'] = maxW;
    this.cprms['h'] = maxH;
    if (maxW <= this.cprms['tw']) this.cprms['tw'] = maxW;
    this.cprms['canvasdom'] = canv;
    this.cprms['ctx'] = canv.getContext('2d');
    this.cprms['offsetaxolsteft'] = $(canv).offset().left;
    this.cprms['offsettop'] = $(canv).offset().top;
    this.cprms['canvas_cur'] = 'crosshair';
    this.cprms['isResize'] = false;
    containerdm.appendChild(canv);
    this.addpopup(this.cprms);
    var ctx = this.cprms['ctx'];
    $(canv).on('mousedown', (e: any) => {
      console.log('THIS', this['cprms']);
      if (e.which !== 3) {
        $(this.cprms?.['pdiv']).hide();
        this.cprms['mousedown'] = true;
        if (this.cprms['canvas_cur'] == 'crosshair') {
          this.cprms['mousemove'] = false;
          ctx.clearRect(0, 0, this.cprms['w'], this.cprms['h']); //clear canvas
          this.cprms['s_mx'] = parseInt(
            (e.originalEvent.layerX - this.cprms['offsetaxolsteft']).toString()
          );
          this.cprms['s_my'] = parseInt(
            (e.originalEvent.layerY - this.cprms['offsettop']).toString()
          );
          this.cprms['isResize'] = false;
        } else {
          this.cprms['isResize'] = true;
        }
      }
      // if(e.which === 3){

      // }
    });
    $(canv).on('mouseup', (e: any) => {
      console.log('EEEE', e.which);
      if (e.which !== 3) {
        var x = parseInt(
          (e.originalEvent.clientX - this.cprms['offsetaxolsteft']).toString()
        );
        var y = parseInt(
          (e.originalEvent.clientY - this.cprms['offsetaxolsteft']).toString()
        );
        this.cprms['isResize'] = false;
        this.cprms['mousedown'] = false;
        if (this.cprms['mousemove']) {
          this.cprms['mousemove'] = false;
          this.cprms['canvasdom'].style.cursor = 'crosshair';
          this.cprms['canvas_cur'] = 'crosshair';
        } else {
          this.cprms['mx'] = this.cprms['s_mx'] + 2;
          this.cprms['my'] = this.cprms['s_my'] + 2;
        }
        var width = this.cprms['mx'] - this.cprms['s_mx'];
        var height = this.cprms['my'] - this.cprms['s_my'];
        if (width < 0) {
          var tmp = this.cprms['s_mx'];
          this.cprms['s_mx'] = this.cprms['mx'];
          this.cprms['mx'] = tmp;
          width = Math.abs(width);
        }
        if (height < 0) {
          var tmp = this.cprms['s_my'];
          this.cprms['s_my'] = this.cprms['my'];
          this.cprms['my'] = tmp;
          height = Math.abs(height);
        }
        this.createresize(
          ctx,
          this.cprms['s_mx'],
          this.cprms['s_my'],
          width,
          height
        );
        this.add_taxos(this.cprms);
        // console.log('tbtbtbtbt',$('#table_act_pp'))
        // $('#table_act_pp')[0].style.display = 'block';
        // $('#table_act_pp ul')[0].style.top = e.clientY + 'px';
        // $('#table_act_pp ul')[0].style.left = e.clientX + 'px';
      }
      // if(e.which === 3){

      // }
    });
    $(canv).on('mousemove', (e: any) => {
      var x: any = parseInt(
        (e.originalEvent.layerX - this.cprms['offsetaxolsteft']).toString()
      );
      var y = parseInt(
        (e.originalEvent.layerY - this.cprms['offsettop']).toString()
      );
      if (this.cprms['mousedown']) {
        this.cprms['mousemove'] = true;
        if (this.cprms['isResize']) {
          switch (this.cprms['canvas_cur']) {
            case 'nw-resize':
              this.cprms['s_mx'] = x;
              this.cprms['s_my'] = y;
              break;
            case 'n-resize':
              this.cprms['s_my'] = y;
              break;
            case 'ne-resize':
              this.cprms['s_my'] = y;
              this.cprms['mx'] = x;
              break;
            case 'e-resize':
              this.cprms['mx'] = x;
              break;
            case 'se-resize':
              this.cprms['mx'] = x;
              this.cprms['my'] = y;
              break;
            case 's-resize':
              this.cprms['my'] = y;
              break;
            case 'sw-resize':
              this.cprms['s_mx'] = x;
              this.cprms['my'] = y;
              break;
            case 'w-resize':
              this.cprms['s_mx'] = x;
              break;
          }
        } else {
          this.cprms['mx'] = x;
          this.cprms['my'] = y;
        }
        var width = this.cprms['mx'] - this.cprms['s_mx'];
        var height = this.cprms['my'] - this.cprms['s_my'];
        ctx.clearRect(0, 0, this.cprms['w'], this.cprms['h']); //clear canvas
        this.draw_rectangle(
          ctx,
          this.cprms['s_mx'],
          this.cprms['s_my'],
          width,
          height,
          this.cprms['st_clr'],
          this.cprms['st_w']
        );
      }
      if (this.cprms['resizedrawn'] && !this.cprms['isResize']) {
        var resizeopt = Object.keys(this.cprms['resize_options']);
        for (var i = 0; i < resizeopt.length; i++) {
          var ech = resizeopt[i];
          var dict = this.cprms['resize_options'][ech] || {};
          if (Object.keys(dict).length) {
            if (
              x >= dict['x'] &&
              x <= dict['x'] + dict['w'] &&
              y >= dict['y'] &&
              y <= dict['y'] + dict['h']
            ) {
              this.cprms['canvasdom'].style.cursor = ech;
              this.cprms['canvas_cur'] = ech;
              break;
            } else {
              this.cprms['canvasdom'].style.cursor = 'crosshair';
              this.cprms['canvas_cur'] = 'crosshair';
            }
          } else {
            this.cprms['canvasdom'].style.cursor = 'crosshair';
            this.cprms['canvas_cur'] = 'crosshair';
          }
        }
      }
    });
    return this;
  };

  addpopup = function (cprms: any) {
    var containerdm = cprms['appendcon'];
    if (!containerdm) return;
    var doc = cprms['document'];
    if (!doc) return;
    var divn = 'taxo_cvr';
    var tt = $(containerdm).find('.' + divn);
    if (tt.length) tt.remove();
    var taxodiv = doc.createElement('div');
    var jtaxo = $(taxodiv);
    jtaxo.addClass(divn);
    jtaxo.css({
      position: 'absolute',
      'z-index': 1000,
      cursor: 'auto',
      width: '215px !important',
      display: 'none',
      'font-family': 'Arial,sans-serif',
      'flex-direction': 'column-reverse',
      border: '0px solid #ddd',
    });
    // var template  =	'<div class="save_cvr" style="float:left;width:100%;height:30px">'+
    // 			'<button class="save_t" style="float:left;width:50px;height:100%;margin: 0px; background: #57acbb; border: none; color: #fff;font-size:12px;font-family: inherit;">Save</button>'+
    // 			'<input class="inp_t" style="float:left;border: 1px solid #ddd;width:calc(100% - 80px);height:100%;font-size: 12px;color:#333;font-family: inherit;box-sizing: border-box;" placeholder="Search Text" type="text"></input>'+
    // 			'<button class="remove_t" style="float:left;width:30px;height:100%;margin: 0px; background: #57acbb; border: none; color: #fff;font-size:12px;font-family: inherit;">X</button>'+
    // 		'</div>'+
    // 		'<div class="taxo_opt" style="float:left;width:100%;height:calc(100% - 30px);overflow-y:auto;background: #fff;">'+
    // 			'<ul class="taxo_ul" style="float:left;width:100%;height:100%;padding:0;margin:0;">'+
    // 			'</ul>'+
    // 		'</div>'
    var template =
      ' <!--link rel="stylesheet" type="text/css" href="../src/icon/feather/css/feather.css"-->' +
      '<div class="save_cvr" style="float:left;height:30px;border-bottom: 1px solid white;">' +
      '<button class="save_ann" style="float:left;cursor: pointer;width: 90px;padding: 6px;height:100%;margin: 0px; background: #57acbb; border: none; color: #fff;font-size:12px;font-family: inherit;">Annotation <i class="fa fa-crop"></i></button></div>' +
      '<div class="save_cvr" style="float:left;height:30px">' +
      '<button class="save_t" style="float:left;cursor: pointer;width: 90px;padding: 6px;height:100%;margin: 0px; background: #57acbb; border: none; color: #fff;font-size:12px;font-family: inherit;">Snippet <i class="feather icon-share-2"></i></button></div>' +
      '<div class="save_cvr" style="float:left;height:30px">' +
      '<button class="save_ary" style="float:left;cursor: pointer;width: 45px;padding: 6px;height:100%;margin: 0px; background: lightblue; border: none; color: #000;font-size:12px;font-family: inherit;">Save</button></div>' +
      '<div class="save_cvr" style="float:left;height:30px">' +
      '<button class="remove_t" style="float:left;cursor: pointer;width: 45px;padding: 6px;height:100%;margin: 0px; background: #fff; border: none; color: #000;font-size:12px;font-family: inherit;">Clear</button></div>';
    jtaxo.append(template);
    $(containerdm).append(taxodiv);
    cprms['pdiv'] = taxodiv;
    jtaxo.find('.remove_t').click(function () {
      cprms['ctx'].clearRect(0, 0, cprms['w'], cprms['h']);
      $(taxodiv).hide();
      cprms['resizedrawn'] = false;
    });
    jtaxo.find('.save_t').click(function () {
      if (cprms['savecallback'])
        cprms.savecallback(
          [
            cprms['s_mx'],
            cprms['s_my'],
            cprms['mx'] - cprms['s_mx'],
            cprms['my'] - cprms['s_my'],
          ],
          'save_t'
        );
      // cprms.savecallback([cprms['s_mx'],cprms['s_my'],cprms['mx'],cprms['my']],cprms['seltaxo']);
      cprms['ctx'].clearRect(0, 0, cprms['w'], cprms['h']);
      cprms['resizedrawn'] = false;
      $(taxodiv).hide();
    });
    jtaxo.find('.save_ann').click(function () {
      if (cprms['savecallback'])
        cprms.savecallback(
          [
            cprms['s_mx'],
            cprms['s_my'],
            cprms['mx'] - cprms['s_mx'],
            cprms['my'] - cprms['s_my'],
          ],
          'save_ann'
        );
      // cprms.savecallback([cprms['s_mx'],cprms['s_my'],cprms['mx'],cprms['my']],cprms['seltaxo']);
      cprms['ctx'].clearRect(0, 0, cprms['w'], cprms['h']);
      cprms['resizedrawn'] = false;
      $(taxodiv).hide();
    });
    //Save_arry Added
    jtaxo.find('.save_ary').click(function () {
      console.log('cancal_lcancal_l');
      if (cprms['savecallback'])
        cprms.savecallback(
          [
            cprms['s_mx'],
            cprms['s_my'],
            cprms['mx'] - cprms['s_mx'],
            cprms['my'] - cprms['s_my'],
          ],
          'save_ary'
        );
      // cprms.savecallback([cprms['s_mx'],cprms['s_my'],cprms['mx'],cprms['my']],cprms['seltaxo']);
      cprms['ctx'].clearRect(0, 0, cprms['w'], cprms['h']);
      cprms['resizedrawn'] = false;
      $(taxodiv).hide();
    });
    //Save_arry end
    jtaxo.find('.inp_t').keyup(function (e: any) {
      var domv = (e.val() || '').toLocaleLowerCase();
      jtaxo
        .find('li')
        .get()
        .map(function (dom: any) {
          var edom = $(dom);
          var txt = (edom.text() || '').toLocaleLowerCase();
          if (txt.indexOf(domv) != -1) edom.show();
          else edom.hide();
        });
    });
  };
  draw_rectangle = function (
    ctx: {
      beginPath: () => void;
      lineWidth: any;
      strokeStyle: any;
      rect: (arg0: any, arg1: any, arg2: any, arg3: any) => void;
      stroke: () => void;
    },
    x: any,
    y: any,
    w: number,
    h: number,
    clr: any,
    st_w: any
  ) {
    ctx.beginPath();
    ctx.lineWidth = st_w;
    ctx.strokeStyle = clr;
    ctx.rect(x, y, w, h);
    ctx.stroke();
  };
  createresize = (ctx: any, x: number, y: number, w: number, h: number) => {
    var $_this = this;
    var resizeopt = $_this.cprms['resize_options'];
    var array = Object.keys(resizeopt || {});
    var rsz = $_this.cprms['resize_rect'];
    var hrsz = rsz / 2;
    array.forEach(function (ech) {
      var rect = [0, 0, 0, 0];
      var l = x - hrsz;
      var t = y - hrsz;
      if (ech == 'n-resize') l = x + w / 2 - hrsz;
      else if (ech == 'ne-resize') l = x + w - hrsz;
      else if (ech == 'e-resize') {
        l = x + w - hrsz;
        t = y + h / 2 - hrsz;
      } else if (ech == 'w-resize') t = y + h / 2 - hrsz;
      else if (ech == 'sw-resize') t = y + h - hrsz;
      else if (ech == 's-resize') {
        l = x + w / 2 - hrsz;
        t = y + h - hrsz;
      } else if (ech == 'se-resize') {
        l = x + w - hrsz;
        t = y + h - hrsz;
      }
      $_this.cprms['resize_options'][ech] = { x: l, y: t, w: rsz, h: rsz };
      $_this.draw_rectangle(
        ctx,
        l,
        t,
        rsz,
        rsz,
        $_this.cprms['resize_str_clr'],
        $_this.cprms['resize_str_w']
      );
    });
    $_this.cprms['resizedrawn'] = true;
  };
  add_taxos = (cprms: { [x: string]: any }) => {
    console.log('cprms ::++', cprms);
    var x = cprms['s_mx'] - cprms['resize_rect'];
    var y = cprms['s_my'] - cprms['resize_rect'];
    var x1 = cprms['mx'];
    var y1 = cprms['my'] + cprms['resize_rect'];
    var containerdm = cprms['appendcon'];
    console.log('containerdm', containerdm);
    console.log('containerdm', x, y, '\n', x1, '\n', y1);
    if (!containerdm) return;
    cprms['seltaxo'] = null;
    var pdiv = $(cprms['pdiv']);
    console.log('pdiv', pdiv);
    // cprms.savecallback([cprms['s_mx'],cprms['s_my'],(cprms['mx']-cprms['s_mx']),(cprms['my']-cprms['s_my'])]);
    var inpdom = pdiv.find('.save_cvr input');
    inpdom.val('');
    var taxos = cprms['taxolst'] || [];
    var lit = '';
    for (var i = 0; i < taxos.length; i++)
      lit =
        lit +
        '<li class="" titaxolste="' +
        taxos[i]['t'] +
        '" idx="' +
        i +
        '" style="width:100%;cursor:pointer;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;background:#fff; font-size: 14px; color: black; border: 1px solid gray; padding:3px 15px;border-top:none;list-style: none;font-family: inherit;box-sizing: border-box;text-align:left;i">' +
        taxos[i]['t'] +
        '</li>';
    pdiv.show();
    var height = pdiv.height();
    var udiv = $(pdiv.find('ul'));
    udiv.html('');
    udiv.append(lit);
    udiv.find('li').click(() => {
      var index = $(this).attr('idx');
      var t = taxos[index];
      cprms['seltaxo'] = t;
      inpdom.val(t['t']);
    });
    if (0) {
      var d = 'block';
      if (x + 200 > cprms['w']) x = x1 - cprms['tw'];
      if (y1 + height > cprms['h']) {
        y1 = y - height;
        //d = 'flex'
      }
      udiv.css({ display: d });
      pdiv.css({
        width: cprms['tw'],
        left: x,
        top: y1,
        display: d,
        height: cprms['th'],
      });
    }
    var d = 'block';
    if (x + 200 < x1) x = x1 - 200;
    /*if(y1+height>cprms['h']){
              y1 = y -height;
              //d = 'flex'
          }*/
    udiv.css({ display: d });
    pdiv.css({
      width: cprms['tw'],
      left: x,
      top: y1,
      display: d,
      height: cprms['th'],
    });
  };
  clear_canvas = () => {
    var $_this = this;
    var ctx = $_this.cprms['ctx'];
    var w = $_this.cprms['w'];
    var h = $_this.cprms['h'];
    ctx.clearRect(0, 0, w, h);
    $_this.cprms['s_mx'] = 0;
    $_this.cprms['s_my'] = 0;
    $_this.cprms['mx'] = 0;
    $_this.cprms['my'] = 0;
    $_this.cprms['mousedown'] = false;
    $_this.cprms['mousemove'] = false;
    $_this.cprms['resizedrawn'] = false;
    $_this.cprms['isResize'] = false;
    $_this.cprms['resize_options'] = {
      'nw-resize': {},
      'n-resize': {},
      'ne-resize': {},
      'w-resize': {},
      'e-resize': {},
      'sw-resize': {},
      's-resize': {},
      'se-resize': {},
    };
    $_this.cprms['canvas_cur'] = 'crosshair';
    $(this.cprms['pdiv']).css({ display: 'none' });
  };
  clear_highlightsbbox_image(id: string) {
    console.log('clear_highlightsbbox_image', id);
    var contentwindow = $(id)[0].parentNode;
    Array.prototype.forEach.call(
      contentwindow.querySelectorAll('[role="tas_highlights"]'),
      function (node) {
        node.parentElement.removeChild(node);
      }
    );
  }
  clear_highlightsbbox_pdf(id: string) {
    console.log('clear_highlightsbbox_pdf', id);
    var contentwindow = $(`${id} iframe`)[0].contentWindow;
    Array.prototype.forEach.call(
      contentwindow.document.querySelectorAll('[role="tas_highlights"]'),
      function (node) {
        node.parentElement.removeChild(node);
      }
    );
  }
  create_dom(
    tag_name: any,
    attributes: { [x: string]: any },
    parent_div: { appendChild: (arg0: any) => void },
    innerdata: any
  ) {
    var dom = document.createElement(tag_name);
    for (const key in attributes) {
      dom.setAttribute(key, attributes[key]);
    }
    dom.innerHTML = innerdata;
    if (parent_div) parent_div.appendChild(dom);
    return dom;
  }

  highlightsbbox_withclass_image(
    id: string = '',
    bboxs: any[],
    info: any[],
    class_name: string,
    flag: any,
    bg: string,
    border: any,
    pno: any,
    txt: any
  ) {
    console.log('trig in highlightsbbox_withclass_image');
    console.log('bboxs', bboxs);
    console.log('info', info);
    if (!info || info.length == 0) info = []; //[0,0,0,0]
    if (!Array.isArray(bboxs)) {
      try {
        bboxs = JSON.parse(bboxs);
      } catch (e) {
        bboxs = [];
      }
    }
    var content_window = $(id)[0].parentNode;
    console.log('id 0', $(id));
    if (flag) this.clear_highlightsbbox_image(id);
    var d = 0;
    bboxs.sort(function (a, b): any {
      return a[2] < b[2];
    });
    console.log('bboxsbboxs', bboxs);
    var done_bbox: any = {};
    bboxs.forEach((bbox) => {
      var p_dom = $(id)[0];
      var offset_l = p_dom.offsetLeft;
      var offset_t = p_dom.offsetTop;
      var dom_w = p_dom.clientWidth;
      var dom_h = p_dom.clientHeight;
      console.log('p_dom', p_dom);
      console.log('dom_w', dom_w);
      console.log('dom_h', dom_h);
      console.log('offset_l', offset_l);
      console.log('offset_t', offset_t);
      var bbox = bbox.map(function (t: any) {
        return Number(t);
      });
      if (bbox.length > 4) {
        bbox[4] = Number(bbox[4] || 0) || dom_w;
        bbox[5] = Number(bbox[5] || 0) || dom_h;
      } else {
        bbox[4] = Number(info[2] || 0) || dom_w;
        bbox[5] = Number(info[3] || 0) || dom_h;
        //bbox[4]    = (50/100)*dom_w
        //bbox[5]    = (48/100)*dom_h
      }
      console.log('F1 bbox', bbox);
      var bb_str = bbox.join('_');
      if (bb_str in done_bbox) return;
      done_bbox[bb_str] = 1;
      bbox[0] = bbox[0] * (dom_w / bbox[4]);
      bbox[1] = bbox[1] * (dom_h / bbox[5]);
      bbox[2] = bbox[2] * (dom_w / bbox[4]);
      bbox[3] = bbox[3] * (dom_h / bbox[5]);
      bbox[0] = bbox[0] + offset_l;
      bbox[1] = bbox[1] + offset_t;
      console.log('FF bbox', bbox);
      console.log('dom_h1', dom_h);

      var left = bbox[0]; //(bbox[0]*1.25) //+(bbox[0]/2)
      var top1 = bbox[1]; //((bbox[1]-3)*1.25) //+(bbox[1]/2)
      var width = bbox[2]; //(bbox[2]*1.25) //+(bbox[2]/2)
      var height = bbox[3]; //((bbox[3]+3)*1.25) //+(bbox[3]/2)
      var border_value = '2px solid rgb(244, 67, 54)';
      var bg_color = 'rgba(243, 230, 88, 0.3)';
      if (bg != '') {
        border_value = border;
        var bg_color = bg;
      } else {
        if (class_name == 'parent_iframe_tag') {
          bg_color = 'rgba(243, 230, 88, 0.3)';
          border_value = '2px solid rgb(244, 67, 54)';
        } else if (class_name == 'res_iframe_tag') {
          border_value = '1px solid #5cb85c';
          bg_color = 'rgba(92, 184, 92, 0.25)';
        } else if (class_name == 'green_iframe_tag') {
          border_value = '2px solid #44aa45';
          bg_color = 'rgba(168, 238, 171, 0.26)';
        } else if (class_name == 'red_iframe_tag') {
          border_value = '1px solid #ff847b';
          bg_color = 'rgba(255, 159, 152, 0.33)';
        } else {
          border_value = '1px solid #cdb0ff';
          bg_color = 'rgba(205, 176, 255, 0.25)';
        }
      }
      var style =
        'width:' +
        width +
        'px;height:' +
        height +
        'px;top:' +
        top1 +
        'px;left:' +
        left +
        'px;z-index:1000;background-color: ' +
        bg_color +
        ';border:' +
        border_value +
        ';position: absolute;box-sizing: content-box;';
      var nw_som = this.create_dom(
        'div',
        {
          style: style,
          class: 'highlight_class',
          role: 'tas_highlights',
          title: txt,
        },
        p_dom.parentNode,
        ''
      );
      nw_som.onclick = function () {
        this.remove_highlight(id);
        nw_som.setAttribute('class', 'highlight_class');
      };
      if (d == 0 && nw_som) {
        console.log('content_window', content_window);
        console.log('$(content_window)', $(content_window));
        d = 1;
        var v_dom = content_window; //.document.querySelector('#viewerContainer');
        if (!v_dom) {
          return;
        }
        var w_width = v_dom.clientWidth;
        var sleft = 0;
        if (left + width > w_width) {
          sleft = left - w_width + width + 30;
        }
        top1 = top1 + (p_dom.offsetTop || 0);
        sleft = sleft + (p_dom.offsetLeft || 0);
        $(content_window).animate(
          {
            scrollTop: top1 + height - 150,
            scrollLeft: sleft,
          },
          0
        );
      }
    });
  }
  highlightsbbox_withclass_pdf(
    id: string = '',
    bboxs: any[],
    info: any[],
    class_name: string,
    flag: any,
    bg: string,
    border: any,
    pno: string,
    txt: any
  ) {
    this.pdfViewerOnDemand.pdfSrc = this.config().filePaths['PDF'].path
    console.log('trig in highlightsbbox_withclass_image', id);
    console.log('bboxs', bboxs);
    console.log('info', info);
    if (!info || info.length == 0) info = []; //[0,0,0,0]
    if (!Array.isArray(bboxs)) {
      try {
        bboxs = JSON.parse(bboxs);
      } catch (e) {
        bboxs = [];
      }
    }
    var content_window = $(`${id} iframe`)[0].contentWindow;
    // console.log(
    //   'id 0',
    //   id, pno,
    //   $(`${id} iframe`)[0],
    //   $(`${id} iframe`)[0].contentWindow.document.querySelectorAll('#viewerContainer'),
    //   $(`${id} iframe`)[0].contentWindow.document.querySelectorAll('#viewerContainer .canvasWrapper'),
    //   $(`${id} iframe`)[0].contentWindow.document.querySelectorAll('#viewerContainer>#viewer>.page'),
    //   $(`${id} iframe`)[0].contentWindow.document.querySelectorAll(`#viewerContainer>#viewer>.page[data-page-number="${pno}"]`),
    //   $(`${id} iframe`)[0].contentWindow.document.querySelectorAll(`#viewerContainer>#viewer>.page[data-page-number="${pno}"]>.canvasWrapper`),
    //   $(`#referenceConfig_pdf iframe`)[0].contentWindow.document.querySelectorAll('#viewerContainer>#viewer>.page'),
    //   $(`#referenceConfig_pdf iframe`)[0].contentWindow.document.querySelectorAll('#viewerContainer>#viewer>.page>.canvasWrapper'),
    // );
    if (flag) this.clear_highlightsbbox_pdf(id);
    var d = 0;
    bboxs.sort(function (a, b): any {
      return a[2] < b[2];
    });
    console.log('bboxsbboxs', bboxs);
    var done_bbox: any = {};
    var int = interval(100).subscribe(() => {
      var p_dom = content_window.document.querySelectorAll('#viewerContainer .canvasWrapper')[0];

      console.log('p_dom', p_dom);
      if (!p_dom) return

      bboxs.forEach((bbox) => {

        var offset_l = p_dom.offsetLeft;
        var offset_t = p_dom.offsetTop;
        var dom_w = p_dom.clientWidth;
        var dom_h = p_dom.clientHeight;
        console.log('p_dom', p_dom);
        console.log('dom_w', dom_w);
        console.log('dom_h', dom_h);
        console.log('offset_l', offset_l);
        console.log('offset_t', offset_t);
        var bbox = bbox.map(function (t: any) {
          return Number(t);
        });
        if (bbox.length > 4) {
          bbox[4] = Number(bbox[4] || 0) || dom_w;
          bbox[5] = Number(bbox[5] || 0) || dom_h;
        } else {
          bbox[4] = Number(info[2] || 0) || dom_w;
          bbox[5] = Number(info[3] || 0) || dom_h;
          //bbox[4]    = (50/100)*dom_w
          //bbox[5]    = (48/100)*dom_h
        }
        console.log('F1 bbox', bbox);
        var bb_str = bbox.join('_');
        if (bb_str in done_bbox) return;
        done_bbox[bb_str] = 1;
        bbox[0] = bbox[0] * (dom_w / bbox[4]);
        bbox[1] = bbox[1] * (dom_h / bbox[5]);
        bbox[2] = bbox[2] * (dom_w / bbox[4]);
        bbox[3] = bbox[3] * (dom_h / bbox[5]);
        bbox[0] = bbox[0] + offset_l;
        bbox[1] = bbox[1] + offset_t;
        console.log('FF bbox', bbox);
        console.log('dom_h1', dom_h);

        var left = bbox[0]; //(bbox[0]*1.25) //+(bbox[0]/2)
        var top1 = bbox[1]; //((bbox[1]-3)*1.25) //+(bbox[1]/2)
        var width = bbox[2]; //(bbox[2]*1.25) //+(bbox[2]/2)
        var height = bbox[3]; //((bbox[3]+3)*1.25) //+(bbox[3]/2)
        var border_value = '2px solid rgb(244, 67, 54)';
        var bg_color = 'rgba(243, 230, 88, 0.3)';
        if (bg != '') {
          border_value = border;
          var bg_color = bg;
        } else {
          if (class_name == 'parent_iframe_tag') {
            bg_color = 'rgba(243, 230, 88, 0.3)';
            border_value = '2px solid rgb(244, 67, 54)';
          } else if (class_name == 'res_iframe_tag') {
            border_value = '1px solid #5cb85c';
            bg_color = 'rgba(92, 184, 92, 0.25)';
          } else if (class_name == 'green_iframe_tag') {
            border_value = '2px solid #44aa45';
            bg_color = 'rgba(168, 238, 171, 0.26)';
          } else if (class_name == 'red_iframe_tag') {
            border_value = '1px solid #ff847b';
            bg_color = 'rgba(255, 159, 152, 0.33)';
          } else {
            border_value = '1px solid #cdb0ff';
            bg_color = 'rgba(205, 176, 255, 0.25)';
          }
        }
        var style =
          'width:' +
          width +
          'px;height:' +
          height +
          'px;top:' +
          top1 +
          'px;left:' +
          left +
          'px;z-index:1000;background-color: ' +
          bg_color +
          ';border:' +
          border_value +
          ';position: absolute;box-sizing: content-box;';
        var nw_som = this.create_dom(
          'div',
          {
            style: style,
            class: 'highlight_class',
            role: 'tas_highlights',
            title: txt,
          },
          p_dom.parentNode,
          ''
        );
        nw_som.onclick = function () {
          this.remove_highlight(id);
          nw_som.setAttribute('class', 'highlight_class');
        };
        if (d == 0 && nw_som) {
          console.log('content_window', content_window);
          console.log('$(content_window)', $(content_window));
          d = 1;
          //$(`#Refrence_component2_pdf iframe`)[0].contentWindow.
          var v_dom =
            content_window.document.querySelectorAll('#viewerContainer')[0]; //.document.querySelector('#viewerContainer');
          console.log('v_dom', v_dom);
          if (!v_dom) {
            return;
          }
          var w_width = v_dom.clientWidth;
          var sleft = 0;
          if (left + width > w_width) {
            sleft = left - w_width + width + 30;
          }

          // scroll to page to be referenced
          top1 = top1 + (p_dom.offsetTop || 0);
          // top1 = top1 + (p_dom.offsetTop || 0) + ((dom_h + 9) * (parseInt(pno)-1));
          sleft = sleft + (p_dom.offsetLeft || 0);
          $(
            content_window.document.querySelectorAll('#viewerContainer')[0]
          ).animate(
            {
              scrollTop: top1 + height - 150,
              scrollLeft: sleft,
            },
            0
          );
        }
      });
      int.unsubscribe()
    })
  }
  clear_all_highlight(id: string) {
    console.log('clear_all_highlight', id);
    if (this.cprms) this.clear_canvas();
    if (this.config().active == 'IMAGE')
      this.clear_highlightsbbox_image('#img_cnc_' + id);
    else if (this.config().active == 'PDF')
      this.clear_highlightsbbox_pdf('#' + id + '_pdf');
  }
  // clear() {
  //   this.factory.tasAlert('clear', 'error', 2000);
  // }
  save() {
    throw new Error('Method not implemented.');
  }
  leftMenu() {
    throw new Error('Method not implemented.');
  }

  /****************************HTML**************************************/
  key_val_sup_hlight: string = '';
  showRefContextMenu: boolean = false;
  isBooleanVariable: boolean = false;
  eleft: Number = 0;
  etop: any;
  id!: string;
  /* @HostListener('window:blur', ['$event'])
  onWindowBlur(event: any): void {
    event.preventDefault();
    console.log(
      'iframe clicked',
      event,
      '\n',
      document.querySelector(this.config().id),
      this.config().id
    );
    console.log(
      'iframe clicked',
      event.target[0].document.querySelectorAll('html')
    );
    // var noContext = event.target[0].document.querySelectorAll('html')[0] as HTMLElement
    var noContext = (
      document.querySelector('#' + this.config().id) as HTMLIFrameElement
    ).contentWindow?.document.querySelectorAll('html')[0] as HTMLElement;
    if (noContext.getAttribute('contextMenuListener') !== 'true') {
      noContext.addEventListener('contextmenu', (e: any) => {
        this.handleRightClickInIframe(e);
        noContext.setAttribute('contextMenuListener', 'true');
        e.preventDefault();
        this.eleft = e.screenX;
        this.etop = e.screenY;
        this.contextMenuCoords = {
          left: e.clientX + 'px',
          top: e.clientY + 'px',
        };
        this.showRefContextMenu = true;
        // this.showRefContextMenu=!this.showRefContextMenu
        console.log(
          'e.clientY+100',
          this.etop,
          '\n',
          e.button,
          this.contextMenuCoords,
          this.showRefContextMenu
        );
        // console.log('this.showRefContextMenu', this.showRefContextMenu, "\n", this.eleft, this.etop, "\n", e);
        this.changeDetectorRef.detectChanges();
      });
    }
  }
  handleRightClickInIframe(event: MouseEvent): void {
    // Your logic for handling right-click inside the iframe
    console.log('Right-click detected inside iframe', event);
  } */

  // toggleContextMenu(event: any) {
  //   event.preventDefault()
  //   console.log('%cHello referenceComponent_main_v1/src/app/reference/reference.component.ts:352 ', 'background: green; color: white; display: block;');
  //   this.showRefContextMenu=!this.showRefContextMenu
  // }

  selcted_Document_Type(id: any): void {
    var iframe = document.getElementById(id) as HTMLIFrameElement;
    console.log('config.id', iframe, '\n');

    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    console.log("iframeDoc", iframeDoc, this.select_doctype_);

    if (iframeDoc) {
      // Listen to the click event inside the iframe document
      console.log("inside iframeDoc", iframeDoc);
      this.renderer.listen(iframeDoc, 'click', (event: MouseEvent) => {
        // Check if CTRL key is pressed
        console.log("click event", event, (event.ctrlKey && this.select_doctype_), (event.ctrlKey || this.select_doctype_));
        if (event.ctrlKey && this.select_doctype_) {
          // Find the closest div with the relevant attributes
          const clickedElement = event.target as HTMLElement;
          console.log("___selected item", clickedElement);

          // Check if the clicked element is a div with a 'doc_id' attribute
          const closestDiv = clickedElement.closest('div[doc_id]');
          if (closestDiv) {
            // Extract information from the closest div
            const doc_id = closestDiv.getAttribute('doc_id');
            const tasid = closestDiv.getAttribute('tasid');
            const pageno = closestDiv.getAttribute('pageno');
            const bbox = closestDiv.getAttribute('bbox');
            const page_coord = closestDiv.getAttribute('page_coord');
            const seqid = 1
            const idx = ''
            var info: any = []
            info.push(Number(pageno))
            info.push(Number(seqid))
            info.push(tasid)
            info.push(idx)
            console.log("omfo", info)
            this.doctype_info.emit(info)
            this.config().crop_callback(info)
            return
            var info: any = {}
            // info['doc_id'] = doc_id
            info['pageno'] = pageno
            info['seqid'] = 123
            info['level'] = tasid
            // info['bbox'] = bbox
            // info['page_coord'] = page_coord
            info['idx'] = ''
            console.log("omfo", info)
            this.doctype_info.emit(info)
            this.config().crop_callback(info)

            // Now you can handle this information as needed
          }
        }
      });
    }

    return
  }

  selcted_Document_Type1(id: any): void {
    var iframe = document.getElementById(id) as HTMLIFrameElement;
    console.log('config.id', iframe, '\n');

    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    console.log("iframeDoc", iframeDoc, this.select_doctype_1);

    if (iframeDoc) {
      // Listen to the click event inside the iframe document
      console.log("inside iframeDoc", iframeDoc);
      this.renderer.listen(iframeDoc, 'click', (event: MouseEvent) => {
        // Check if CTRL key is pressed
        console.log("click event", event, (event.ctrlKey && this.select_doctype_1), (event.ctrlKey || this.select_doctype_1));

        if (event.ctrlKey && this.select_doctype_1) {
          // Find the closest div with the relevant attributes
          const clickedElement = event.target as HTMLElement;
          console.log("___selected item", clickedElement);

          // Check if the clicked element is a div with a 'doc_id' attribute
          const closestDiv = clickedElement.closest('div[doc_id]');
          if (closestDiv) {
            // Extract information from the closest div
            const doc_id = closestDiv.getAttribute('doc_id');
            const tasid = closestDiv.getAttribute('tasid');
            const pageno = closestDiv.getAttribute('pageno');
            const bbox = closestDiv.getAttribute('bbox');
            const page_coord = closestDiv.getAttribute('page_coord');
            const seqid = 1
            const idx = ''
            var info: any = []
            info.push(Number(pageno))
            info.push(Number(seqid))
            info.push(tasid)
            info.push(idx)
            console.log("omfo", info)
            this.doctype_info.emit(info)
            this.config().crop_callback(info)
            return
            var info: any = {}
            // info['doc_id'] = doc_id
            info['pageno'] = pageno
            info['seqid'] = 123
            info['level'] = tasid
            // info['bbox'] = bbox
            // info['page_coord'] = page_coord
            info['idx'] = ''
            console.log("omfo", info)
            this.doctype_info.emit(info)
            this.config().crop_callback(info)

            // Now you can handle this information as needed
          }
        }
      });
    }

    return
  }



  HTML_helight(config: any, ref_dict: any) {
    console.log("config", config, "\n", ref_dict)
    var id = config['id']
    var xml_list: any = [];
    var char_list = [];
    var txt = ref_dict.txt || ""
    if ('xml_list' in ref_dict) {
      xml_list = ref_dict['xml_list'] || [];
    }
    // if ('c' in ref_dict) {
    //   //char_list.push(ref_dict['c']);
    //   char_list = ref_dict['c'].split("$$")
    // }
    //   rect helight html
    xml_list = config['ref'][0].r;
    console.log("xml_list", xml_list)
    if (xml_list.length == 0 || xml_list.length == 0) {
      return
    } else {
      setTimeout(() => {
        const element: HTMLIFrameElement = document.getElementById(`${id}`) as HTMLIFrameElement;
        const iframe = element.contentWindow;
        setTimeout(() => {
          xml_list.forEach((xml: String) => {
            if (iframe !== null) {
              var xml_h = iframe.document.querySelectorAll('body')[0] as HTMLElement;
              //var sty = xml_h.querySelectorAll('[xmlids="' + xml + '"]')[0] as HTMLElement;//rects
              var sty = xml_h.querySelectorAll('[rects="' + xml + '"]')[0] as HTMLElement;
              console.log("sty", sty)
              if (sty.style == undefined) {
                return
              } else {
                sty.style.border = '2px solid rgb(150, 200, 162)';
                sty.style.background = 'rgba(243, 230, 88, 0.3)';
                sty.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          });
        }, 300);
      }, 100);
    }
  }

  helight_(config: any) {
    this.clearAll_hightlights(this.config().id);
    console.log("Config", config, config.hasOwnProperty('ref'));
    if (config.hasOwnProperty('ref')) {

      config.ref.forEach((ech_ref_dict: any, idx: any) => {
        var xml_list = [];
        if (!('xml_list' in ech_ref_dict)) {
          if (ech_ref_dict.hasOwnProperty('x')) {
            if (ech_ref_dict['x'] != "")
              xml_list = [ech_ref_dict['x']]
            if (ech_ref_dict['x'].indexOf('#') > -1)
              xml_list = ech_ref_dict['x'].split('#');
            else if (ech_ref_dict['x'].indexOf('@') > -1)
              xml_list = ech_ref_dict['x'].split('@');
          }
          var xml_list_m: any = [];
          if (ech_ref_dict.hasOwnProperty('xml_list')) {
            ech_ref_dict['xml_list'].forEach(function (ech_ids: any) {
              var ech_ids_lst = [];
              if (ech_ids != "")
                ech_ids_lst = [ech_ids]
              if (ech_ids.indexOf('#') > -1)
                ech_ids_lst = ech_ids.split('#');
              else if (ech_ref_dict['x'].indexOf('@') > -1)
                xml_list = ech_ref_dict['x'].split('@');
              xml_list_m = xml_list_m.concat(ech_ids_lst);
            })
          }
          var conc_xml_lst = xml_list.concat(xml_list_m);
        } else {
          conc_xml_lst = ech_ref_dict['xml_list'];
        }
        if (conc_xml_lst.length) {
          ech_ref_dict['xml_list'] = conc_xml_lst;
          console.log('NRS table', ech_ref_dict['xml_list']);
          this.HTML_helight(config, ech_ref_dict)
        }
      })
    }
  }


  // helight_ = (config: any) => {
  //   console.log('Config', config);
  //   this.clearAll_hightlights(this.config().id);
  //   var id = config['id'];
  //   if (config.ref.length == 0 || config.ref.xmlids.length == 0) {
  //     return;
  //   }
  //   else {
  //     setTimeout(() => {
  //       const element: HTMLIFrameElement = document.getElementById(`${id}`) as HTMLIFrameElement;
  //       const iframe = element.contentWindow;
  //       console.log('iframe', iframe);
  //       setTimeout(() => {
  //         config.ref.xmlids.forEach((xml: String) => {
  //           if (iframe !== null) {
  //             var xml_h = iframe.document.querySelectorAll('body')[0] as HTMLElement;
  //             var sty = xml_h.querySelectorAll('[xmlids="' + xml + '"]')[0] as HTMLElement;
  //             sty.style.border = '2px solid rgb(150, 200, 162)';
  //             sty.style.background = 'rgba(243, 230, 88, 0.3)';
  //           }
  //         });
  //       }, 300);
  //     }, 100);
  //   }
  // };

  ref_tabchange(item: string, active: string) {
    console.log('item', item, active);
    this.config().active = active;
    console.log('item', item, this.config().active);
  }
  page_no_change_func(config: any, pos: string, ind: number) {
    console.log('Config', config, '\n', pos, ind);
  }
  page_no_change_func_scroll(config: any, pos: string) {
    console.log('Config', config, '\n', pos);
    var page_list = config.pnoList.map((r: any) => Number(r));
    //var get_idx = config.pnoList.indexOf(config.selectedPno);
    var get_idx = page_list.indexOf(Number(config.selectedPno));
    var rw;
    if (pos == 'prev') {
      rw = config.pnoList[get_idx - 1];
    } else if (pos == 'next') {
      rw = config.pnoList[get_idx + 1];
    }
    config.selectedPno = rw;
    console.log('CONFIG222', config, '\nPOS222', pos);
    this.iframe_page_no_change(config);
  }
  iframe_page_no_change(config: any) {
    console.log(
      'iframe_page_no_change12== ',
      config,
      '\n',
      config.selectedPno
    );
    config.html = this.api.getDoc('html', config.ref.mid, config.ref.d, config.selectedPno);
    config.pdf = this.api.getDoc('pdf', config.ref.mid, config.ref.d, config.selectedPno);
  }
  clearAll_hightlights(id: string) {
    // this.clear_all_highlight(this.config().id)
    console.log('clearAll_hightlights', id);
    console.log('this.config().active', this.config().active);
    if (this.cprms) this.clear_canvas();
    if (this.config().active == 'IMAGE')
      this.clear_highlightsbbox_image('#img_cnc_' + this.config().id);
    else if (this.config().active == 'PDF')
      this.clear_highlightsbbox_pdf('#' + this.config().id + '_pdf');
    else if (this.config().active == 'HTML' || this.config().active == 'WEB DOC') {
      this.key_val_sup_hlight = '';
      if (this.showRefContextMenu) {
        this.showRefContextMenu = false;
      }
      // if (id == 'Refrence_component') {
      this.reload_html(this.config().id);
      // }
    }
  }
  reload_html(id: string) {
    var iframe = document.getElementById(id) as HTMLIFrameElement;
    console.log('config.id', iframe, '\n');
    iframe.src = iframe.src;
  }
  clicked_button(element: any): void {
    console.log('clicked_button', element, '\n', element.currentTarget.value);
    this.key_val_sup_hlight = element.currentTarget.value;
    if (this.key_val_sup_hlight == '') {
      return;
    } else {
    }
  }
  add_data_annotaion(act: string, pos: string) {
    console.log('Action', act, '\n', 'clicked', pos);
    let action: any = {};
    this.clearAll_hightlights(this.config().id);
    var element_get = document.getElementById(this.config().id) as HTMLIFrameElement;
    console.log('config.id', element_get, '\n');
    const iframe = element_get.contentWindow as any;
    console.log('config.id', iframe);
    const ctrlSelect: DataObject[] = iframe?.json_lst?.ctrlSelect || [];
    const altSelect: DataObject[] = iframe?.json_lst?.altSelect || [];
    const dSelect: DataObject[] = iframe?.json_lst.dSelect || [];
    console.log(
      '>> altSelect ',
      '\n',
      ctrlSelect,
      '\n',
      altSelect,
      '\n',
      dSelect
    );
    var data: DataObject[] = [];
    if (ctrlSelect.length != 0) {
      data = ctrlSelect;
    } else if (altSelect.length != 0) {
      data = altSelect;
    } else if (dSelect.length != 0) {
      console.log('dSelect', dSelect, '\n', 'dSelect[0]', dSelect[0]);
      data = iframe?.json_lst.dSelect[0] || [];
    }
    console.log('DATA_json_list', data);
    const mergedData: { [key: string]: Partial<DataObject> } = {};
    if (act == 'AddSupport') {
      iframe.add_ctrl_selected_txt_ref = function (obj: any) {
        this.add_ctrl_selected_txt_ref_lst = obj;
        console.log('>><<<', obj);
      };
      data.forEach((obj) => {
        const key = obj.target_ctrl_pno;
        if (!mergedData[key]) {
          mergedData[key] = { ...obj };
        } else {
          Object.entries(obj).forEach(([prop, value]) => {
            if (prop !== 'target_ctrl_pno') {
              const propKey = prop as keyof Partial<DataObject>; // Type assertion
              if (prop === 'target_ctrl_text') {
                mergedData[key][propKey] += `_@_${value}`;
              } else {
                if (!mergedData[key][propKey]) {
                  mergedData[key][propKey] = `_@_${value}`;
                } else if (typeof mergedData[key][propKey] === 'string') {
                  mergedData[key][propKey] += `_@_ ${value}`;
                }
              }
            }
          });
        }
      });
    } else if (act == 'AddIndividual') {
      data.forEach((obj) => {
        const key = obj.target_ctrl_pno;
        if (!mergedData[key]) {
          mergedData[key] = { ...obj };
        } else {
          Object.entries(obj).forEach(([prop, value]) => {
            if (prop !== 'target_ctrl_pno') {
              const propKey = prop as keyof Partial<DataObject>; // Type assertion
              if (prop === 'target_ctrl_text') {
                mergedData[key][propKey] += `|${value}`;
              } else {
                if (!mergedData[key][propKey]) {
                  mergedData[key][propKey] = `_@_${value}`;
                } else if (typeof mergedData[key][propKey] === 'string') {
                  mergedData[key][propKey] += `_@_ ${value}`;
                }
              }
            }
          });
        }
      });
    } else {
      data.forEach((obj) => {
        const key = obj.target_ctrl_pno;
        if (!mergedData[key]) {
          mergedData[key] = { ...obj };
        } else {
          Object.entries(obj).forEach(([prop, value]) => {
            if (prop !== 'target_ctrl_pno') {
              const propKey = prop as keyof Partial<DataObject>; // Type assertion
              if (prop === 'target_ctrl_text') {
                mergedData[key][propKey] += `_@_${value}`;
              } else {
                if (!mergedData[key][propKey]) {
                  mergedData[key][propKey] = `_@_${value}`;
                } else if (typeof mergedData[key][propKey] === 'string') {
                  mergedData[key][propKey] += `_@_ ${value}`;
                }
              }
            }
          });
        }
      });
    }
    const mergedArray = Object.values(mergedData);
    action[pos] = mergedArray;
    console.log('mergedArray', mergedArray, 'Action', action);
  }

  originalOrder = (): number => 0;

}

interface DataObject {
  target_ctrl_text: string;
  target_ctrl_xml_id: string;
  target_ctrl_char_id: string;
  target_ctrl_toc_id: string;
  target_ctrl_cell_id: string;
  target_ctrl_pno: string;
}
interface DataObject {
  target_alt_txt: string;
  alt_xml_id: string;
  alt_char_id: string;
  alt_toc_id: string;
  alt_pno: string;
}
