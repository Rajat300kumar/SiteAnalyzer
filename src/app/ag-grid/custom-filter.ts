import {
  Component,
  ViewChild,
  ViewContainerRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import {
  IDoesFilterPassParams,
  IFilterParams,
  FilterOpenedEvent,
} from 'ag-grid-community';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { AgGridComponent } from './ag-grid.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Filter } from '../services/pipe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FactoryService } from '../factory/factory.service';

declare var $: any;
// import FuzzySearch from "fuzzy-search";
@Component({
  standalone: true,
  imports: [
    FormsModule,
    MatListModule,
    MatFormFieldModule,
    Filter,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    CommonModule,
    MatGridListModule,
    AgGridComponent,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
  template: `
    <mat-tab-group>
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="example-tab-icon">filter_list</mat-icon>
          Filter
        </ng-template>
        <div class="flexCenter">
          <mat-form-field>
            <input
              matInput
              [(ngModel)]="searchText"
              placeholder="search.."
              autocomplete="off"
            />
          </mat-form-field>
          <span class="flexCenter" (click)="clickToCopy()">
            <mat-icon>file_copy</mat-icon>
            @if(!copiedFlg) {
            <mat-icon style="color: green;font-size: 16px;">check</mat-icon>
            }
          </span>
        </div>
        <div>
          @for(code of filterList | filter:searchText; track code) {
          <label for="{{ code.val }}" class="listItem flexCenter">
            <input
              type="checkbox"
              id="{{ code.val }}"
              [checked]="code.checked"
              (click)="searchList(code, 'not_only')"
            />
            <span mat-line class="listItemTxt ellipsis">
              {{ code.val == '' ? '(Blank)' : code.val }}
            </span>
            <div class="subItem" (click)="searchListOnly(code, $event)">
              @if(code.val != 'select') {
              <span class="only">only</span>
              }
            </div>
            <div class="subItem">
              <span>({{ code.count }})</span>
            </div>
          </label>
          }
        </div>
      </mat-tab>

      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="example-tab-icon">view_column</mat-icon>
          Third Tab
        </ng-template>
        {{ colId }}
      </mat-tab>
    </mat-tab-group>
  `,
  styles: `
        mat-tab-group{
            width:482px;
            height:280px ;
        }
        mat-form-field{
            width:100%;
        }
        mat-icon {cursor: pointer}
        .listItem {
            width: 100%;
            height: 32px;
            border-bottom: 1px solid #ddd;
            padding: 4px;
            gap: 8px;
            cursor: pointer;
        }
        .listItemTxt {
            flex-grow: 1
        }
        .subItem {
            float: right;
            width: 15%;
            text-align: center;
            line-height: normal;
            padding-top: 3px;
            color: #0080ff;
        }
        .only {
            background-color: #d3e9ff;
            border-radius: 16px;
            padding: 0 16px;
            opacity: 0
        }
        .listItem:hover .only {
            opacity: 1;
        }
    `,
})
export class PartialMatchFilter implements IFilterAngularComp {
  filterParams!: IFilterParams;
  public text = '';
  filterKey: any = []; //Get the Filter Key of list
  fieldId: any = ''; //Get the column name
  filterList: any[] = [];
  public searchText: string = '';
  select_only = 'accent';
  @ViewChild('input', { read: ViewContainerRef })
  factory = inject(FactoryService);

  colId: any;
  agInit(params: IFilterParams): void {
    this.filterParams = params;
    console.log(
      '%ccustom-filter.ts line:220 params',
      'color: #007acc;',
      params,
      this.factory,
      FactoryService
    );
    var col = this.filterParams['colDef']['field'];
    this.colId = col;
    this.fieldId = this.filterParams['colDef']['field'];
    (this.filterParams['column'] as any)['gridOptionsService']
    ['gridOptions'][
      'rowData'
    ].forEach((element: any) => {
      for (let key in element) {
        // console.log('KEY_filter', key, '\n', typeof (key))
        if (key !== 'ref' && key !== 'taxo' && key !== 'rowStyle') {
          if (!this.filterKey[key]) {
            this.filterKey[key] = [];
          }
          let val = element[key];
          let existing = this.filterKey[key].find(
            (item: any) => item.val === val
          );
          if (existing) {
            existing.count++;
          } else {
            this.filterKey[key].push({
              val: val.v || val,
              count: 1,
              checked: true,
              only: false,
            });
          }
        }
      }
    });
    // console.log("This.datafilter", this.filterKey[`${col}`]);
    this.filterKey[`${col}`].unshift({
      val: 'select',
      count:
        (this.filterParams['column'] as any)['gridOptionsService']
        ['gridOptions'][
          'rowData'
        ].length,
      checked: true,
      only: false,
    });
    this.filterList = this.filterKey[`${col}`];
    console.log(
      '%csrc/app/ag-grid/custom-filter.ts:296 this.filterKey',
      'color: #007acc;',
      this.filterKey,
      this.filterParams,
      col
    );
  }

  isFilterActive(): boolean {
    // return this.text != null && this.text !== '';
    return true;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const { node } = params;
    var cell = node.data[this.colId].v || node.data[this.colId];

    if (!node.data && typeof cell != 'string') {
      return false;
    }

    const stringFilterCondition =
      cell
        ?.toString()
        ?.toLowerCase()
        ?.includes(this.text?.toString()?.toLowerCase()) || !this.text;
    const objectFilterCondition = this.filterList.find(
      (val) => val.val.toString() == cell
    )?.checked;

    // console.log(
    //   '%ccustom-filter.ts doesFilterPass',
    //   'color: #007a5c;',
    //   '\nparams ', params,
    //   '\ncell ', cell,
    //   '\nthis.text ', this.text,
    //   '\nthis.filterParams ', this.filterParams,
    //   '\nnode ', node,
    //   '\nnode.id ', node.id,
    //   '\nnode.data ', node.data,
    //   '\nthis.colId ', this.colId,
    //   '\nnode.data[this.colId], ', node.data[this.colId],
    //   '\nthis.filterList ', this.filterList,
    //   '\nstringFilterCondition ', stringFilterCondition,
    //   '\nobjectFilterCondition ', objectFilterCondition,
    //   '\nstringFilterCondition && objectFilterCondition ', stringFilterCondition && objectFilterCondition
    // );
    return stringFilterCondition && objectFilterCondition;
  }

  //To Get Search list of filter
  searchList(value: any, action: string) {
    value.checked = !value.checked;
    var anyTrue = this.isAnyChecked(true);
    var anyFalse = this.isAnyChecked(false);
    console.log(
      'Selected object: ',
      value,
      '\n',
      this.filterList,
      '\n',
      this.searchText,
      'action',
      action,
      anyTrue,
      anyFalse
    );
    if (anyTrue && anyFalse && value.val != 'select')
      $('#select')[0].indeterminate = true;
    else $('#select')[0].indeterminate = false;

    console.log('select', value.checked);

    if (value.val != 'select') {
      this.filterList[0].checked = !anyFalse;
    } else {
      this.getListData().forEach((ele) => {
        console.log('ele', ele);
        ele.checked = anyFalse;
      });
    }
    this.onChange('');
  }

  searchListOnly(value: any, event: any) {
    event.preventDefault();

    console.log(
      'Selected country code object: ',
      value,
      '\n',
      this.filterList,
      '\n',
      this.searchText
    );
    this.filterList.forEach((ele) => {
      value.only = ele.val == value.val;
      ele.checked = ele.val == value.val;
    });
    $('#select')[0].indeterminate = true;
    this.onChange('');
  }

  getListData = () => this.filterList.slice(1);
  isAnyChecked = (bool: boolean) =>
    !!this.getListData().find((f) => f.checked == bool);

  getModel(): any {
    console.log(
      'DDGD',
      this.isFilterActive(),
      '\n',
      this.text,
      typeof this.text
    );
    if (!this.isFilterActive()) {
      return null;
    }
    return {
      obj: !this.filterList[0].checked
        ? this.getListData()
          .filter((f) => f.checked == true)
          .map((f) => f.val)
          .join(',')
        : '',
      str: this.text,
    };
  }

  setModel(model: any) {
    console.log('DATA__', model);
    this.text = model;
    console.log('DATA__', this.text, '\n');
    this.filterParams.filterChangedCallback();
  }

  componentMethod(message: string): void {
    alert(`Alert from PartialMatchFilterComponent: ${message}`);
  }

  myMethodForTakingValueFromFloatingFilter(value: any) {
    if (this.text != value) {
      console.log(
        '%ccustom-filter.ts line:347 value',
        'color: #007acc;',
        this.text,
        value,
        this.filterParams
      );
      this.text = value;
      this.filterParams.filterChangedCallback();
    }
  }

  //For text
  onChange(newValue: any): void {
    console.log(
      '233',
      this.filterParams.filterChangedCallback,
      '\n',
      this.text
    );
    this.filterParams.filterChangedCallback();
    this.text = newValue;
  }

  copiedFlg: boolean = true;
  clickToCopy = () => {
    this.copiedFlg = false;
    setTimeout(() => {
      this.copiedFlg = true;
    }, 6000);
    console.log(
      '%csrc/app/ag-grid/custom-filter.ts:190 this.factory',
      'color: #007acc;',
      this.factory
    );
    this.factory.copy2DToClipboard(
      this.filterList.map((f: any) => [f.val, f.count])
    );
  };
}
