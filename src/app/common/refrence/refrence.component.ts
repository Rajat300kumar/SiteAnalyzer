import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  forwardRef,
  Renderer2,
  OnChanges, SimpleChanges
} from '@angular/core';
import { HostListener } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PipePipe } from '../../service/pipe.pipe';
import { SafePipe } from '../../service/safe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {
  NzDropDownModule,
  NzDropdownMenuComponent,
  NzContextMenuService
} from 'ng-zorro-antd/dropdown';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { DropdownComponent } from '../dropdown/dropdown.component'
import { AntdropdownComponent } from '../antdropdown/antdropdown.component'
import { PostService } from '../../service/post.service'
// import { ContextDirective } from './context.directive';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
// import { Ng2PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';
declare var $: any;
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(
  (key) => antDesignIcons[key]
);
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
@Component({
  selector: 'app-refrence',
  standalone: true,
  imports: [

    MatListModule,
    MatInputModule,
    PipePipe,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    SafePipe,
    MatButtonModule,
    MatGridListModule,
    CommonModule,
    MatMenuModule,
    NzTabsModule,
    NzDropDownModule,
    NzListModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    NzDropdownMenuComponent,
    NzDividerModule,
    NzCardModule,
    NzIconModule,
    MatDialogModule,
    // PdfJsViewerModule,
    PdfViewerComponent

  ],
  templateUrl: './refrence.component.html',
  styleUrl: './refrence.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RefrenceComponent),
      multi: true,
    },
  ],
})
export class RefrenceComponent implements OnChanges {
  @Output() reload = new EventEmitter<any>();
  @Input() config: any;
  active: string = '';
  // @ViewChild('myFrame') myFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('iframeRef', { static: false }) iframeRef!: ElementRef;
  @ViewChild(PdfViewerComponent) pdfn2viewer!: PdfViewerComponent;
  key_val_sup_hlight: string = '';
  public searchText: any = '';
  public searchTerm_ind: string = '';
  isBooleanVariable: boolean = false;
  changeDetectorRef: any;
  eleft: Number = 0;
  etop: any;
  right_drop_action: string = '';
  popup_dis_ind: boolean = false;
  pdfSrc: string | null = null; // Local variable to hold the PDF source
  private isRefreshing: boolean = false; // Prevent duplicate loading
  // Implement the writeValue method
  writeValue(config: any): void {
    if (config !== null && config !== undefined) {
      this.config = config;
      // Perform other necessary operations
    } else {
      // Handle the case when value is null or undefined
      console.error('Cannot write value. Value is null or undefined.');
    }
  }
  ref = 'Refrence Data';
  Format = '/assets/no_page_found.html';
  html = '/assets/no_page_found.html';
  HTML_t = '/assets/no_page_found.html';
  // pdf = '/assets/no_page_found.html';
  pdf = '/cross?projid=${config.projid}&docid=5'
  img = '/assets/no_page_found.html';

  constructor(private dataService: PostService,
    private nzContextMenuService: NzContextMenuService,
    private renderer: Renderer2,
    changeDetectorRef: ChangeDetectorRef
  ) {
    this.changeDetectorRef = changeDetectorRef;
    console.log(">>Refrence compponet<<>>", this.renderer)
  }
  public async ngOnInit(): Promise<void> {
    // this.newItemEvent.emit(this.config)
    console.log('');
  }
  @HostListener('window:blur', ['$event'])
  onWindowBlur(event: any): void {
    event.preventDefault();
    console.log('iframe clicked', event, '\n');
    console.log(
      'iframe clicked',
      event.target[0].document.querySelectorAll('html')[0] as HTMLElement
    );
    var noContext = event.target[0].document.querySelectorAll(
      'html'
    )[0] as HTMLElement;
    console.log("iframe noContext", noContext)
    noContext.addEventListener('contextmenu', (e: any) => {
      this.handleRightClickInIframe(e);
      e.preventDefault();
      this.eleft = e.screenX;
      this.etop = e.clientY;
      // this.isBooleanVariable = true;
      this.isBooleanVariable = !this.isBooleanVariable;
      this.changeDetectorRef.detectChanges();
      console.log('e.clientY+100', this.etop, '\n', e.button);
      // console.log('this.isBooleanVariable', this.isBooleanVariable, "\n", this.eleft, this.etop, "\n", e);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes:', changes);
  }


  ngAfterViewInit() {
    if (this.config != undefined) {
      /*  console.log('this.pdfViewerOnDemand', this.pdfViewerOnDemand);
       this.pdfViewerOnDemand.pdfSrc = this.config().pdf;
       this.pdfViewerOnDemand.refresh(); */
      console.log('this.pdfViewerOnDemand', this.config)
    }
  }


  refresh_review(): void {
    console.log('Component refreshed with config:', this.config);
    // Add logic to reload data or reinitialize state
    this.reload.emit(this.config)
  }
  popup_disply_ind(): void {
    console.log("popup click")
    this.popup_dis_ind = !this.popup_dis_ind
    console.log("true", this.popup_dis_ind)
  }

  onKeyup(event: KeyboardEvent): void {
    // Access the current value using `this.searchText`
    console.log('Search Text:', this.searchText);

    // Alternatively, access the value directly from the event
    const inputValue = (event.target as HTMLInputElement).value;
    console.log('Input Value:', inputValue);
  }

  handleRightClickInIframe(e: any) {
    let doc =
      this.iframeRef.nativeElement.contentDocument ||
      this.iframeRef.nativeElement.contentWindow;
    console.log(
      'Right-click doc ngAfterViewInit',
      doc,
      '\n',
      doc.addEventListener,
      '\n',
      typeof doc.addEventListener,
      '\n',
      doc.querySelectorAll('body')
    );
    var right_click = doc.querySelectorAll('body')[0] as HTMLElement;
    console.log('right_click', right_click);
    doc.addEventListener('onclick', this.iframeClickHandler(e));
    if (doc.getAttribute('contextMenuListener') !== 'true') {
      if (typeof doc.addEventListener !== undefined) {
        doc.setAttribute('contextMenuListener', 'true');
        // doc.addEventListener("contextmenu", this.iframeClickHandler)
      } else if (typeof doc.attachEvent !== undefined) {
        doc.setAttribute('contextMenuListener', 'true');
        doc.attachEvent('onclick', this.iframeClickHandler);
      }
    }
  }

  onIframeLoad(e: any, id: string): void {
    console.log('e', e, 'id', id);
  }
  menuTriggerClicked(right_clik_action: string) {
    console.log('Right-click detected inside iframe', right_clik_action);
    this.right_drop_action = right_clik_action;
  }

  iframeClickHandler(e: any): void {
    console.log('EVENT', e);
    this.eleft = e.screenX;
    this.etop = e.screenY;
    this.isBooleanVariable = !this.isBooleanVariable;
    // alert("Iframe clicked");
  }

  HTML_helight(config: any, ref_dict: any) {
    console.log('config', config, 'xmlids', ref_dict);
    var id = config['id'];
    var xml_list: any = [];
    var char_list = [];
    var txt = ref_dict.txt || '';
    if ('xml_list' in ref_dict) {
      xml_list = ref_dict['xml_list'] || [];
    }
    if ('c' in ref_dict) {
      //char_list.push(ref_dict['c']);
      char_list = ref_dict['c'].split('$$');
    }
    if (xml_list.length == 0 || xml_list.length == 0) {
      return;
    } else {
      setTimeout(() => {
        const element: HTMLIFrameElement = document.getElementById(
          `${id}`
        ) as HTMLIFrameElement;
        const iframe = element.contentWindow;
        setTimeout(() => {
          xml_list.forEach((xml: String) => {
            if (xml == '')
              return
            console.log('xmlid_list', xml);
            if (iframe !== null) {
              var xml_h = iframe.document.querySelectorAll(
                'body'
              )[0] as HTMLElement;
              var sty = xml_h.querySelectorAll(
                '[xmlids="' + xml + '"]'
              )[0] as HTMLElement;
              sty.style.border = '2px solid rgb(150, 200, 162)';
              sty.style.background = 'rgba(243, 230, 88, 0.3)';
              sty.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }, 300);
      }, 200);
    }
  }

  helight_(config: any): void {
    console.log('Config', config, config.hasOwnProperty('ref'));
    this.clearAll_hightlights(this.config.id);
    if (config.hasOwnProperty('ref')) {
      config.ref.forEach((ech_ref_dict: any, idx: any) => {
        var xml_list = [];
        if (!('xml_list' in ech_ref_dict)) {
          if (ech_ref_dict.hasOwnProperty('x')) {
            if (ech_ref_dict['x'] != '') xml_list = [ech_ref_dict['x']];
            if (ech_ref_dict['x'].indexOf('#') > -1)
              xml_list = ech_ref_dict['x'].split('#');
            else if (ech_ref_dict['x'].indexOf('_@_') > -1)
              xml_list = ech_ref_dict['x'].split('_@_');
            else if (ech_ref_dict['x'].indexOf('$') > -1)
              xml_list = ech_ref_dict['x'].split('$$');
            console.log(
              '',
              ech_ref_dict['x'],
              ech_ref_dict['x'].indexOf('$'),
              '\n',
              ech_ref_dict['x'].split('$$')
            );
          }
          var xml_list_m: any = [];
          if (ech_ref_dict.hasOwnProperty('xml_list')) {
            ech_ref_dict['xml_list'].forEach(function (ech_ids: any) {
              var ech_ids_lst = [];
              if (ech_ids != '') ech_ids_lst = [ech_ids];
              if (ech_ids.indexOf('#') > -1) ech_ids_lst = ech_ids.split('#');
              else if (ech_ref_dict['x'].indexOf('_@_') > -1)
                xml_list = ech_ref_dict['x'].split('_@_');
              xml_list_m = xml_list_m.concat(ech_ids_lst);
            });
          }
          var conc_xml_lst = xml_list.concat(xml_list_m);
        } else {
          conc_xml_lst = ech_ref_dict['xml_list'];
        }
        if (conc_xml_lst.length) {
          ech_ref_dict['xml_list'] = conc_xml_lst;
          console.log('NRS table', ech_ref_dict['xml_list']);
          this.HTML_helight(config, ech_ref_dict);
        }
      });
    }
  }

  ref_tabchange(item: string, active: string) {
    console.log('item', item, active);
    this.active = active;
    this.config.activeTab = active
    console.log('item', item, this.active);
    // this.ngAfterViewInit()
    if (active === 'pdf') {
      console.log('this.active', this.active,);
      // this.config = this.config;
      this.config = {
        ...this.config,
      }
    } else if (active === 'HTML') {
      this.helight_(this.config)
    }

  }
  page_no_change_func(config: any, pos: string, ind: number) {
    console.log('Config', config, '\n', pos, ind);
    // config.pdf = `/cross?docid=${config.ref[0]['d']}&pgno=${pos}`
    config.html = `/document_html?projid=${config.projid}&docid=${config.ref[0]['d']}&pgno=${pos}`;//Rajat project_id
    // config.html = `/getData?projid=1054292&docid=152258&pgno=27&get=newblockhtmlintf`
    config.HTML_t = `/document_html_t?projid=${config.projid}&docid=${config.ref[0]['d']}&pgno=${pos}`;
    config.pdf = `/cross?projid=${config.projid}&docid=${config.ref[0]['d']}`;
    config.selected_pno = pos;
    console.log('Config aftet', config);
    this.reload.emit(this.config)

  }
  page_no_change_func_scroll(config: any, pos: string): void {
    console.log('Config', config, '\n', pos);
    var page_list = config.pno_list.map((r: any) => Number(r));
    //var get_idx = config.pno_list.indexOf(config.selected_pno);
    var get_idx = page_list.indexOf(Number(config.selected_pno));
    var rw;
    if (pos == 'prev') {
      rw = config.pno_list[get_idx - 1];
    } else if (pos == 'next') {
      rw = config.pno_list[get_idx + 1];
    }
    config.selected_pno = rw;
    console.log('CONFIG222', config, '\nPOS222', pos);
    this.iframe_page_no_change(config);
  }
  iframe_page_no_change(config: any): void {
    console.log(
      'iframe_page_no_change12== ',
      config,
      '\n',
      config.selected_pno
    );
    config.html = `/document_html?projid=${config.projid}&docid=${config.ref[0]['d']}&pgno=${config.selected_pno}`// `/getData?projid=${config.ref.mid}&docid=${config.ref.d}&pgno=${config.selected_pno}&get=newblockhtmlintf`;

    config.HTML_t = `/document_html_t?projid=${config.projid}&docid=${config.ref[0]['d']}&pgno=${config.selected_pno}`;
    //config.pdf = `/cross?docid=${config.ref[0]['d']}&pgno=${config.ref[0]['p']}`//`/getData?projid=${config.ref.mid}&docid=${config.ref.d}&pgno=${config.selected_pno}&get=pdfpage`;
    config.pdf = `/cross?projid=${config.projid}&docid=${config.ref[0]['d']}`
  }
  clearAll_hightlights(id: string) {
    console.log('ClearAll_helight', id);
    this.key_val_sup_hlight = '';
    if (this.isBooleanVariable) {
      this.isBooleanVariable = false;
    }
    // if (id == 'Refrence_component') {
    this.reload_html(id);
    // }
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
    this.clearAll_hightlights(this.config.id);
    var element_get = document.getElementById(
      this.config.id
    ) as HTMLIFrameElement;
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
      data = iframe?.json_lst.dSelect || [];
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
    console.log("mergedData", mergedArray, typeof (mergedArray))
    // console.log("mergedData cal func",array,typeof(array))
    const Array = this.normalizeArray(mergedArray)
    console.log("mergedData after", Array)
    // return
    action[pos] = Array;
    // console.log('mergedArray', mergedArray, 'Action', action);
    const dataToSend = { source: 'refrence', action: action };
    // Emit the data to the parent component
    this.reload.emit(dataToSend);
  }

  normalizeArray(array: any[]): any[] {
    console.log("mergedData cal func", array, typeof (array))
    return array.map(item => ({
      text: item.target_ctrl_text || item.target_text || item.target_alt_txt || '', // Prioritize keys in order
      xml_id: item.target_ctrl_xml_id || item.target_xml || item.alt_xml_id || '',
      char_id: item.target_ctrl_char_id || item.target_char_id || item.alt_char_id || '',
      toc_id: item.target_ctrl_toc_id || item.target_tocid || item.alt_toc_id || '',
      cell_id: item.target_ctrl_cell_id || '', // Only one source for cell_id
      pno: item.target_ctrl_pno || item.target_pno || item.alt_pno || this.config.selected_pno || ''
    }));
  }

}


