import { Component, Input, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef, GridOptions, FilterChangedEvent } from 'ag-grid-community'; // Column Definition Type Interface
@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent {
  @Input() gridOptions !: GridOptions;
  @ViewChild(AgGridAngular) aggrid!: AgGridAngular
  columnDefs: ColDef[] = []
  rowData = []
  summary = []
  updateGrid(rowData: any) {
    this.gridOptions.rowData = rowData;
  }
  onGridReady(event: any) { }
  onFilterChanged(e: FilterChangedEvent) { }
}
