import { CommonModule } from '@angular/common';
import { Component, ViewChild, HostListener, Input, SimpleChanges, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellFocusedEvent } from 'ag-grid-community'; // Column Definition Type Interface
import { Clipboard } from '@angular/cdk/clipboard'

import { MatIconModule } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

// Pipe if svg not rendering in innerHTML
import { PartialMatchFilter } from './custom-filter';
import { NumberFloatingFilterComponent } from './search-text';
import { CustomHeaderGroup, NewHeader } from './header-group-component';
import { FoldAllTreeHeader, TreeArrowRenderer, TreeArrowRendererBorder, TreeArrowRightRenderer } from './tree-view';
import { FactoryService } from '../factory/factory.service';
import { Router } from '@angular/router';
import { DropdownComponent, dropdownConfig } from "../dropdown/dropdown.component";
import { timer } from 'rxjs';

declare var $:any

export interface AGGridConfig {
	columnDefs: any[],
	rowData: any[],
	gridOptions: any,
	defaultColDef: any,
	flags: any,
}


@Component({
    selector: 'app-ag-grid',
    standalone: true,
    templateUrl: './ag-grid.component.html',
    styleUrl: './ag-grid.component.css',
    imports: [AgGridAngular, CommonModule, FormsModule, MatTabGroup, MatTab, MatIconModule, DropdownComponent]
})
export class AgGridComponent {
	@ViewChild ('aggrid') gridOptions!: any
	gridApi!: GridApi

	// Row Data: The data to be displayed.
	rowData: any = [];

	// Column Definitions: Defines & controls grid columns.
	userColumnDefs: any = [];
	// Coldef with additional standard columns
	columnDefs: ColDef[] = [];

	factory = inject(FactoryService)
	clipboard = inject(Clipboard)
	router = inject(Router)

	// @Input() config: any
	config = input.required<AGGridConfig>()
	@Input() search: any

	focusedCell: any;
	// ngAfterViewInit: Called after Angular initializes the component's view.
	ngAfterViewInit() {
		console.log('this.gridOptions',this.gridOptions)
		// binds the selectColRow function to the current context (this)
		this.selectColRow = this.selectColRow.bind(this);
		// this.initRangeSelection()
	}

	// executed if @inputs change
	ngOnChanges(changes: SimpleChanges) {
		console.log('%csrc/app/ag-grid/ag-grid.component.ts:55 config', 'color: #007acc;', this.config(), changes);
		// if config changes, update grid
		try {
			if(changes['config'] && this.gridOptions) {
				this.initGrid()
			}
			// if search changes execute quick search (every cell of grid)
			else if (changes['search'] && this.gridApi) {
				this.gridSearch(this.search)
			}
		} catch(e) {console.log('%csrc/app/ag-grid/ag-grid.component.ts:239 e', 'color: #007acc;', e);}
	}

	// @HostListener('document:mousedown', ['$event'])
	// @HostListener('document:mousemove', ['$event'])
	// @HostListener('document:mouseup', ['$event'])
	// onMouseEvent(event: any) {
	// 	// console.log('%cHello main/gridComponent_config/src/app/ag-grid/ag-grid.component.ts:75 ', 'background: green; color: white; display: block;');
	// 	function findAllByKey(obj:any, repeatKey:any, finalKeyToFind:any)  {
	// 		var prop = eval('obj.' + finalKeyToFind)
	// 		  // console.log('%cag-grid.component.ts line:208 prop', 'color: #007acc;', prop);
	// 		if (prop) {
	// 			return prop
	// 		}
	// 		else if (obj[repeatKey])
	// 			return findAllByKey(obj[repeatKey], repeatKey, finalKeyToFind)
	// 	}
	// 	const targetElement = event.target as HTMLElement;
	// 	if(event.ctrlKey  && event.buttons != 2 && targetElement && targetElement.classList.contains('ag-cell-value')){
	// 		interface Range {
	// 			startColumn: { [key: string]: any };
	// 			startRow: { [key: string]: any };
	// 			endRow: { [key: string]: any };
	// 			columns: any[]; // You might want to define a type for columns as well
	// 		}
	// 		var range: Range = {
	// 			startColumn: {},
	// 			startRow: {},
	// 			endRow: {},
	// 			columns: [],
	// 		}
	// 		if (event.type === 'mousedown'  && event.buttons == 1) {
	// 			console.log('Mouse Down');
	// 			console.log('ag-body-viewport ------- ag-body-viewport',event)
	// 			console.log('Start');
	// 			var focusedCell = this.gridApi.getFocusedCell()
	// 			if(focusedCell) {
	// 				console.log('Start focusedCell',focusedCell,"\n",this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex));
	// 				range.startRow['rowId'] = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.['id'];
	// 				range.startRow['rowIndex'] = focusedCell.rowIndex;
	// 				range.startRow['rowPinned'] = focusedCell.rowPinned;
	// 				range.startColumn = focusedCell.column
	// 				range.endRow = range.startRow
	// 			}
	// 			console.log('range 11',range );
	// 			console.log('focusedCell',focusedCell);
	// 			var r = findAllByKey(event.target, 'parentNode', 'attributes?.["row-id"]?.value')
	// 			var c = findAllByKey(event.target, 'parentNode', 'attributes?.["aria-colindex"]?.value')
	// 			console.log("CC",c);
	// 			console.log('RR',r);
	// 			range.endRow = {
	// 				rowId: parseInt(r),
	// 				rowIndex: parseInt(findAllByKey(event.target, 'parentNode', 'attributes?.["row-index"]?.value')),
	// 				rowPinned: this.gridApi.getRowNode(r)?.rowPinned,
	// 			}
	// 			console.log('range.endRow ',range.endRow );
	// 			var columns :any = []
	// 			this.gridApi.getColumns()?.map((map: { [x: string]: any; })=> columns.push(map['colId']))
	// 				var ind = columns?.indexOf(range.startColumn['colId'])
	// 			range.columns = []
	// 			for (var i = 0, j = c > ind ? ind : c - 1; c > ind ? j < c : j <= ind && ind != -1; i++, j++) {
	// 					range.columns[i] = columns[j]
	// 			}
	// 			console.log('columns',columns);
	// 			console.log('range movew',range);
	// 			this.rangeSelectedCells = [range]
	// 			 // console.log('%cgrid_component.js line:117 this.rangeSelectedCells, range', 'color: #007acc;', this.rangeSelectedCells, range, this.selectedCells);
	// 			this.selectedCells = []
	// 			this.rangeSelectedCells.map((cell:any) => {
	// 				// console.log('%cgrid_component.js line:119 cell', 'color: #007acc;', cell);
	// 				cell.columns.map((col:any) => {
	// 					// console.log('%cgrid_component.js line:2121 col', 'color: #007acc;', col);
	// 					for (var i = 0; i <= Math.abs(cell.startRow.rowIndex - cell.endRow.rowIndex); i++) {
	// 						var rowId = (cell.startRow.rowIndex < cell.endRow.rowIndex ? cell.startRow.rowIndex : cell.endRow.rowIndex)+i;
	// 						// console.log('%cgrid_component.js line:2123 i', 'color: #007acc;', i, this.gridApi.getDisplayedRowAtIndex(rowId));
	// 						var rowNode :any= this.gridApi.getDisplayedRowAtIndex(rowId)
	// 						// console.log('%cgrid_component.js line:2763 rowNode', 'color: #007acc;', rowNode, col.colId, rowNode.data[col.colId]);
	// 						if (!rowNode['data'][col]?.hasOwnProperty('cellMerge') || rowNode.data[col]?.hasOwnProperty('rowspan') || rowNode.data[col].hasOwnProperty('colspan')) {
	// 							var newcell = {
	// 								colId: col,
	// 								rowId: this.gridApi.getDisplayedRowAtIndex(rowId)?.['id'],
	// 								rowIndex: rowId,
	// 								rowNode: rowNode
	// 							}
	// 							// console.log('%cgrid_component.js line:2126 newcell', 'color: #007acc;', newcell);
	// 							this.selectedCells.push(newcell)
	// 						}
	// 					}
	// 				})
	// 			})
	// 			console.log('this.selectedCells',this.selectedCells);
	// 			this.refreshCells('all')

	// 		}
	// 		if(event.type === 'mousemove'  && event.buttons == 1  ){
	// 			console.log('Mouse Move');
	// 			var focusedCell = this.gridApi.getFocusedCell()
	// 			if(focusedCell) {
	// 				console.log('Start focusedCell',focusedCell,"\n",this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex));
	// 				range.startRow['rowId'] = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.['id'];
	// 				range.startRow['rowIndex'] = focusedCell.rowIndex;
	// 				range.startRow['rowPinned'] = focusedCell.rowPinned;
	// 				range.startColumn = focusedCell.column
	// 				range.endRow = range.startRow
	// 			}
	// 			console.log('Record Cells',event, event.target)
	// 			var r = findAllByKey(event.target, 'parentNode', 'attributes?.["row-id"]?.value')
	// 			var c = findAllByKey(event.target, 'parentNode', 'attributes?.["aria-colindex"]?.value')
	// 			console.log("CC",c);
	// 			console.log('RR',r);
	// 			range.endRow = {
	// 				rowId: parseInt(r),
	// 				rowIndex: parseInt(findAllByKey(event.target, 'parentNode', 'attributes?.["row-index"]?.value')),
	// 				rowPinned: this.gridApi.getRowNode(r)?.rowPinned,
	// 			}
	// 			console.log('range.endRow ',range.endRow );
	// 			var columns :any = []
	// 			this.gridApi.getColumns()?.map((map: { [x: string]: any; })=> columns.push(map['colId']))
	// 				var ind = columns?.indexOf(range.startColumn['colId'])
	// 			range.columns = []
	// 			for (var i = 0, j = c > ind ? ind : c - 1; c > ind ? j < c : j <= ind && ind != -1; i++, j++) {
	// 					range.columns[i] = columns[j]
	// 			}
	// 			console.log('columns',columns);
	// 			console.log('range movew',range);
	// 			this.rangeSelectedCells = [range]
	// 			 // console.log('%cgrid_component.js line:117 this.rangeSelectedCells, range', 'color: #007acc;', this.rangeSelectedCells, range, this.selectedCells);
	// 			this.selectedCells = []
	// 			this.rangeSelectedCells.map((cell:any) => {
	// 				// console.log('%cgrid_component.js line:119 cell', 'color: #007acc;', cell);
	// 				cell.columns.map((col:any) => {
	// 					// console.log('%cgrid_component.js line:2121 col', 'color: #007acc;', col);
	// 					for (var i = 0; i <= Math.abs(cell.startRow.rowIndex - cell.endRow.rowIndex); i++) {
	// 						var rowId = (cell.startRow.rowIndex < cell.endRow.rowIndex ? cell.startRow.rowIndex : cell.endRow.rowIndex)+i;
	// 						// console.log('%cgrid_component.js line:2123 i', 'color: #007acc;', i, this.gridApi.getDisplayedRowAtIndex(rowId));
	// 						var rowNode :any= this.gridApi.getDisplayedRowAtIndex(rowId)
	// 						// console.log('%cgrid_component.js line:2763 rowNode', 'color: #007acc;', rowNode, col.colId, rowNode.data[col.colId]);
	// 						if (!rowNode['data'][col]?.hasOwnProperty('cellMerge') || rowNode.data[col]?.hasOwnProperty('rowspan') || rowNode.data[col].hasOwnProperty('colspan')) {
	// 							var newcell = {
	// 								colId: col,
	// 								rowId: this.gridApi.getDisplayedRowAtIndex(rowId)?.['id'],
	// 								rowIndex: rowId,
	// 								rowNode: rowNode
	// 							}
	// 							// console.log('%cgrid_component.js line:2126 newcell', 'color: #007acc;', newcell);
	// 							this.selectedCells.push(newcell)
	// 						}
	// 					}
	// 				})
	// 			})
	// 			console.log('this.selectedCells',this.selectedCells);
	// 			this.refreshCells('all')
	// 		}
	// 		if (event.type === 'mouseup') {
	// 			console.log('Mouse Up');
 	// 			if (this['rangeSelectedCells'].length){
	// 				this.selection = Array.from({ length: Math.abs(this.rangeSelectedCells[0].endRow.rowIndex - this.rangeSelectedCells[0].startRow.rowIndex) + 1 }, (a, i) => this.rangeSelectedCells[0].startRow.rowIndex + i).map((row:any) => {
	// 					 return this.rangeSelectedCells[0].columns.map((col:any) => {
	// 						 // console.log('this.gridApi.getDisplayedRowAtIndex(row)',this.gridApi.getDisplayedRowAtIndex(row))
	// 						 return this.gridApi.getDisplayedRowAtIndex(row)?.['data'][col] || ''
	// 					})
	// 				})
	// 			}
	// 			console.log('this.selection',this.selection)
	// 			console.log('this.selectedCells',this.selectedCells)
	// 			console.log('this.rangeSelectedCells',this.rangeSelectedCells);
	// 			console.log('End')
	// 		}
	// 	}
	// 	else if(event.type === 'mousedown' && event.buttons == 1 && targetElement && targetElement.classList.contains('ag-cell-value') && ((this?.selectedCells && this?.selectedCells.length) || (this?.selection && this?.selection.length) || (this?.rangeSelectedCells && this?.rangeSelectedCells.length))){
	// 		console.log('CLear');
	// 		this.selectedCells = []
	// 		this.selection = []
	// 		this.rangeSelectedCells = []
	// 		this.refreshCells('all')
	// 	}
	// }

	/****************************SELECTION************************************/

	// Custom Row/Column Selection
	selectCustom = (rows:any, columns:any) => {
		rows.map((rid:any) => {
			var rowNode :any = this.gridApi.getRowNode(rid)
			columns.map((cid:any) => {
				var newcell = {
					colId: cid,
					rowId: rid,
					rowIndex: rowNode.rowIndex,
					rowNode: rowNode
				}
				this.selectedCells.push(newcell)
			})
		})
	};

	selection: any = []
	selectedColumnGroups: any = []
	selectedColumn: any = []
	rangeSelectedCells: any = []
	selectedColId: any = ''
	colGroupSelect: any = ''

	// Clear Custom Selection
	deselectAll = (type:any) => {
		this.selectedCells = []
		this.selection = []
		// this.overlay.style.display = 'none'
		switch (type) {
			case 'range':
				this.selectedColumnGroups = {}
				this.selectedColumn = ''
				this.selectedColumns = []
				this.rangeSelectedCells = []
				break;
			case 'col':
				this.rangeSelectedCells = []
				this.selectedColumnGroups = {}
				break;
			case 'colGroup':
				this.selectedColumn = ''
				this.selectedColumns = []
				this.rangeSelectedCells = []
				break;
			default:
				this.rangeSelectedCells = []
				this.selectedColumn = ''
				this.selectedColumnGroups = {}
				this.selectedColumns = []
				break;
		}
		// this.selectedRows = []
		// this.gridApi.deselectAll();
		this.refreshCells('all')
	}


	// Select/Highlight Column if Tree Grid
	searchTree(element:any, matchingTitle:any):any {
		// console.log('%cgrid_component.js line:744 element', 'color: #007acc;', element, element.groupId, matchingTitle);
		if (element.groupId == matchingTitle) {
			return element;
		} else if (element.children != null) {
			var i;
			var result = null;
			for (i = 0; result == null && i < element.children.length; i++) {
				result = this.searchTree(element.children[i], matchingTitle);
			}
			return result;
		}
		return null;
	}

	// loop though a nested object and perform callback to the correct id
	treeOperations = (arr: any[], id: any, cb: any) => {
		// console.log('%cmain/gridComponent_config/src/app/ag-grid/ag-grid.component.ts:339 arr, arr.entries()', 'color: #007acc;', arr, arr.entries());
		for(let [index, key] of arr.entries()) {

			// Execute callback if id matches
			if(id == true) {
				cb(arr, index)
			}
			if (key?.colId == id) {
				cb(arr, index)
				return true;
			}
			// recursively traverse to child nodes till id is found
			if (key?.children) {
				const found = this.treeOperations(key.children, id, cb);
				if (found) return true;
			}
		}
		return
	};

	// Select/Highlight Column (ctrl to select/deselect multiple individual columns, shift to select range of columns)
	selectColumn = (colId:any, ctrl:any, shift:any) => {
		// console.log('%cgrid_component.js line:475 this.selectedColId', 'color: #007acc;', this.selectedColId, colId, ctrl, shift, this.gridApi.getAllDisplayedColumns());
		if(this.config().flags.selectionType?.column=='multiple') {
			if (ctrl) {
				// console.log('%cgrid_component.js line:78 colId', 'color: #007acc;', colId, this.selectedColumns.hasOwnProperty(colId));
				// console.log('this.selectedColumns',this.selectedColumns);
				if (this.selectedColumns.includes(colId))
					this.selectedColumns.splice(this.selectedColumns.indexOf(colId), 1)
				else
					this.selectedColumns.push(colId)
			}
			else if (shift) {
				var id1 = this.gridApi.getColumns()?.findIndex(col=>col.getColId() == colId) || -1
				var id2 = this.gridApi.getColumns()?.findIndex(col=>col.getColId() == this.selectedColId) || id1

				if(id2 < id1) {
					var t = id1
					id1 = id2
					id2 = t
				}

				var segment = this.gridApi.getColumns()?.slice(id1, id2+1);
				// console.log('%cmain/gridComponent_config/src/app/ag-grid/ag-grid.component.ts:486 segment', 'color: #007acc;', segment, colId, this.selectedColId, id1, id2);
				segment?.map(col=>this.selectedColumns.push(col.getColId()))
			}
			else
				this.selectedColumns = [colId]
		}
		else
			this.selectedColumns = [colId]
		this.selectedColId = colId//.toLowerCase()
		// this.selectedColumn = colId
	};
	// Selction for Multi-Column Header (ctrl to select/deselect multiple groups)
	selectColumnGroup = (colId:any, ctrl:any, shift:any) => {
		var colDefs = this.gridApi.getColumnDefs()

		var node = this.searchTree({ children: colDefs }, colId)
		var leaves = this.getLeafNodes([node], [])
		if (this.config().flags.selectionType.colGroup == 'multiple' && ctrl) {
			if (this.selectedColumnGroups.hasOwnProperty(colId))
				delete this.selectedColumnGroups[colId]
			else
				this.selectedColumnGroups[colId] = { node: node, data: leaves }
		}
		else
			this.selectedColumnGroups = { [colId]: { node: node, data: leaves } }
		this.selectedColumns = []
		Object.values(this.selectedColumnGroups).map((colg:any) => colg.data.map((col:any) => {
			if (!this.selectedColumns.includes(col.colId))
				this.selectedColumns.push(col.colId)
		}))
	}

	// Main Column/Row Selection Funtion
	selectColRow = (type:string, ev:any) => {
		console.log('selectColRow Params', type, ev, !this.config().flags.selectionType.column);
 		this.deselectAll(type)
		setTimeout(() => {
			switch (type) {
				case 'col':
					if (!this.config().flags.selectionType.column) return
					this.selectColumn(ev.target.offsetParent.attributes['col-id'].nodeValue, ev.ctrlKey, ev.shiftKey)

					this.gridApi.forEachNodeAfterFilter((node: any, index: any) => {
						this.selection[index] = []
						this.selectedColumns.map((col:any) => {
							this.selection[index].push(node.data && node?.data[col] ? node?.data[col] : '')
							this.selectedCells.push({
								colId: col,
								rowId: node.id,
								rowNode: node
							})
						})
					});
					var s =this.selectedCells[0].rowNode.data[this.selectedCells[0].colId]?.['style']
					this.style['font-size'] = s?.['font-size']?.split('px')[0] || 14
					this.style['background-color'] = s?.['background-color'] || '#ffffff'
					this.style['color'] = s?.['color'] || '#222222'
					this.style['halign'] = s?.['justify-content'] || 'Left'
					break;
				case 'colGroup':
					if (!this.config().flags.selectionType.colGroup) return
					this.selectColumnGroup(ev.target.offsetParent.attributes['col-id'].nodeValue.split('_')[0], ev.ctrlKey, ev.shiftKey)

					this.gridApi.forEachNodeAfterFilter((node: any, index: any) => {
						this.selection[index] = []
						this.selectedColumns.map((col:any) => {
							this.selection[index].push(node.data && node?.data[col] ? node?.data[col] : '')
							this.selectedCells.push({
								colId: col,
								rowId: node.id,
								rowNode: node
							})
						})
					});
					var s =this.selectedCells[0].rowNode.data[this.selectedCells[0].colId]?.['style']
					this.style['font-size'] = s?.['font-size']?.split('px')[0] || 14
					this.style['background-color'] = s?.['background-color'] || '#ffffff'
					this.style['color'] = s?.['color'] || '#222222'
					this.style['halign'] = s?.['justify-content'] || 'Left'
					break;
				case 'row':
					this.gridApi.getSelectedNodes().map((node: any, index: any) => {
						console.log('%cgrid_component.js line:965 node, index', 'color: #007acc;', node, index);
						this.selection[index] = []
						Object.keys(node.data).filter(col => node.data[col].hasOwnProperty('v'))?.map(col => {
							this.selection[index].push(node.data[col] ? node.data[col] : '')
							this.selectedCells.push({
								colId: col,
								rowId: node.id,
								rowNode: node
							})
						})
					})
					break;
				case 'custom':
					this.selectCustom(ev.rows, ev.columns)
					break;
				default:
					break;
			}
		})
		setTimeout(() => {this.refreshCells('all'); }, 1)
	}

	// Ag-Grid Column Configuration CellClass Callback
	cellRangeBorderTop = (params:any) => {
		var style = false
		if(this.rangeSelectedCells) this.rangeSelectedCells.map((range:any) => {
			var { startRow, endRow, columns } = range
			var style_row = !!(((startRow.rowIndex == params.rowIndex && startRow.rowIndex <= endRow.rowIndex) || (endRow.rowIndex == params.rowIndex && startRow.rowIndex >= endRow.rowIndex)) && (columns.find((col:any) => col == params.colDef.field)))
			style = style || style_row
			// console.log('%cag-grid.component.ts line:571 style', 'color: #007acc;', style, params, startRow.rowIndex, params.rowIndex, endRow.rowIndex);
		})
		return style
	}

	// Ag-Grid Column Configuration CellClass Callback
	cellRangeBorderBottom =  (params:any) => {
		var style = false
		if(this.rangeSelectedCells) this.rangeSelectedCells.map((range :any) => {
			var { startRow, endRow, columns } = range
			var style_row = !!(
				(
					(
						(startRow.rowIndex == params.rowIndex && startRow.rowIndex >= endRow.rowIndex)
						||
						(endRow.rowIndex == params.rowIndex && startRow.rowIndex <= endRow.rowIndex)
					)
					&&
					(
						columns.find((col:any) => col == params.colDef.field)
					)
				)
				||
				(
					params.node.data?.cellMerge?.hasOwnProperty(params.colDef.field)&&
					(
						columns.find((col:any) => col == params.colDef.field)
					)
				)
			)
			style = style || style_row
		})
		return style
	}

	// Ag-Grid Column Configuration CellClass Callback
	cellRangeBorderLeft = (params : any) => {
		var style = false
		if(this.rangeSelectedCells) this.rangeSelectedCells.map((range :any) => {
			var { startRow, endRow, columns } = range
			var style_row = !!(columns.length && columns[0] == params.colDef.field && ((startRow.rowIndex <= params.rowIndex && endRow.rowIndex >= params.rowIndex && startRow.rowIndex <= endRow.rowIndex) || (startRow.rowIndex >= params.rowIndex && endRow.rowIndex <= params.rowIndex && startRow.rowIndex >= endRow.rowIndex)))
			style = style || style_row
		})
		return style
	}

	// Ag-Grid Column Configuration CellClass Callback
	cellRangeBorderRight = (params : any) => {
		var style = false
		if(this.rangeSelectedCells) this.rangeSelectedCells.map((range :any) => {
			var { startRow, endRow, columns } = range
			var style_row = !!(
				(columns.length && columns.at(-1) == params.colDef.field)
				&&
				(
					(startRow.rowIndex <= params.rowIndex 	&&		endRow.rowIndex >= params.rowIndex 	&& 		startRow.rowIndex <= endRow.rowIndex)
					||
					(startRow.rowIndex >= params.rowIndex 	&& 		endRow.rowIndex <= params.rowIndex 	&& 		startRow.rowIndex >= endRow.rowIndex)
				)
				||
				(
					params.node.data?.cellMerge?.hasOwnProperty(params.colDef.field)&&
					(
						columns.find((col:any) => col == params.colDef.field)
					)
				)
			)
			style = style || style_row
		})
		return style
	}
	/************************************************************************************/

	/****************************************TOOLBAR*************************************/
	// Toolbar tabs
	toolbarList = [
		// 'Insert',
		'View',
		'Clipboard',
		'Font Operations',
		'Alignment',
		'Filter',
	]
	currentTab = this.toolbarList[1]

	// Font Operations subtabs
	style = {
		zoom: 100,
		zoomOptions: [50, 75, 90, 100, 125, 150, 200],
		'font-size': 14,
		fontSizeOptions: [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72],
		fontSize: {
			list: [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72],
			selectedItems: 14,
			selectionType: 'single',
			cb: (item: any) => {
				console.log('%csrc/app/ag-grid/ag-grid.component.ts:787 item', 'color: #007acc;', item);
				this.fontOperations('size', item, '$event')
			},
			increment: true,
			role: 'font',
		},
		'background-color': '#ffffff',
		color: '#222222',
		halign: 'Left',
		valign: 'Start',
		colors: ['black', 'red', 'yellow', 'blue', 'green', 'white', 'darkred', 'goldenrod', 'lightBlue', 'lightGreen'],
	}
	// function to dynamically initialize nested objects (array of nested properties, value to initialize)
	cellUpdate = (props: any[], val = {}) => {
		// console.log('%cgrid_component.js line:708 props, val', 'color: #007acc;', props, val, props.length, props[0].hasOwnProperty(props[1]), props[0], props[1], props[0]?.[props[1]]);
		if (props.length == 1)
			Object.assign(props[0], val)
		else {
			if (!props[0].hasOwnProperty(props[1]))
				props[0][props[1]] = {}
			// console.log('%cgrid_component.js line:714 props, props[0]', 'color: #007acc;', props, props[0]);
			props[0] = props[0][props[1]]
			props.splice(1, 1)
			this.cellUpdate(props, val)
		}
	}

	LargestElement = (arr: any) => arr.length ? arr.reduce((a: any, b: any) => (a > b) ? a : b) : false

	getRowHeight = (params: any) => {
		console.log('%cag-grid.component.ts line:238 params', 'color: #007acc;', params,  params.node.rowHeight);
		if(params.data?.style) {
			var l = this.LargestElement(Object.values(params.data?.style).map((s: any)=>s['font-size']))
			console.log('%cgrid_component.js line:1929 l', 'color: #007acc;', params.data, l, parseInt(l));
			return parseInt(l) > 22 ? parseInt(l) + 28 : undefined
		}
		else return params.node.rowHeight || 40
	}

	// add style property to data to change css of cells
	fontOperations = (prop: any, value: any, e: any, cells: any = this.selectedCells) => {
		// e.stopPropagation()
		// console.log('%cgrid_component.js line:2626 prop, value', 'color: #007acc;', prop, value, e, this.currentTab, this.selectedCells);
		cells.map((cell: any)=>{
			// var cell = {
			// 	colId: '1',
			// 	rowId: 1,
			// 	rowNode: this.gridApi.getRowNode('1')
			// }
			this.cellUpdate([cell.rowNode?.data, 'style', cell.colId], cell.rowNode?.data?.['style']?.[cell.colId])
			var style = cell.rowNode?.data['style'][cell.colId] //: any = {} // = cell?.rowNode?.data.hasOwnProperty('style') ? cell?.rowNode?.data['style'] : {}
			// console.log('%cgrid_component.js line:2629 cell.rowNode.data', 'color: #007acc;', cell.rowNode?.data, cell.colId, style);
			switch (prop) {
				case 'toolbar':
					this.currentTab = value
					break;
				case 'bold':
					style['font-weight'] = style?.['font-weight'] == 800 ? 400 : 800
					break;
				case 'italic':
					style['font-style'] = style?.['font-style'] == 'italic' ? '' : 'italic'
					break;
				case 'underline':
					style['text-decoration'] = style?.['text-decoration']?.includes('underline') ? style?.['text-decoration'].replace('underline', '').replaceAll(' ', '') : (style?.['text-decoration'] || '') + ' underline'
					break;
				case 'strikethrough':
					style['text-decoration'] = style?.['text-decoration']?.includes('line-through') ? style?.['text-decoration'].replace('line-through', '').replaceAll(' ', '') : (style?.['text-decoration'] || '') + ' line-through'
					break;
				case 'size':
					style['font-size'] = value + 'px'
					this.gridApi.resetRowHeights()
					break;
				case 'background-color':
					style['background-color'] = value
					this.popup = false
					console.log('%cgrid_component.js line:3754 this.style.colors.includes(value)', 'color: #007acc;', this.style.colors.includes(value), this.popup);
					break;
				case 'color':
					style['color'] = value
					this.popup = false
					console.log('%cgrid_component.js line:3759 this.style.colors.includes(value)', 'color: #007acc;', this.style.colors.includes(value), this.popup);
					break;
				case 'halign':
					this.style['halign'] = value
					style['justify-content'] = value
					style['display'] = 'flex'
					break;
				case 'valign':
					this.style['valign'] = value
					style['align-items'] = value
					style['display'] = 'flex'
					break;
				case 'clear':
					delete cell.rowNode?.data?.style[cell.colId]
					this.gridApi.redrawRows()
					return

			}
		})
		this.refreshCells('all')
	}

	popup: string | false = false


	/*******************************************************************************/





	// Function to refresh cells (list of rows/cols, row/col/all)
	refreshCells = (type: string, idList: any[] = []) => {
		var params: any = {
			force: true,
		}
		if (type == 'all')
			params['columns'] = this.gridApi.getAllDisplayedColumns().map((col: any) => col.colId)
		else if (type == 'row')
			params['rowNode'] = idList
		else
			params['columns'] = idList
		this.gridApi.refreshCells(params);
	}
	// Add css to certain cells based on conditions
	cellStyle = (params: any) => {
		// console.log('%csrc/app/ag-grid/ag-grid.component.ts:867 params', 'color: #007acc;', params);
		var style = {}
		var id = params.colDef.field
		if(params.data?.['cellMerge']?.[id]) {
			Object.assign(style, { 'background-color': 'white' })
		}
		if (!(style as any)['background-color'])
			Object.assign(style, { 'background-color': '' })
		if (!(style as any)['color'])
			Object.assign(style, { 'color': '' })
		if (params.data?.style?.[id]) {
			Object.assign(style, params.data.style[id])
		}
		// if (this.selectedCells?.find((cell:any) => params.column.colId == cell.colId && params.node.id == cell.rowId) && !this.rangeSelectedCells.length) {
		// 	Object.assign(style, { 'background-color': '#F4F3FF', 'color': '#6938EF' })
		// }
		if((this.focusedCell?.rowIndex==params.rowIndex || this.selectedRowIndex==params.rowIndex)){
			// console.log('%csrc/app/ag-grid/ag-grid.component.ts:689 this.config().flags.selectedRowStyle', 'color: #007acc;', this.selectedRowIndex, this.config().flags.selectedRowStyle);
			Object.assign(style, this.config().flags?.selectedRowStyle
			// || {
			// 	background: '#F0F9FF',
			// 	border: '1px solid #0384FC',
			// 	color: '#0384FC'
			// }
		)
		}
		else {
			// Object.assign(style, {
			// 	background: '#F0F9FF',
			// 	border: '1px solid #0384FC',
			// 	color: '#0384FC'
			// })
		}
		if(params.data.style?.hasOwnProperty('rowHover'))
			Object.assign(style, params.data.style['rowHover'])
		if(params.data.style?.hasOwnProperty('rowSpan'))
			Object.assign(style, {
				'height': '63px',
                'background-color': 'white',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'cursor': 'pointer'
			})

		return style
	}

	selectionFilter: any;
	selectedColumns: any;
	selectedCells: any;
	colcod: any;
	col: any;

	/****************************** Custom context menu******************************/

	contextMenuOpen = false
	contextMenuItems = [
		{
			text: 'Copy',
			icon: 'copy',
			callback: ()=>this.clipboardOperations('copy'),
		},
		{
			text: 'Cut',
			icon: 'cut',
			callback: ()=>this.clipboardOperations('cut'),
		},
		{
			text: 'Paste',
			icon: 'paste',
			callback: ()=>this.clipboardOperations('paste'),
		},
		{
			text: 'Delete',
			icon: 'delete',
			callback: ()=>this.mainEdit('DeleteCells'),
		},
	]
	userClipboard: any = {
		cut: false,
		cells: [],
		selections: [],
		text: ''
	}
	clipboardOperations = async(type:string, col?:string,colId?:any) => {
		console.log('colId',colId);

		console.log('this selection',this.selection);
		switch (type) {
			case 'cut':
				this.userClipboard.cut = true
				this.userClipboard.cells = this.selectedCells
				this.userClipboard.selections = this.selection
				this.userClipboard.text = this.factory.copy2DToClipboard(this.selection[0][0].hasOwnProperty(this.config().flags.displayKey)?this.selection.map((row: any)=>row.map((cell: any)=>cell[this.config().flags.displayKey])):this.selection)
				break;
			case 'copy':
				this.userClipboard.cut = false
				this.userClipboard.cells = this.selectedCells
				this.userClipboard.selections = this.selection
				this.userClipboard.text = this.factory.copy2DToClipboard(this.selection[0][0].hasOwnProperty(this.config().flags.displayKey)?this.selection.map((row: any)=>row.map((cell: any)=>cell[this.config().flags.displayKey])):this.selection)
				break;
			case 'paste':
				var cbtxt: any = []
				var text = await navigator.clipboard?.readText() || this.userClipboard.text
 				text.split('\n').map((row: any) => {
 					cbtxt = [...cbtxt,...[row.split('\t')]]
				});
				console.log('cbtxt', cbtxt, this.selectedCells);
				console.log('this.rangeSelectedCells.length && cbtxt.length == 1 && cbtxt[0].length == 1', cbtxt.length == 1 && cbtxt[0].length == 1);
				if (this.rangeSelectedCells.length && cbtxt.length == 1 && cbtxt[0].length == 1) {
					this.selectedCells.map((cell: any) => {
						if (cell.rowNode.data.hasOwnProperty(cell.colId))
							if (this.config().flags.displayKey)
								cell.rowNode.data[cell.colId][this.config().flags.displayKey] = cbtxt[0][0]
							else
								cell.rowNode.data[cell.colId] = cbtxt[0][0]
							this.cellUpdate([cell.rowNode.data, cell.colId], cbtxt[0][0])
					})
				}
				else {
					this.rangeSelectedCells = [
						{
							startRow: {
								rowId: parseInt(this.selectedCells[0].rowId),
								rowIndex: parseInt(this.selectedCells[0]?.rowNode?.rowIndex)
							},

							endRow: {
								rowId: this.gridApi?.getDisplayedRowAtIndex(this.gridApi?.getRowNode(this.selectedCells[0]?.rowId)?.rowIndex + cbtxt.length - 1)?.id,
								rowIndex: this.gridApi.getRowNode(this.selectedCells[0].rowId)?.rowIndex + cbtxt.length - 1
							},

							startColumn: this.gridApi.getAllDisplayedColumns().find((c:any) => this.selectedCells[0].colId == c.colId),

							columns: [...this.gridApi.getAllDisplayedColumns()].splice(this.gridApi.getAllDisplayedColumns().findIndex((c:any) => this.selectedCells[0].colId == c.colId), cbtxt[0].length)
						}
					]
					console.log('this.rangeSelectedCells',this.rangeSelectedCells);
					this.selectedCells = []
					this.rangeSelectedCells.map((cell:any) => {
						console.log('grid_component.js line:119 cell', cell);
						console.log('(cell.endRow[cell.endRow.rowIndex] - cell.startRow.rowIndex + 1',cell.endRow.rowIndex - cell.startRow.rowIndex + 1);
						Array.from({ length: (cell.endRow.rowIndex - cell.startRow.rowIndex + 1) }, (value, index) => cell.startRow.rowIndex + index).map((rid, ind) => {
							console.log('cellcellcellcell',cell);
							cell.columns.map((col:any, j:any) => {
								var rowNode:any = this.gridApi.getDisplayedRowAtIndex(rid)
								var newcell = {
									colId: col.colId,
									rowId: rowNode.id,
									rowIndex: rid,
									rowNode: rowNode
								}
								console.log('newcellnewcellnewcellnewcellnewcell',newcell);
								if (type == 'paste')
									if(this.config().flags.displayKey)
										newcell.rowNode.data[newcell.colId][this.config().flags.displayKey] = cbtxt[ind][j]
									else
										newcell.rowNode.data[newcell.colId] = cbtxt[ind][j]
								this.selectedCells.push(newcell)
 							})
						})
					})
				}

				if (this.userClipboard.cut) {
					this.userClipboard.cells.map((cell:any) => {
 						if (!cell.rowNode.data.hasOwnProperty(cell.colId))
							cell.rowNode.data[cell.colId] = ''
						cell.rowNode.data[cell.colId] = ''
					})
					this.userClipboard.cut = false
				}
				this.gridApi.redrawRows()
				break;

			case 'delete':
				this.selectedCells.map((cell:any) =>{
					if (cell.rowNode.data.hasOwnProperty(cell.colId))
							cell.rowNode.data[cell.colId] = ''
				})
				this.selectedCells = []
				this.selection = []
				this.rangeSelectedCells = []
				this.gridApi.redrawRows()
				break;

			default:
				break;
		}
		// $("#contextMenu")[0].style.display = "none"
		// $("#agContextMenu_bg")[0].style.display = "none"


	}

	ts = 0
	@HostListener('click', ['$event'])
		togglePopup(e: any, type: any){
			// console.log('%cHello ag-grid.component.ts line:382 ', 'background: green; color: white; display: block;', this.ts, e.timeStamp, this.popup, type, this.ts !== e.timeStamp);
			if(this.ts !== e.timeStamp) {
				if(this.popup == type)
					this.popup = false
				else
					this.popup = type
			}
			this.ts = e.timeStamp
		}
	@HostListener('keydown', ['$event'])
		keyOperations(e: any) {
			if (e.ctrlKey) {
				if (document.querySelector('.ag-body-viewport')?.classList.contains('ag-selectable'))
					document.querySelector('.ag-body-viewport')?.classList.add('ag-selectable')
				if (e.key == 'c')
					this.clipboardOperations('copy')
				if (e.key == 'x')
					this.clipboardOperations('cut')
				// if (e.key == 'V' && e.shiftKey)
				// 	this.clipboardOperations('format')
				else if (e.key == 'v')
					this.clipboardOperations('paste')
				if (e.key == 'm') {
					this.mergeCells()
				}
				if (e.key == 's') {
					this.splitCells()
				}
			}
			if (e.shiftKey) {
				if (document.querySelector('.ag-body-viewport')?.classList.contains('ag-selectable'))
					document.querySelector('.ag-body-viewport')?.classList.add('ag-selectable')
			}
			if (e.key == 'Delete') {
				// this.delRows(this.agconfig.selectedRows)
				this.mainEdit('Delete')
			}
			if (e.key == 'Escape') {
				this.deselectAll('all')
			}

		}

	mouseCoords: any
	rightClick(e: any) {
		e.preventDefault();
		this.togglePopup(e, 'contextMenu')

		var contextMenu = document.querySelector('#contextMenu')

		this.mouseCoords = {
			'left': ((e?.clientX + contextMenu?.clientWidth < document.body?.clientWidth) ? e.clientX : (e?.clientX - (contextMenu?.clientWidth as any))) + "px",
			'top': ((e?.clientY + contextMenu?.clientHeight < document.body?.clientHeight) ? e.clientY : (e?.clientY - (contextMenu?.clientHeight as any))) + "px",
		}
	}
	/*********************************************************************/



	/****************************************************************/

	// function to search in array of nested objects (array to search, property value to match, property name)
	recursiveFindById(arrayData: any[], id: any, idName: any) {
		let foundData = arrayData.find((e: any) => e[idName] == id);
		console.log('%cag-grid.component.ts line:261 foundData', 'color: #007acc;', foundData, arrayData, id);

		if (foundData) {
			return foundData;
		}

		arrayData.every((e: any) => {
			if (e.children)
				foundData = this.recursiveFindById(e.children, id, idName);
			if (foundData) {
				return false;
			}
			return true;
		});
		return foundData;
	}
	// Added to every element in this.columnDefs
	defaultColDef: any = {
		// minWidth: 150,
		resizable: false,
		sortable: false,
		suppressSizeToFit: true,
		suppressMovable: true,
		suppressMenu: true,
		// filter: true,
		// filter: PartialMatchFilter,
		// floatingFilterComponent: NumberFloatingFilterComponent,
		floatingFilter: true,
		cellStyle: this.cellStyle,
		cellClass : (params : any) =>{
			// console.log('%cag-grid.component.ts line:1059 params', 'color: #007acc;', params);
			var cls = ''
			if(params){
				var cls = ''
				if(this.cellRangeBorderTop(params)) cls+='cell-range-top '
				if(this.cellRangeBorderRight(params)) cls+='cell-range-right '
				if(this.cellRangeBorderBottom(params)) cls+='cell-range-bottom '
				if(this.cellRangeBorderLeft(params))  cls+='cell-range-left '
				return cls
			}
 			else {
				return 'null'
			};
		},
		rowSpan: (params:any) => {
			// console.log('%cag-grid.component.ts line:950 rowSpan', 'color: #007acc;', params, params.column.colId);
			if(params.data.cellMerge?.[params.column.colId]) {
				// console.log('%cag-grid.component.ts line:952 vv', 'color: #007acc;', params.data.cellMerge[params.column.colId].rowSpan);
				return params.data.cellMerge[params.column.colId].rowSpan
			}
			// if(params.data.rowSpan[params.column.colId]) {
			// 	return params.data.rowSpan
			// }
			return 1
		},
		colSpan: (params:any) => {
			// console.log('%cag-grid.component.ts line:950 colSpan', 'color: #007acc;', params, params.data.cellMerge?.colId==params.column.colId, params.data.cellMerge?.colId, params.column.colId);
			if(params.data.cellMerge?.[params.column.colId]) {
				// console.log('%cag-grid.component.ts line:960 vv', 'color: #007acc;', params.data.cellMerge[params.column.colId].colSpan);
				return params.data.cellMerge[params.column.colId].colSpan
			}
			return 1
		},
		tooltipValueGetter: (params: any) => params.value?.v || params.value,
		getQuickFilterText: (params: any) => params.data[params.column.colId][this.config().flags.displayKey] || params.value,
		cellEditorSelector: (params: any) => {
			return {
				component: cellEditor,
				params: 'sadfasd'
			}
		},
		// headerComponentParams: {
		// 	template:
		// 		`
		// 		<div ref="eLabel" class="ag-header-cell-label" style="display: flex" onclick="window.ng.getComponent(document.getElementsByTagName('app-ag-grid')[0]).selectColRow('col',event)" >
		// 			<span ref="eText" class="ag-header-cell-text" style="flex-grow: 1"></span>
		// 			<i class="feather icon-plus" style="cursor: pointer;float: right" onclick="window.ng.getComponent(document.getElementsByTagName('app-ag-grid')[0]).addColumn(this); event.stopPropagation()"></i>
		// 			<!--i class="fa fa-eye-slash" aria-hidden="true" onclick="window.ng.getComponent(document.getElementsByTagName('app-ag-grid')[0]).hideColumn(this, false); event.stopPropagation()"></i>
		// 			<i class="fa fa-trash" aria-hidden="true" onclick="window.ng.getComponent(document.getElementsByTagName('app-ag-grid')[0]).deleteColumn(this, this); event.stopPropagation()"></i-->
		// 		</div>
		// 	`
		// },
		headerComponent: CustomHeaderGroup
	}

	gridOptionsProps: any // = {
	// 	rowHeight: 20,
	// 	headerHeight: 60,
	// 	defaultColDef: this.defaultColDef,
	// 	enableSorting: false,
	// 	rowSelection: 'multiple',
	// 	// suppressRowTransform: true,
	// 	suppressMenuHide: true,
	// 	suppressRowClickSelection: true,
	// 	suppressCellFocus: true,
	// 	enableCellTextSelection: true,
	// }

	// Flags for standard columns
	flags: any/*  = {
		tree: 'border',
	} */

	onGridReady(event: GridReadyEvent<any,any>) {
		this.gridApi = event.api
		// this.initGrid()
		console.log('%cag-grid.component.ts line:191 event', 'color: #007acc;', event, this.gridApi.getAllDisplayedColumns(), this.gridOptions);
		try {
			this.initGrid()
		} catch(e) {}
		// setTimeout(() => {
		// 	this.gridApi.sizeColumnsToFit();
		// }, 1000);

		// this.initGrid()
	}
	getLeafNodes = (arr: any[], leafArr: any) => {
		// console.log('%cag-grid.component.ts line:1109 arr, leafArr', 'color: #007acc;', arr, leafArr);
		arr.map((a: any)=>{
			if(a.hasOwnProperty('children'))
				return this.getLeafNodes(a.children, leafArr)
			else
				leafArr.push(a)
		})
		return leafArr
	};
	// Call this function to edit the row and columns defs (might remove)
	updateGrid = (rowData: any, columnDefs: any, options: any, defaultColDef: any) => {
		this.config().rowData = rowData
		this.config().columnDefs = columnDefs
		// console.log('%cag-grid.component.ts line:36 rowData, columnDefs', 'color: #007acc;', rowData, columnDefs, this.config().rowData, this.config().columnDefs, this.userColumnDefs);
		// Object.assign(this.defaultColDef, defaultColDef)
		// this.gridOptionsProps = options
		// Object.assign(this.gridOptionsProps, options)
		console.log('%cag-grid.component.ts line:733 gridApi', 'color: #007acc;', this.gridApi, this.gridApi.getAllDisplayedColumns());
		if(!this.gridApi){
			setTimeout(() => {
				this.updateGrid(rowData, columnDefs, options, defaultColDef)
			}, 1000);
		}
		else {
			this.initGrid()
		}
		// var int = setInterval(() => {
		// 	console.log('%cag-grid.component.ts line:733 gridApi', 'color: #007acc;', this.gridApi);
		// 	if(!this.gridApi)
		// 	return this.updateGrid(rowData, columnDefs, options, defaultColDef)
		// 	else {
		// 		clearInterval(int)
		// 		return this.initGrid(rowData, columnDefs, options, defaultColDef)
		// 	}
		// }, 100);

		// this.gridApi.updateGridOptions(options)
		// console.log('%cag-grid.component.ts line:287 options, gridOptions, this.rowData', 'color: #007acc;', options, this.gridOptions, this.rowData);
		return rowData
	}
	// function to add standard columns to grid
	initGrid = () => {

		// this.config().rowData = rowData
		// this.config().columnDefs = columnDefs

		Object.assign(this.defaultColDef, this.config().defaultColDef)

		// (this.columnDefs[0] as any)['headerGroupComponent'] = CustomHeaderGroup,

		// setTimeout(() => {
			this.userColumnDefs = this.getLeafNodes(this.config().columnDefs, [])
			// this.userColumnDefs = this.gridApi.getAllDisplayedColumns()
			// var colDefs = this.gridApi.getColumnDef('1')
			var { selectionType, tree, treeColumn, headerFoldAll, slno, checkSelect, addRow, deleteRow, customContextMenu, idField, filter, selectedRowIndex, sizeColumnsToFit, id, hideHeader, proceed } = this.config().flags
			console.log('%cHello ag-grid.component.ts line:211 ', 'background: green; color: white; display: block;', this.config().flags, this.config().columnDefs, this.config().rowData, this.config().columnDefs[1]);

			this.selectedRowIndex = selectedRowIndex

			if(selectionType) {
				if(selectionType?.column || selectionType?.colGroup)
					this.treeOperations(this.config().columnDefs, true, (arr: any, index: any)=>{
						// console.log('%cag-grid.component.ts line:1037 arr, index', 'color: #007acc;', arr, index, arr[index]);
						arr[index]['headerGroupComponent'] = CustomHeaderGroup
					})
			}

			if(tree) {
				var col = this.recursiveFindById(this.config().columnDefs, treeColumn, 'field') || this.recursiveFindById(this.config().columnDefs, this.userColumnDefs[0].field, 'field')
				console.log('%cag-grid.component.ts line:290 col', 'color: #007acc;', col);

				if(tree == 'default'){
					col['cellRenderer'] = TreeArrowRenderer
					// col['headerComponent'] = FoldAllTreeHeader
				}
				else if(tree == 'right'){
					col['cellRenderer'] = TreeArrowRightRenderer
					// col['headerComponent'] = FoldAllTreeHeader
				}
				else if(tree == 'border') {
					Object.assign(col, {
						// cellStyle: (params: any) => {
						// 	return {
						// 		padding: 0
						// 	}
						// },
						cellRenderer: TreeArrowRendererBorder,
						// headerComponent: FoldAllTreeHeader,
						// rowHeight: this.config().gridOptions.rowHeight || 32,
					})
					// this.columnDefs.unshift({
					// 	field: 'treearrow',
					// 	maxWidth: options.rowHeight || 40,
					// 	// maxWidth: this.gridOptionsProps.rowHeight || 40,
					// 	suppressMenu: true,
					// 	filter: '',
					// 	cellStyle: (params: any): any => {
					// 		if(params.data.hasOwnProperty('expanded')&&params.data.level==0)
					// 			return {
					// 				'text-align': 'center',
					// 				'border-right': '1px solid #dddddd',
					// 				padding: 0,
					// 				cursor: 'pointer'
					// 			}
					// 		return {'border-right': '1px solid #dddddd'}
					// 	},
					// 	cellRenderer: (params: any) => {
					// 		// console.log('%cag-grid.component.ts line:699 params.data.expanded', 'color: #007acc;', params.data, params.data.hasOwnProperty('expanded'));
					// 		if(params.data.hasOwnProperty('expanded')&&!params.data.level)
					// 		return params.data.expanded ? `<i class="fa fa-minus"></i>` : `<i class="fa fa-plus"></i>`
					// 		return
					// 	},
					// 	onCellClicked: (params: { data: { hasOwnProperty: (arg0: string) => any; expanded: boolean; }; })=>{
					// 		if(!params.data.hasOwnProperty('expanded')) return
					// 		// console.log('%cgrid_component.js line:387 params', 'color: #007acc;', params.data.expanded);
					// 		params.data.expanded = !params.data.expanded
					// 		this.gridApi.onFilterChanged()
					// 		this.refreshCells(['treearrow'], 'col')
					// 	},
					// 	headerComponent: FoldAllTreeHeader,
					// 	// headerComponentParams: {
					// 	// 	template: `<i class="fa fa-external-link-alt"></i>`,
					// 	// 	menuIcon: 'fa-external-link-alt',
					// 	// },
					// })
				}
				if(headerFoldAll) {
					col['headerComponent'] = FoldAllTreeHeader
				}
			}

		// Conditionally adding the Add-Row column definition based on config
		if (addRow && !this.config().columnDefs.find(col => col.field == 'addRow')) {
			this.config().columnDefs.unshift({
				field: 'addRow',
				colId: 'addRow',
				headerName: 'Add',
				maxWidth: 80,
				suppressSizeToFit: true,
				cellRenderer: (params: any) => '<mat-icon style="display: flex" class="material-icons">add</mat-icon>',
				onCellClicked: (params: any) => {
					if(tree) {
						var data
						if(params.data.expanded == undefined)
							data = {
								level: params.data.level,
								parentId: params.data.parentId
							}
						else
							data = {
								level: params.data.level + 1,
								parentId: params.node.id
							}
					}
					this.insertRow(params.rowIndex+1, data || {});
				},
				cellStyle: (params: any) => {
					return {
						'display': 'flex',
						'align-items': 'center',
						'justify-content': 'center',
						'cursor': 'pointer'
					}
				},
				tooltipValueGetter: (params: any) => 'Add',
				filter: false
			});
		}
		// Conditionally adding the checkbox column definition based on config
		if (checkSelect && !this.config().columnDefs.find(col => col.field == 'check')) {
			this.config().columnDefs.unshift({
				field: 'check',
				colId: 'check',
				headerName: ``,
				headerCheckboxSelection: true,
				checkboxSelection: true,
				maxWidth: 48,
				filter: false
			});
		}
		// Conditionally adding the slno column definition based on config
		if (slno) {
			this.config().columnDefs.unshift({
				field: 'slno',
				colId: 'slno',
				headerName: "Sl No",
				pinned: 'left',
				maxWidth: 80,
				// filter: false,
				valueGetter: (params: any) => typeof slno != 'boolean' ? params.node.data[slno] : params.node.rowIndex + 1,
				cellStyle: (params: any) => {
					return {
						'display': 'flex',
						'align-items': 'center',
						'justify-content': 'center',
						'cursor': 'pointer'
					}
				},
			});
		}
		// Conditionally adding the Delete-Row column definition based on config
		if (deleteRow && !this.config().columnDefs.find(col => col.field == 'deleteRow')) {
			this.config().columnDefs.push({
				field: 'deleteRow',
				colId: 'deleteRow',
				headerName: 'Delete',
				maxWidth: 80,
				filter: false,
				floatingFilter: false,
				pinned: 'right',
				cellRenderer: (params: any) => {
					if(params.data.level)
						return '<i class="fa fa-trash"></i>';
					return
				},
				onCellClicked: (params: any) => {
					// Call a function to delete the selected row
					// if(params.data.level)
					if(this.config().flags.deleteRow(params.data))
						this.deleteRows([params.data]);
				},
				cellStyle: (params: any) => {
					return {
						'color': 'red',
						'justify-content': 'center',
						'display': 'flex',
						'align-items': 'center',
						'cursor': 'pointer'
					}
				},
				tooltipValueGetter: (params: any) => 'Delete',
			});
		}
		// Conditionally adding the Router column definition based on config
		if (proceed && !this.config().columnDefs.find(col => col.field == proceed.field)) {
			// if(!proceed.clicked) proceed.clicked = (params: any) => this.router.navigate([proceed.path], { state: proceed.data || params.data }),
			this.config().columnDefs.push({
				field: proceed.field,
				headerName: proceed.name || proceed.field,
				maxWidth: 80,
				filter: false,
				cellRenderer: proceed.icon,
				onCellClicked: proceed.clicked,
				cellStyle: (params: any) => {
					return {
					  'height': 32 *  params.value?.rowSpan - 1 + 'px',
					  'background-color': 'white',
					  'display': 'flex',
					  'align-items': 'center',
					  'justify-content': 'center',
					  'cursor': 'pointer'
					}
				},
				rowSpan: (params:any) => params.node.data[proceed.field]?.rowSpan,
				tooltipValueGetter: (params: any) => proceed.name,
			});
		}
		if(customContextMenu) {
			var cm = [
				{
					text: 'Copy',
					value: 'copy',
					iconBefore: '<i class="fa fa-copy"></i>',
					callback: (item: any)=>this.clipboardOperations(item),
				},
				{
					text: 'Cut',
					value: 'cut',
					iconBefore: '<i class="fa fa-cut"></i>',
					callback: (item: any)=>this.clipboardOperations(item),
				},
				{
					text: 'Paste',
					value: 'paste',
					iconBefore: '<i class="fa fa-paste"></i>',
					callback: (item: any)=>this.clipboardOperations(item),
				},
				{
					text: 'Delete',
					value: 'DeleteCells',
					iconBefore: '<i class="fa fa-trash" style="color: red"></i>',
					callback: (item: any)=>this.mainEdit(item),
				}
			]
			this.factory.addContextMenu({list: cm}, id)
			// this.factory.contextMenus[id] = [
			// 	{
			// 		text: 'Copy',
			// 		iconBefore: '<i class="fa fa-copy"></i>',
			// 		callback: ()=>this.clipboardOperations('copy'),
			// 	},
			// 	{
			// 		text: 'Cut',
			// 		iconBefore: '<i class="fa fa-cut"></i>',
			// 		callback: ()=>this.clipboardOperations('cut'),
			// 	},
			// 	{
			// 		text: 'Paste',
			// 		iconBefore: '<i class="fa fa-paste"></i>',
			// 		callback: ()=>this.clipboardOperations('paste'),
			// 	},
			// 	{
			// 		text: 'Delete',
			// 		iconBefore: '<i class="fa fa-trash" style="color: red"></i>',
			// 		callback: ()=>this.mainEdit('DeleteCells'),
			// 	}
			// ]
			console.log('%cmain/gridComponent/src/app/ag-grid/ag-grid.component.ts:88 factory', 'color: #007acc;', this.factory);
		}

		if(idField || tree) {
			console.log('%cHello src/app/ag-grid/ag-grid.component.ts:1521 ', 'background: green; color: white; display: block;');
			this.gridOptions.getRowId = (params: any) => params.data.id || params.data[idField] || params.rowIndex
		}

		if(filter == 'custom') {
			this.defaultColDef['filter'] = PartialMatchFilter
			this.defaultColDef['floatingFilterComponent'] = NumberFloatingFilterComponent
			this.defaultColDef['floatingFilter'] = true
		}
		else if(filter == 'object') {
			this.defaultColDef['filter'] = true
			this.defaultColDef['floatingFilterComponent'] = NumberFloatingFilterComponent
			this.defaultColDef['floatingFilter'] = true
		}
		else if(filter) {
			this.defaultColDef['filter'] = true
			this.defaultColDef['floatingFilter'] = true
			this.defaultColDef['floatingFilterComponentParams'] = {suppressFilterButton:true}
		}
		else {
			this.defaultColDef['filter'] = false
			this.defaultColDef['floatingFilter'] = false
		}

		if(hideHeader)
			this.config().gridOptions['headerHeight'] = 0
		// else if(!options.hasOwnProperty('headerHeight'))
		// 	options['headerHeight'] = undefined

		this.gridApi.updateGridOptions({
			rowHeight: 32,
			// headerHeight: 32,
			defaultColDef: this.defaultColDef,
			// enableSorting: false,
			// getRowId: (params: any) => params.data.id || params.rowIndex,
			rowSelection: 'multiple',
			suppressRowTransform: true,
			suppressMenuHide: true,
			suppressRowClickSelection: true,
			// suppressCellFocus: true,
			enableCellTextSelection: false,
			// angularCompileRows: true,
			// getRowHeight: this.getRowHeight,
			isExternalFilterPresent: () =>  true,
			doesExternalFilterPass: (rowNode: any) => {
				// console.log('%cag-grid.component.ts line:264 rowNode.data', 'color: #007acc;', rowNode);
				var flg = true

				if(this.config().flags?.tree) {
					var parentId = rowNode.data.parentId
					for(var i = rowNode.data.level; i > 0; i--) {
						var parent = this.gridApi.getRowNode(parentId)
						flg = flg && parent?.data.expanded
						parentId = parent?.data.parentId
					}
				}
				flg = flg && !rowNode.data.hidden
				// flg = flg && rowNode.data[rowNode.colId]?.includes(this.selectionFilter) || !this.selectionFilter
				return flg
			},
			onRowDataUpdated: (params: { api: { getAllGridColumns: () => any[]; }; })=>{
				// console.log('%cag-grid.component.ts line:637 params', 'color: #007acc;', params, params.api.getAllGridColumns()[0]);
				// this.initGrid()
			},
			onCellFocused: (params) => {
				if(params.api.getFocusedCell()?.rowIndex==this.focusedCell?.rowIndex && (params.column as any)?.colDef.field==this.focusedCell?.colId)
				return

				var rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex as number)
				this.focusedCell = {
					rowNode: rowNode,
					colId: (params.column as any)?.colDef.field,
					...params.api.getFocusedCell()
				}
				if(this.config().flags.selectionType?.singleCell)
					this.selectedCells = [{
						colId: (params.column as any)?.colDef.field,
						rowId: rowNode?.['id'],
						rowIndex: rowNode?.rowIndex,
						rowNode: rowNode
					}]
				console.log('%cag-grid.component.ts line:875 params', 'color: #007acc;', params, this.focusedCell);
				if(this.config().flags.toolbar) {
					this.style.halign = this.focusedCell.rowNode.data.style?.[this.focusedCell.colId]?.['justify-content'] || 'left'
					this.style.valign = this.focusedCell.rowNode.data.style?.[this.focusedCell.colId]?.['align-items'] || 'start'
					this.style.fontSize.selectedItems = this.focusedCell.rowNode.data.style?.[this.focusedCell.colId]?.['font-size'] || 14
					this.refreshCells('all')
				}
				// this.gridApi.redrawRows()
			},
			...this.config().gridOptions
		})

		setTimeout(() => {
		if(sizeColumnsToFit) {
			console.log('%cHello src/app/ag-grid/ag-grid.component.ts:1604 ', 'background: green; color: white; display: block;');
				this.gridApi.sizeColumnsToFit();
				this.colVisConfig.list = this.config().columnDefs.map((col)=>col.field)
				this.colVisConfig.selectedItems = this.config().columnDefs.filter((col)=>!col.hide).map((col)=>col.field)
				console.log('%csrc/app/ag-grid/ag-grid.component.ts:1654 this.gridApi.getAllGridColumns()', 'color: #007acc;', this.config().columnDefs, this.colVisConfig);
			}
		}, 100);
		this.initRangeSelection()
	}

	initRangeSelection() {
		timer(1000).subscribe(()=>{
			var id = "#"+this.config().flags.id + " .ag-theme-quartz"
			var gridElement = (document.querySelector(id) as HTMLElement);
			console.log('%cmain/gridComponent_config/src/app/ag-grid/ag-grid.component.ts:56 document.querySelector(".ag-theme-quartz")', 'color: #007acc;', this.config().flags, id, gridElement, this.config().flags.id, this.factory.contextMenus);
			if(gridElement && !gridElement.onmousedown)
			gridElement.onmousedown = (event: any) => {
				console.log('%csrc/app/ag-grid/ag-grid.component.ts:72 !(event.ctrlKey && event.button && event.target && event.target.classList.contains("ag-cell-value")&&this.config().flags.selectionType?.cellRange)', 'color: #007acc;', !(event.ctrlKey && !event.button && event.target && event.target.classList.contains("ag-cell-value")&&this.config().flags.selectionType?.cellRange), ',', event.ctrlKey, event.button, event.target, event.target.classList.contains('ag-cell-value'), this.config().flags.selectionType?.cellRange);
				if(!(event.ctrlKey && !event.button && event.target/*  && event.target.classList.contains('ag-cell-value') */&&this.config().flags.selectionType?.cellRange)) return;
				console.log('%cmain/gridComponent_config/src/app/ag-grid/ag-grid.component.ts:61 event, event.button, event.buttons', 'color: #007acc;', event, event.button, event.buttons);

				function findAllByKey(obj: any, repeatKey: any, finalKeyToFind: any) {
          var prop = eval('obj.' + finalKeyToFind);
          // console.log('%cag-grid.component.ts line:208 prop', 'color: #007acc;', prop);
          if (prop) {
            return prop;
          }
          else if (obj[repeatKey])
            return findAllByKey(obj[repeatKey], repeatKey, finalKeyToFind);
        }
				interface Range {
					startColumn: { [key: string]: any };
					startRow: { [key: string]: any };
					endRow: { [key: string]: any };
					columns: any[]; // You might want to define a type for columns as well
				}
				var range: Range = {
					startColumn: {},
					startRow: {},
					endRow: {},
					columns: [],
				}
				console.log('Mouse Down');
				console.log('ag-body-viewport ------- ag-body-viewport',event)
				console.log('Start');
				var focusedCell = this.gridApi.getFocusedCell()
				if(focusedCell) {
					console.log('Start focusedCell',focusedCell,"\n",this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex));
					range.startRow['rowId'] = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.['id'];
					range.startRow['rowIndex'] = focusedCell.rowIndex;
					range.startRow['rowPinned'] = focusedCell.rowPinned;
					range.startColumn = focusedCell.column
					range.endRow = range.startRow
				}
				console.log('range 11',range );
				console.log('focusedCell',focusedCell);
				var r = findAllByKey(event.target, 'parentNode', 'attributes?.["row-id"]?.value')
				var c = findAllByKey(event.target, 'parentNode', 'attributes?.["aria-colindex"]?.value')
				console.log("CC",c);
				console.log('RR',r);
				range.endRow = {
					rowId: parseInt(r),
					rowIndex: parseInt(findAllByKey(event.target, 'parentNode', 'attributes?.["row-index"]?.value')),
					rowPinned: this.gridApi.getRowNode(r)?.rowPinned,
				}
				console.log('range.endRow ',range.endRow );
				var columns :any = []
				this.gridApi.getColumns()?.map((map: { [x: string]: any; })=> columns.push(map['colId']))
					var ind = columns?.indexOf(range.startColumn['colId'])
				range.columns = []
				for (var i = 0, j = c > ind ? ind : c - 1; c > ind ? j < c : j <= ind && ind != -1; i++, j++) {
						range.columns[i] = columns[j]
				}
				console.log('columns',columns);
				console.log('range movew',range);
				this.rangeSelectedCells = [range]
					// console.log('%cgrid_component.js line:117 this.rangeSelectedCells, range', 'color: #007acc;', this.rangeSelectedCells, range, this.selectedCells);
				this.selectedCells = []
				this.rangeSelectedCells.map((cell:any) => {
					// console.log('%cgrid_component.js line:119 cell', 'color: #007acc;', cell);
					cell.columns.map((col:any) => {
						// console.log('%cgrid_component.js line:2121 col', 'color: #007acc;', col);
						for (var i = 0; i <= Math.abs(cell.startRow.rowIndex - cell.endRow.rowIndex); i++) {
							var rowId = (cell.startRow.rowIndex < cell.endRow.rowIndex ? cell.startRow.rowIndex : cell.endRow.rowIndex)+i;
							// console.log('%cgrid_component.js line:2123 i', 'color: #007acc;', i, this.gridApi.getDisplayedRowAtIndex(rowId));
							var rowNode :any= this.gridApi.getDisplayedRowAtIndex(rowId)
							// console.log('%cgrid_component.js line:2763 rowNode', 'color: #007acc;', rowNode, col.colId, rowNode.data[col.colId]);
							if (!rowNode['data'][col]?.hasOwnProperty('cellMerge') || rowNode.data[col]?.hasOwnProperty('rowspan') || rowNode.data[col].hasOwnProperty('colspan')) {
								var newcell = {
									colId: col,
									rowId: this.gridApi.getDisplayedRowAtIndex(rowId)?.['id'],
									rowIndex: rowId,
									rowNode: rowNode
								}
								// console.log('%cgrid_component.js line:2126 newcell', 'color: #007acc;', newcell);
								this.selectedCells.push(newcell)
							}
						}
					})
				})
				console.log('this.selectedCells',this.selectedCells);
				this.refreshCells('all')

				gridElement.onmousemove = (event: any) => {
					console.log('Mouse Move');
					var focusedCell = this.gridApi.getFocusedCell()
					if(focusedCell) {
						console.log('Start focusedCell',focusedCell,"\n",this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex));
						range.startRow['rowId'] = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.['id'];
						range.startRow['rowIndex'] = focusedCell.rowIndex;
						range.startRow['rowPinned'] = focusedCell.rowPinned;
						range.startColumn = focusedCell.column
						range.endRow = range.startRow
					}
					console.log('Record Cells',event, event.target)
					var r = findAllByKey(event.target, 'parentNode', 'attributes?.["row-id"]?.value')
					var c = findAllByKey(event.target, 'parentNode', 'attributes?.["aria-colindex"]?.value')
					console.log("CC",c);
					console.log('RR',r);
					range.endRow = {
						rowId: parseInt(r),
						rowIndex: parseInt(findAllByKey(event.target, 'parentNode', 'attributes?.["row-index"]?.value')),
						rowPinned: this.gridApi.getRowNode(r)?.rowPinned,
					}
					console.log('range.endRow ',range.endRow );
					var columns :any = []
					this.gridApi.getColumns()?.map((map: { [x: string]: any; })=> columns.push(map['colId']))
						var ind = columns?.indexOf(range.startColumn['colId'])
					range.columns = []
					for (var i = 0, j = c > ind ? ind : c - 1; c > ind ? j < c : j <= ind && ind != -1; i++, j++) {
							range.columns[i] = columns[j]
					}
					console.log('columns',columns);
					console.log('range movew',range);
					this.rangeSelectedCells = [range]
					// console.log('%cgrid_component.js line:117 this.rangeSelectedCells, range', 'color: #007acc;', this.rangeSelectedCells, range, this.selectedCells);
					this.selectedCells = []
					this.rangeSelectedCells.map((cell:any) => {
						// console.log('%cgrid_component.js line:119 cell', 'color: #007acc;', cell);
						cell.columns.map((col:any) => {
							// console.log('%cgrid_component.js line:2121 col', 'color: #007acc;', col);
							for (var i = 0; i <= Math.abs(cell.startRow.rowIndex - cell.endRow.rowIndex); i++) {
								var rowId = (cell.startRow.rowIndex < cell.endRow.rowIndex ? cell.startRow.rowIndex : cell.endRow.rowIndex)+i;
								// console.log('%cgrid_component.js line:2123 i', 'color: #007acc;', i, this.gridApi.getDisplayedRowAtIndex(rowId));
								var rowNode :any= this.gridApi.getDisplayedRowAtIndex(rowId)
								// console.log('%cgrid_component.js line:2763 rowNode', 'color: #007acc;', rowNode, col.colId, rowNode.data[col.colId]);
								if (!rowNode['data'][col]?.hasOwnProperty('cellMerge') || rowNode.data[col]?.hasOwnProperty('rowspan') || rowNode.data[col].hasOwnProperty('colspan')) {
									var newcell = {
										colId: col,
										rowId: this.gridApi.getDisplayedRowAtIndex(rowId)?.['id'],
										rowIndex: rowId,
										rowNode: rowNode
									}
									// console.log('%cgrid_component.js line:2126 newcell', 'color: #007acc;', newcell);
									this.selectedCells.push(newcell)
								}
							}
						})
					})
					console.log('this.selectedCells',this.selectedCells);
					this.refreshCells('all')
				}
				gridElement.onmouseup = (event: any) => {
					console.log('Mouse Up');
					if (this['rangeSelectedCells'].length){
						this.selection = Array.from({ length: Math.abs(this.rangeSelectedCells[0].endRow.rowIndex - this.rangeSelectedCells[0].startRow.rowIndex) + 1 }, (a, i) => this.rangeSelectedCells[0].startRow.rowIndex + i).map((row:any) => {
							return this.rangeSelectedCells[0].columns.map((col:any) => {
								// console.log('this.gridApi.getDisplayedRowAtIndex(row)',this.gridApi.getDisplayedRowAtIndex(row))
								var cell = this.gridApi.getDisplayedRowAtIndex(row)?.['data'][col]
								return /* cell.v ||  */cell || ''
							})
						})
					}
					console.log('this.selection',this.selection)
					console.log('this.selectedCells',this.selectedCells)
					console.log('this.rangeSelectedCells',this.rangeSelectedCells);
					console.log('End')
					gridElement.onmousemove = null
					gridElement.onmouseup = null
				}
			}
		})
	}

	gridSearch = (key: string) => this.gridApi.setGridOption('quickFilterText', key)
	/*************************************/

	hiddenRowsCount: number = 0;
	rowCount: number = 0;
	// Define an array to store hidden rows
	hiddenRows: number[] = [];

	updateRowCounts(): void {
		this.hiddenRowsCount = this.hiddenRows.length;
		this.rowCount = this.config().rowData.length;
	}
	//to insert row
	insertRow(rowIndex: number, data: any) {
		// const focusedCell = this.gridApi.getFocusedCell();
		console.log('%cag-grid.component.ts line:1343 rowId', 'color: #007acc;', typeof rowIndex, rowIndex, data, this.config().rowData.length);

		// Insert the empty row at the calculated insertion index
		this.gridApi.applyTransaction({
			add: [data],
			addIndex: rowIndex
		})
		var row = this.gridApi.getDisplayedRowAtIndex(rowIndex)
		this.refreshCells('col', ['slno'])
		console.log("Updated data after insertion:", this.config().rowData, row);
	}

   	// Method to increment IDs of existing rows starting from a specific index
	private incrementIds(startIndex: number): void {
		for (let i = startIndex; i < this.config().rowData.length; i++) {
			// Assign incremental values starting from 1 to the id property
			this.config().rowData[i].id = i + 1;
		}
	}

	deleteCells(rowIndex: any) {
		console.log('%cag-grid.component.ts line:1269 rowIndex', 'color: #007acc;', typeof rowIndex, rowIndex);
		this.gridApi.applyTransaction({
			remove: [this.gridApi.getDisplayedRowAtIndex(rowIndex)?.data]
		})
	}
	deleteRows(rows: any) {
		this.gridApi.applyTransaction({
			remove: rows
		})
	}

	updateRows(rows: any) {
		// incomplete
		this.gridApi.applyTransaction({
			update: rows
		})
	}

  	//To insert Column
	insertColumn(colId: number, pos: number, colDef: ColDef) {

		// Update the column definitions in the grid
		console.log('%cag-grid.component.ts line:1320 newColumn', 'color: #007acc;', colDef, colId);
		this.treeOperations(this.config().columnDefs, colId, (arr: any, index: any)=> {
			console.log('%cag-grid.component.ts line:1322 i, colIndex', 'color: #007acc;', arr, colId, colDef, index);
			arr.splice(index+pos, 0, colDef)
			this.gridApi.setGridOption('columnDefs', this.config().columnDefs);
		})
	}

	//Delete Column function
	deleteColumn(columns: any) {
		this.treeOperations(this.config().columnDefs, true, (arr: any, index: any) => {
			if(columns.includes(arr[index].field)) {
				arr.splice(index, 1)
			}
			// arr = null
		})

		// Update the column definitions in the grid
		this.gridApi.setGridOption('columnDefs', this.config().columnDefs);
	}

	mergeCells() {
		var cellMerge = {} as any
		let colId = this.selectedCells[0].colId
		let rowIndex = this.selectedCells[0].rowIndex
		var row = this.selectedCells.filter((c: any)=>c.rowIndex==rowIndex)

		cellMerge = {
			colId: colId,
			data: []
		}

		for(let cell of this.selectedCells) {
			if(cellMerge.data.length!=this.selectedCells.length/row.length) {
				row = this.selectedCells.filter((c: any)=>c.rowIndex==cell.rowIndex)
				cellMerge.data.push(row)
			}
			if(cell!=this.selectedCells[0])
				delete cell.rowNode.data[cell.colId]
			console.log('%cag-grid.component.ts line:1415 cell, cellMerge, cellMerge.data', 'color: #007acc;', cell, cellMerge, cellMerge.data);
		}
		cellMerge['rowSpan'] = cellMerge.data.length
		cellMerge['colSpan'] = row.length
		this.cellUpdate([this.selectedCells[0].rowNode.data, 'cellMerge', colId], cellMerge)
		this.gridApi.redrawRows()
	}
	splitCells() {
		delete this.selectedCells[0].rowNode.data.cellMerge[this.selectedCells[0].colId]
		this.gridApi.redrawRows()
	}

	private selectedRowIndex: any;
	onCellClicked(event: CellFocusedEvent) {
		this.selectedRowIndex = event.rowIndex;
		console.log('this.selectedRowIndex',this.selectedRowIndex)
	}

	colVisConfig: dropdownConfig = {
		list: [],
		selectedItems: '',
		role: 'text',
		selectionType: 'multiple',
		cb: (items: any, clickedItem: any) => {
			console.log('%csrc/app/ag-grid/ag-grid.component.ts:1784 item', 'color: #007acc;', clickedItem, this.gridApi.getColumn(clickedItem), this.gridApi.getColumn(clickedItem)?.isVisible());
			this.hideColumn([clickedItem], !this.gridApi.getColumn(clickedItem)?.isVisible() as boolean)
			this.gridApi.sizeColumnsToFit();
		}
	}
	hideColumn = (columnList: any[], visible: boolean) => this.gridApi.setColumnsVisible(columnList, visible)

	mainEdit(type: any) {
		if(type.includes('InsertRow')) {
			var rowNode = this.selectedCells?.[0]?.rowNode || this.gridApi.getDisplayedRowAtIndex((this.gridApi.getFocusedCell() as any).rowIndex)
			console.log('%cag-grid.component.ts line:1531 rowNode', 'color: #007acc;', rowNode);
			if(this.config().flags.tree) {
				var data
				if(rowNode.data.expanded == undefined || type == 'InsertRowAbove')
					data = {
						level: rowNode.data.level,
						parentId: rowNode.data.parentId
					}
				else
					data = {
						level: rowNode.data.level + 1,
						parentId: rowNode.id
					}
			}

			if(type=='InsertRowAbove')
				this.insertRow(rowNode.rowIndex, data || {});
			if(type=='InsertRowBelow')
				this.insertRow(rowNode.rowIndex+1, data || {});
		}
		else if(type.includes('InsertCol')) {
			var colId = -1
			// var colId = this.selectedColumnGroups ?
			// this.selectedColumnGroups[Object.keys(this.selectedColumnGroups)[0]]?.node.colId :
			// this.selectedColumns.length ? this.selectedColumns[0] :
			// this.selectedCells?.[0]?.colId ||
			// (this.gridApi.getFocusedCell() as any)?.column?.colId

			if(this.selectedColumnGroups && Object.keys(this.selectedColumnGroups).length) {
				console.log('%cHello ag-grid.component.ts line:1402 ', 'background: green; color: white; display: block;');
				colId = this.selectedColumnGroups[Object.keys(this.selectedColumnGroups)[0]]?.node.colId
			}
			else if(this.selectedColumns?.length) {
				console.log('%cHello ag-grid.component.ts line:1406 ', 'background: green; color: white; display: block;');
				colId = this.selectedCells?.[0]?.colId
			}
			else {
				console.log('%cHello ag-grid.component.ts line:1410 ', 'background: green; color: white; display: block;');
				colId = (this.gridApi.getFocusedCell() as any)?.column?.colId
			}

			var colIndex = (this.gridApi.getAllDisplayedColumns() as any).findIndex((col: any) => col.colId === colId);
			console.log('%cag-grid.component.ts line:1405 column', 'color: #007acc;', colId, colIndex, this.gridApi.getFocusedCell())
			if(type=='InsertColLeft')
				this.insertColumn(colId, 0, { field: 'newField', headerName: 'New Column', headerComponent: NewHeader })
			if(type=='InsertColRight')
				this.insertColumn(colId, 1, { field: 'newField', headerName: 'New Column', headerComponent: NewHeader })
		}
		else if(type == 'HideSelectedRows') {
			console.log('%cag-grid.component.ts line:1433 this.gridApi.getSelectedNodes()', 'color: #007acc;', this.gridApi.getSelectedNodes());
			for(let cell of this.gridApi.getSelectedNodes()) {
				console.log('%cag-grid.component.ts line:1435 cell.rowNode.data["hidden"]', 'color: #007acc;', cell, cell.data["hidden"]);
				cell.data['hidden'] = true
			}
			this.gridApi.onFilterChanged()
		}
		else if(type == 'UnhideAllRows') {
			this.gridApi.forEachNode((node: any)=>delete node.data.hidden)
			this.gridApi.onFilterChanged()
		}
		else if(type == 'HideSelectedCols') {
			this.hideColumn(this.selectedColumns, false)
		}
		else if(type == 'UnhideAllCols') {
			this.hideColumn(this.selectedColumns, true)
		}
		else if(type == 'DeleteCells') {
			for(let cell of this.selectedCells) {
				console.log('%cag-grid.component.ts line:1531 cell', 'color: #007acc;', cell);
				cell.rowNode.data[cell.colId] = ''
			}
			this.deselectAll('all')
		}
		else if(type == 'DeleteRows') {
			this.deleteRows(this.gridApi.getSelectedRows())
		}
		else if(type == 'RetainRows') {
			// switch (type) {
			// 	case 'invert': {
					// var unselected : any= []
					// var selected: any =[]
					// this.gridApi.forEachNodeAfterFilter((node: any) =>{
					// 	if(!node.selected ){
					// 		// unselected.push(node.data)
					// 		// node['displayed'] = false
					// 	}
					// 	else{
					// 		selected.push(node.data)
					// 	 }
					// })
					this.config().rowData = this.gridApi.getSelectedRows()
					//    this.updateGrid(selected, this.config().columnDefs, this.gridOptions, this.defaultColDef)
					// break;
				// }
		// 	}
		}
		else if(type == 'DeleteColumns') {
			this.deleteColumn(this.selectedColumns)
		}
	}

	/*************************************************************/

}

@Component({
	standalone: true,
	imports: [FormsModule],
	template: `<input class="cellEditor" type="text" [(ngModel)]="params.value.v" autofocus/>`,
	styles: `
		.cellEditor {
			width: 100%;
			height: 32px;
			border: 1px solid #ddd;
			margin: auto;
			padding: 8px;
			border-radius: 4px;
		}
	`
})
export class cellEditor {
	params: any;
	agInit(params: any): void {
		this.params = params;
		console.log('%csrc/app/ag-grid/ag-grid.component.ts:1943 params', 'color: #abfbcc;', params);
		timer(1).subscribe(()=>(document.querySelector('.cellEditor') as HTMLElement)?.focus())
	}
	getValue() {
		return {...this.params.value}
	}
}