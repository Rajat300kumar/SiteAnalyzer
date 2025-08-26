import { CommonModule } from '@angular/common';
import { Component, ViewChild, input } from '@angular/core';
// import { SafePipe } from "../services/safe.pipe";
import { FormsModule } from '@angular/forms';
// import { BypassHtmlSanitizerPipe, Filter } from '../services/pipe.pipe';
import { MatButtonModule } from '@angular/material/button';
import { Filter } from "../pipes/pipe.pipe";
@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container">
      <span>{{params.displayName}}</span>
      <!-- <div class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper">
        <input class="ag-input-field-input ag-checkbox-input" type="checkbox" [(ngModel)]="value" (change)="toggle()">
      </div> -->
      <!-- <label><input type="checkbox"><span class="label">
         <img src="/assets/checkboxUnchecked.svg" alt="">
         <img src="/assets/checkboxChecked.svg" alt="">
        </span></label> -->
      <input type="checkbox" [(ngModel)]="value" (change)="toggle()">
    </div>
  `,
  styles: `
    .container{
      display: flex;
      flex-direction: column;
      gap: 4px;
      height: 100%;
      justify-content: center;
      align-items: center;
      color: rgba(0, 0, 0, 0.85);
      /* font-weight: 400; */
    }
    .ag-checkbox-input-wrapper {
      width: 12px;
      height: 12px;
      font-size: 12px;
    }
    /* input[type=checkbox] {
      display: none;
    }
    label {
      width: 24px;
      height: 24px;
    }
    .label {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-size: cover !important;
      background: url("/assets/checkboxUnchecked.svg");
    }
    input[type=checkbox]:checked + .label {
      background: url("/assets/checkboxChecked.svg");
    } */
  `,
})
export class BatchHeader {

  params: any

  value: boolean = false

  agInit(params: any): void {
    this.params = params
    console.log('%csrc/app/side-menu/side-menu.component.ts:395 params', 'color: #007acc;', params, this.value);
  }

  toggle() {
    this.params.api.forEachNode((node: any) => {
      node.data[this.params.displayName] = this.value
    })
    this.params.api.refreshCells({
      columns: [this.params.displayName]
    })
  }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="TaxoTree" (mouseover)="hoverIn()" (mouseout)="hoverOut()">
    <div class="cell">
			@for(ind of [].constructor(params.data.level+1); track ind){
				<span (click)="toggle(params.data)" class="indent" [ngStyle]="params.data.hasOwnProperty('expanded')?{'cursor': 'pointer'}:{}">
					@if (params.data.hasOwnProperty('expanded') && $last) {
						@if(params.data.expanded) {
								<i class="fa fa-minus"></i>
						}
						@else {
              <i class="fa fa-plus"></i>
						}
					}
				</span>
			}
			<span class="text" [ngStyle]="{width: 'calc(100% - '+params.data.level*24+'px)'}">
					{{params.value}}
			</span>
    </div>
      <div class="container">
        <div class="box" (click)="add($event)">
          <i class="fa fa-solid fa-plus" style="color: #0384FC;"></i>
        </div>
        <div class="box" (click)="edit($event)">
          <i class="fa fa-regular fa-pen-to-square" style="color: #C297FF;"></i>
        </div>
        <div class="box" (click)="del($event)">
          <i class="fa fa-regular fa-trash-can" style="color: #ff574d;"></i>
        </div>
      </div>
    </div>
  `,
  styles: `
    .TaxoTree, .cell {
      display: flex;
      width: 100%;
    }
    .TaxoTree:hover>.cell {
      width: calc(100% - 64px);
    }
    .TaxoTree:hover>.container{
      display: flex;
    }
    .indent{
      border-right: 1px solid #F7F8FB;
      min-width: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000000A6;
      font-size: 12px
    }

    .text{
      margin-left: 16px;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .container{
      display: none;
      height: 100%;
      width: 66px;
      gap: 8px;
      float: right;
      align-items: center;
      padding: 8px;
      border-left: 1px solid #FFF;
      margin: 0;
    }
    .box {
      border-radius: 2px;
      background: white;
      height: 12px;
      display: flex;
      font-size: 12px;
      cursor: pointer;
    }
    .ag-theme-quartz .ag-row-hover{
      background-color: #ECF0F1;
    }
  `,
})
export class TaxoTree {
  params: any
  agInit(params: any): void {
    this.params = params
  }

  refresh(params: any): boolean {
    //   console.log('renderer refreshed');
    return true;
  }

  toggle(data: any): void {
    console.log('%csrc/app/side-menu/side-menu.component.ts:179 data, data.expanded', 'color: #007acc;', data, data.expanded);
    if (data.hasOwnProperty('expanded'))
      data.expanded = !data.expanded
    this.params.api.onFilterChanged()
  }

  hoverIn() {
    this.params.data.style['rowHover'] = {
      'border-top': '1px solid #FFA000',
      'border-bottom': '1px solid #FFA000',
      'border-left': 'none',
      'border-right': 'none',
      'background': '#FFF5E4',
      'box-shadow': '0px 2px 4px -2px rgba(102, 112, 128, 0.12)',
    }
    this.params.api.refreshCells({
      force: true,
      columns: this.params.api.getAllDisplayedColumns()
    })
  }
  hoverOut() {
    delete this.params.data.style['rowHover']
    this.params.api.refreshCells({
      force: true,
      columns: this.params.api.getAllDisplayedColumns()
    })
  }

  add(e: any) {
    e.stopPropagation()
  }
  edit(e: any) {
    e.stopPropagation()
  }
  del(e: any) {
    e.stopPropagation()
  }
}

export type ButtonConfig = [string, string, () => void, string]
interface whileupload {
  Condition: Boolean,
  tasAlert: any[]
}
interface uploadInput {
  hidden: Boolean,
  folder: string,
  whileupload: whileupload
}

export interface sideMenuConfig {
  centerClose?: boolean;
  type: number,
  list?: any,
  delet_item?:Function,
  itemSelectionCb: Function,
  tabSelectionCb?: Function,
  selectedItem?: any,
  title?: string,
  iconClass?: string,
  search?: boolean,
  overlay?: boolean,
  update?: Function,
  width?: string,
  minWidth?: string,
  top?: string,
  left?: string,
  right?: string,
  displayKey?: string,
  upload?: uploadInput,
  uploadCb?: Function,
  selectedTab?: string,
  tabList?: any[],
  tabData?: any,
  buttonList?: ButtonConfig[]
  hidden?: boolean;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
  imports: [CommonModule, FormsModule, MatButtonModule,Filter]
})
export class SideMenuComponent {

  config = input.required<sideMenuConfig>()

  tabList = ['Projects', 'Batches', 'Taxonomy']
  batchTabList = ['App_ Config', 'Apply_ New', 'Apply_ Appnd', 'Delete']
  taxoTabList = [
    {
      icon: '<i class="fa fa-solid fa-plus" style="color: #6c78f9;"></i>',
      text: 'Add Taxo'
    },
    {
      icon: '<i class="fa fa-regular fa-trash-can" style="color: #ff574d;"></i>',
      text: 'Delete Taxo'
    },
    {
      icon: '<i class="fa fa-regular fa-pen-to-square" style="color: #ffa000;"></i>',
      text: 'Edit Taxo'
    },
  ]
  selectedItem: any

  selectedProjectTab: any;
  selectedBatchTab: any;
  selectedTaxoTab: any;

  selection: any = {
    1: {},
    2: {
      app1: false,
      app2: false,
      apply: this.batchTabList[0],
      dropdown: 'All'
    },
    3: {
      operation: 'Add',
    }
  }

  @ViewChild('grid') grid!: any

  gridConfig: any
  centerClose: any = false
  menuConfig: any
  searchTerm: any;

  ngOnInit() {
    this.initMenuConfig()
  }
  menuBtnList: any = []
  initMenuConfig() {
    console.log('this.config()', this.config());
    console.log('%csrc/app/side-menu/side-menu.component.ts:231 type', 'color: #007acc;', this.config().type);
    switch (this.config().type) {
      case 1:
        // this.config().selectedTab = 'Projects'
        // this.config().tabList = ['Projects', 'Batches', 'Taxonomy']
        // this.config().list = {
        //   Projects: {
        //     list: this.config().list?.['Projects'] || []
        //   },
        //   Batches: {
        //     app1: false,
        //     app2: false,
        //     apply: this.batchTabList[0],
        //     dropdown: 'All'
        //   },
        //   Taxonomy: {
        //     operation: 'Add',
        //   }
        // }
        break
      case 2:
        // this.menuConfig =
        this.gridConfig = {
          // leftArrowTree: {
          // gridConfig: {
          columnDefs: [
            {
              field: 'data',
              headerName: 'data',
              treeIcons: {
                folded: ['<i class="fa fa-chevron-right"></i>'],
                expanded: ['<i class="fa fa-chevron-down"></i>']
              },
              toggleOnClick: 'cell',
              suppressSizeToFit: false,
              onCellClicked: (params: any) => {
                this.itemSelection(params, 'leftArrowTree')
                // this.menuConfig['leftArrowTree'].selectedItem = params.data
              }
            }
          ],
          rowData: Array.from(this.config().list, (l, i) => {
            var tree = {
              id: i,
            } as any
            var n = i % 10

            if (!(n)) {
              tree.level = 0
              tree.style = { data: { 'font-weight': '700' } }
            }
            else if (n == 1) {
              tree.level = 1
              tree.parentId = i - 1
            }
            else if (i % 5 > 1 && i % 5 <= 4) {
              tree.level = 2
              tree.parentId = Math.floor(i / 10) * 10 + 1
              tree.style = { data: { 'color': '#6C78F9' } }
            }
            else if (n == 5) {
              tree.level = 3
              tree.parentId = Math.floor(i / 10) * 10 + 4
              tree.style = { data: { 'color': '#FFA000' } }
            }
            else if (n == 6) {
              tree.level = 4
              tree.parentId = Math.floor(i / 10) * 10 + 5
              tree.style = { data: { 'color': '#FFA000' } }
            }
            if (n == 0 || n == 1 || n == 4 || n == 5) tree.expanded = true
            // console.log('%csrc/app/side-menu/side-menu.component.ts:124 tree', 'color: #007acc;', tree);
            return {
              data: l,
              ...tree,
              // cellStyle: (params: any)=> {return { 'color' : params.data.level ? '#6680FF' : '#FFA000' }}
            }
          }),

          gridOptions: {},

          defaultColDef: {
            suppressSizeToFit: false,
          },
          flags: {
            tree: 'default',
            hideHeader: true,
            selectedRowStyle: {
              'border-top': 'none',
              'border-bottom': '1px solid #1A86FA',
              'border-left': 'none',
              'border-right': 'none',
              'background': '#ECF7FF',
              'box-shadow': '0px 2px 4px -2px rgba(102, 112, 128, 0.12)',
            }
          }
          // }
          // }
        }
        break
      case 3:
      // // this.config().type = 4
      // console.log('%csrc/app/side-menu/side-menu.component.ts:453 grid', 'color: #007acc;', this.grid);
      // this.config().selectedTab = 'Documents',
      // this.config().tabList = ['Documents', 'Taxonomy'],
      // this.config().list = {
      //     Documents : {

      //     },
      //     Taxonomy : {

      //     }
      //   }
      //   this.tabSelection(this.menuConfig.selectedTab)
      // break
      case 4:
        if (this.config().hasOwnProperty('buttonList') && this.config().buttonList?.length) {
          this.menuBtnList = this.config().hasOwnProperty('buttonList')
        }
        if (this.config().hasOwnProperty('centerClose')) {
          this.centerClose = this.config().centerClose
        }
        break
    }
    console.log('%csrc/app/side-menu/side-menu.component.ts:541 this.menuConfig', 'color: #007acc;', this.config());
  }


  batchData: any
  tabSelection(tab: string) {
    console.log('%csrc/app/side-menu/side-menu.component.ts:334 tab', 'color: #007acc;', tab);
    // this.config().type = tab
    // this.selectedProjectTab = tab
    this.config().selectedTab = tab;
    // this.config().list = this.config().tabData[tab];
    this.config().selectedItem = this.config().tabData[tab].selectedItem;
    this.config().displayKey = this.config().tabData['displayKey'];

    // if(!next)
    (this.config().tabSelectionCb as Function)(tab)

    // setTimeout(() => {
    //   switch(tab) {
    //     // 'Projects'
    //     case 'Projects':
    //       // this.menuConfig.selectedTab = tab
    //       break
    //     // 'Batches'
    //     case 'Batches':
    //       // this.menuConfig.selectedTab = tab
    //       this.config().list['Batches']['gridConfig'] = {
    //         columnDefs: [
    //           {
    //             field: 'source',
    //             headerName: 'source',
    //             maxWidth: 80,
    //             editable: true,
    //             headerComponent: BatchHeader
    //           },
    //           {
    //             field: 'target',
    //             headerName: 'target',
    //             maxWidth: 80,
    //             editable: true,
    //             headerComponent: BatchHeader
    //           },
    //           {
    //             field: 'batchName',
    //             headerName: '',
    //             onCellClicked: (params: any) => {
    //               this.itemSelection(params, 'Batches', this.config().cb, true)
    //               // this.menuConfig['Batches'].selectedItem = params.data
    //               // this.tabSelection('Taxonomy')
    //             }
    //           },
    //           {
    //             field: 'batch',
    //             // headerName: 'batch',
    //             headerName: '',
    //             maxWidth: 40,
    //             editable: true
    //           },
    //           {
    //             field: 'status',
    //             headerName: 'status',
    //             maxWidth: 96,
    //             cellRenderer: ()=>'<img src="assets/info.svg"></img>'
    //           },
    //         ],
    //         rowData: Array.from(this.config().list['Batches'], (l, i)=>{
    //         // this.batchData = Array.from(this.config().list, (l, i)=>{
    //           return {
    //             source: false,
    //             target: false,
    //             batch: false,
    //             batchName: l,
    //             style: {
    //               source: {display: 'flex','justify-content': 'center'},
    //               target: {display: 'flex','justify-content': 'center'},
    //               batch: {display: 'flex','justify-content': 'center'},
    //               // name: {display: 'flex','justify-content': 'left'},
    //             }
    //           }
    //         }),
    //         gridOptions: {},
    //         defaultColDef: {
    //           suppressSizeToFit: false,
    //           suppressRowClickSelection: false,
    //         },
    //         flags: {
    //           tooltip: true,
    //           selectedRowStyle: {
    //             'border-top': 'none',
    //             'border-bottom': '1px solid #DCF2FF',
    //             'border-left': 'none',
    //             'border-right': 'none',
    //             'background': '#EFF9FF',
    //             'box-shadow': '0px 2px 4px -2px rgba(102, 112, 128, 0.12)',
    //           },
    //           selectedRowIndex: this.config().list['Batches'].selectedItem?.rowIndex
    //         }
    //         // filter: false,
    //         // floatingFilter: false
    //       }
    //       this.gridConfig = this.config().list['Batches']['gridConfig']
    //       // setTimeout(() => {
    //       //   this.grid.gridApi.sizeColumnsToFit()
    //       // }, 1000);
    //       break
    //     // 'Taxonomy'
    //     case 'Taxonomy':
    //       // this.menuConfig.selectedTab = tab
    //       // this.config().type = 3
    //       // this.selection[tab] = {
    //       //   operation: 'Add',
    //       // }
    //       console.log('%csrc/app/side-menu/side-menu.component.ts:614 grid', 'color: #007acc;', this.grid);
    //       if(this.config().type==1)
    //         this.config().list['Taxonomy']['gridConfig'] = {
    //           columnDefs: [
    //             {
    //               field: 'taxonomy',
    //               headerName: 'Taxonomy',
    //               cellRenderer: TaxoTree
    //             },
    //           ],
    //           gridOptions: {},
    //           // rowData: this.config().list['Taxonomy'].map((t: any)=>{
    //           //   if(t.level==0)
    //           //     t.style = {taxonomy: {'color': '#FFA000'}}
    //           //   else
    //           //     t.style = {taxonomy: {'color': '#6C78F9'}}
    //           //   return t
    //           // }),
    //           rowData: Array.from(this.config().list['Taxonomy'], (l, i)=>{
    //             // console.log('%csrc/app/side-menu/side-menu.component.ts:135 Math.floor(i/10)', 'color: #007acc;', Math.floor(i/10));
    //             var tree = {
    //               id: i,
    //             } as any

    //             var n = i%10

    //             if((n)<=1) {
    //               tree.level = 0
    //               // tree.style = {taxonomy: {'color': '#FFA000'}}
    //             }
    //             else if(n>=2 && n<=6) {
    //               tree.level = 1
    //               tree.parentId = Math.floor(i/10)*10 + 1
    //               // tree.style = {taxonomy: {'color': '#6C78F9'}}
    //             }
    //             else if(n==8) {
    //               tree.level = 3
    //               tree.parentId = Math.floor(i/10)*10 + 7
    //               // tree.style = {taxonomy: {'color': '#6C78F9'}}
    //             }
    //             else if(n>=7&&n<=9) {
    //               tree.level = 2
    //               tree.parentId = Math.floor(i/10)*10 + 6
    //               // tree.style = {taxonomy: {'color': '#6C78F9'}}
    //             }

    //             if(tree.level==0)
    //               tree.style = {taxonomy: {'color': '#FFA000'}}
    //             else
    //               tree.style = {taxonomy: {'color': '#6C78F9'}}
    //             if(n==1||n==6||n==7) tree.expanded = true
    //             // console.log('%csrc/app/side-menu/side-menu.component.ts:124 tree', 'color: #007acc;', tree);
    //             return{
    //               taxonomy: l,
    //               ...tree,
    //               cellStyle: (params: any)=> {return { 'color' : params.data.level ? '#6680FF' : '#FFA000' }}
    //             }
    //           }),
    //           defaultColDef: {
    //             suppressSizeToFit: false,
    //           },
    //           flags: {
    //             tree: 'custom',
    //             checkSelect: true,
    //             filter: true
    //           }
    //         }
    //       else
    //         this.config().list['Taxonomy']['gridConfig'] = {
    //             columnDefs: [
    //               {
    //                 field: 'taxonomy',
    //                 headerName: 'taxonomy',
    //                 treeIcons: {
    //                   folded: ['<i class="fa fa-chevron-right"></i>'],
    //                   expanded: ['<i class="fa fa-chevron-down"></i>']
    //                 },
    //                 toggleOnClick: 'cell',
    //                 suppressSizeToFit: false,
    //                 onCellClicked: (params: any) => {
    //                 this.itemSelection(params, 'Taxonomy', this.config().cb)
    //                 // this.config().list['Taxonomy'].selectedItem = params.data
    //                 }
    //               }
    //             ],
    //             rowData: Array.from(this.config().list['Taxonomy'], (l, i)=>{
    //               var tree = {
    //                 id: i,
    //               } as any
    //               var n = i%10

    //               if(!(n)) {
    //                 tree.level = 0
    //               }
    //               else if(n==1) {
    //                 tree.level = 1
    //                 tree.parentId = i - 1
    //               }
    //               else if(i%5>1&&i%5<=4) {
    //                 tree.level = 2
    //                 tree.parentId = Math.floor(i/10)*10 + 1
    //                 // tree.style = {data: {'color': '#6C78F9'}}
    //               }
    //               else if(n==5) {
    //                 tree.level = 3
    //                 tree.parentId = Math.floor(i/10)*10 + 4
    //                 // tree.style = {data: {'color': '#FFA000'}}
    //               }
    //               else if(n==6) {
    //                 tree.level = 4
    //                 tree.parentId = Math.floor(i/10)*10 + 5
    //                 // tree.style = {data: {'color': '#FFA000'}}
    //               }
    //               if(n==0||n==1||n==4||n==5) tree.expanded = true

    //               if(tree.level==0)
    //                 tree.style = {taxonomy: {'color': '#595959'}}
    //               else if(tree.level==1)
    //                 tree.style = {taxonomy: {'color': '#6C78F9'}}
    //               // else
    //               //   t.style = {document: {'color': '#ffa000'}}
    //               else
    //                 tree.style = {taxonomy: {'color': '#FFA000'}}

    //               // console.log('%csrc/app/side-menu/side-menu.component.ts:124 tree', 'color: #007acc;', tree);
    //               return{
    //                 taxonomy: l,
    //                 ...tree,
    //                 // cellStyle: (params: any)=> {return { 'color' : params.data.level ? '#6680FF' : '#FFA000' }}
    //               }
    //             }),

    //             gridOptions: {},

    //             defaultColDef: {
    //               suppressSizeToFit: false,
    //             },
    //             flags: {
    //                 tree: 'right',
    //                 hideHeader: true,
    //                 selectedRowStyle: {
    //                   'border-top': 'none',
    //                   'border-bottom': '1px solid #1A86FA',
    //                   'border-left': 'none',
    //                   'border-right': 'none',
    //                   'background': '#ECF7FF',
    //                   'box-shadow': '0px 2px 4px -2px rgba(102, 112, 128, 0.12)',
    //                 }
    //               }
    //         }
    //       this.gridConfig = this.config().list['Taxonomy']['gridConfig']
    //       break
    //     case 'Documents':
    //       this.config().list['Documents']['gridConfig'] = {
    //           columnDefs: [
    //             {
    //               field: 'document',
    //               treeIcons: {
    //                 folded: ['<i class="fa fa-chevron-right"></i>'],
    //                 expanded: ['<i class="fa fa-chevron-down"></i>']
    //               },
    //               toggleOnClick: 'cell',
    //               suppressSizeToFit: false,
    //               onCellClicked: (params: any) => {
    //                 this.itemSelection(params, 'Documents', this.config().cb, /* true */)
    //                 // this.config().list['Documents'].selectedItem = params.data
    //               }
    //             }
    //           ],
    //           rowData: Array.from(this.config().list['Documents'], (l, i)=>{
    //             var tree = {
    //               id: i,
    //             } as any
    //             var n = i%10

    //             if(!(n)) {
    //               tree.level = 0
    //             }
    //             else if(n==1) {
    //               tree.level = 1
    //               tree.parentId = i - 1
    //             }
    //             else if(i%5>1&&i%5<=4) {
    //               tree.level = 2
    //               tree.parentId = Math.floor(i/10)*10 + 1
    //               // tree.style = {data: {'color': '#6C78F9'}}
    //             }
    //             else if(n==5) {
    //               tree.level = 3
    //               tree.parentId = Math.floor(i/10)*10 + 4
    //               // tree.style = {data: {'color': '#FFA000'}}
    //             }
    //             else if(n==6) {
    //               tree.level = 4
    //               tree.parentId = Math.floor(i/10)*10 + 5
    //               // tree.style = {data: {'color': '#FFA000'}}
    //             }
    //             if(n==0||n==1||n==4||n==5) tree.expanded = true

    //             if(tree.level)
    //               tree.style = {document: {'color': '#6680FF'}}
    //             else
    //               tree.style = {document: {'color': '#595959'}}
    //             // console.log('%csrc/app/side-menu/side-menu.component.ts:124 tree', 'color: #007acc;', tree);
    //             return {
    //               document: l,
    //               ...tree,
    //               // cellStyle: (params: any)=> {return { 'color' : params.data.level ? '#6680FF' : '#FFA000' }}
    //             }
    //           }),

    //           gridOptions: {},

    //           defaultColDef: {
    //             suppressSizeToFit: false,
    //           },
    //           flags: {
    //               tree: 'right',
    //               hideHeader: true,
    //               // showSlNo: true,
    //               selectedRowStyle: {
    //                 'border-top': 'none',
    //                 'border-bottom': '1px solid #1Aa6FA',
    //                 'border-left': 'none',
    //                 'border-right': 'none',
    //                 'background': '#ECF7FF',
    //                 'box-shadow': '0px 2px 4px -2px rgba(102, 112, 128, 0.12)',
    //               }
    //             }
    //         }
    //       this.gridConfig = this.config().list['Documents']['gridConfig']
    //       break

    //   }
    // }, 1);

    console.log('%csrc/app/side-menu/side-menu.component.ts:352 selection', 'color: #007acc;', this.selection, this.config().list, this.config());
  }
  uploadDone(fileinfo: any) {
    console.log('done | filename =', fileinfo);
    // this.config().uploadCb(fileinfo[0],fileinfo[1])
  }
  ddConfig = {
    list: ['All'],
    selectedItems: '',
    cb: (item: any) => this.dropdown(item)
  }
  dropdown(e: any) {
    console.log('%csrc/app/side-menu/side-menu.component.ts:428 e', 'color: #007acc;', e);
    return e
  }
  __deletelist(item: any){
    console.log("item",item);
    (this.config() as any).delet_item(item)
  }
  itemSelection(item: any, tab: string = '', nextTab: boolean = false) {
    console.log('%csrc/app/side-menu/side-menu.component.ts:834 item, tab', 'color: #007acc;', item, tab, this.config());

    // if(Array.isArray(this.config().list))
    this.config().selectedItem = item
    if (this.config().tabData) {
      this.config().tabData[tab].selectedItem = item
      this.config().selectedItem = item
    }

    if (nextTab) {
      var ind = (this.config()['tabList']?.indexOf(tab) as any) + 1
      if (ind < (this.config()['tabList']?.length || 0)) {
        // this.tabSelection(this.config()['tabList']?.[ind])
        this.config().selectedTab = this.config()['tabList']?.[ind];
        // this.config().list = this.config().tabData[tab];
        this.config().selectedItem = this.config().tabData[this.config()['tabList']?.[ind]].selectedItem;
        this.config().displayKey = this.config().tabData['displayKey'];
      }


    }
    if (this.config().itemSelectionCb)
      this.config().itemSelectionCb(item, tab.length ? tab : null)

  }


  getColours(val: any) {
    // console.log('%csrc/app/side-menu/side-menu.component.ts:958 val', 'color: #007acc;', val);
    switch (val) {
      case 'GR': case false:
        return 'grey'
      case 'O':
        return 'orange'
      case 'G': case true:
        return 'green'
      default:
        return
    }
  }
  toggleSideMenu(event: any, status = !this.config().hidden) {
    event.stopPropagation()
    this.config().hidden = status
  }
}
