// import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IHeaderGroupAngularComp } from 'ag-grid-angular';
import { IHeaderGroupParams } from 'ag-grid-community';
import { AgGridComponent } from './ag-grid.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [],
  template: `
    <div id="header" (click)="ag.selectColRow(type, $event)">
      <span ref="eLabel" class="ag-header-group-text" role="presentation">{{params.displayName}}</span>
    </div>
  `,
  styles: [
    `
      #header {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer
      }
    `,
  ],
})
export class CustomHeaderGroup implements IHeaderGroupAngularComp {
  params!: IHeaderGroupParams;
  expandState!: string;
  type!: 'col' | 'colGroup'
  ag = inject(AgGridComponent)
  
  agInit(params: IHeaderGroupParams): void {
    this.params = params;
    this.type = params.hasOwnProperty('columnGroup') ? 'colGroup' : 'col'
    // console.log('%cheader-group-component.ts line:101 params', 'color: #007acc;', params, this.type);
  }
}


@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div id="header">
      <input style="width: 100%" type="text" [(ngModel)]="field" />
      <button class="trpntBtn" (click)="addColumn()">Add</button>
    </div>
  `,
  styles: [
    `
      #header {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer
      }
    `,
  ],
})
export class NewHeader implements IHeaderGroupAngularComp {
  params!: IHeaderGroupParams;
  field: string = ''
  agInit(params: IHeaderGroupParams): void {
    this.params = params;
  }
  addColumn() {
    console.log('%cheader-group-component.ts line:77 field', 'color: #a712bc;', this.field, this.params, this.params.api.getColumnDefs(), this.params.api.getColumnDef((this.params as any).column.colId));
    delete this.params.api.getColumnDef((this.params as any).column.colId)?.headerComponent
    this.params.api.getColumnDef((this.params as any).column.colId)!.colId = this.field
    this.params.api.getColumnDef((this.params as any).column.colId)!.field = this.field
    this.params.api.getColumnDef((this.params as any).column.colId)!.headerName = this.field
    this.params.api.refreshHeader()
  }
}