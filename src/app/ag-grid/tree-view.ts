import { CommonModule } from "@angular/common"
import { Component, inject } from "@angular/core"
import { BypassHtmlSanitizerPipe } from "../services/pipe.pipe"
import { AgGridComponent } from "./ag-grid.component"
import { FormsModule } from "@angular/forms"

// CellRenderer Component for Tree view
@Component({
	standalone: true,
	imports: [BypassHtmlSanitizerPipe, CommonModule],
	template: `
		<div (click)="params.colDef['toggleOnClick'] == 'cell' && toggle(params.data)" [ngStyle]="{'padding-left': params.data.level * 16 + 'px'}" class="cell">
			<span (click)="(!params.colDef['toggleOnClick'] || params.colDef['toggleOnClick'] == 'icon') && toggle(params.data)" class="icon">
				@if (params.data.hasOwnProperty('expanded')) {
					@if(params.data.expanded) {
						@if(iconsExpanded?.length==1) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsExpanded | bypassHtmlSanitizer"></div>
						}
						@else if(iconsExpanded) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsExpanded[params.data.level] | bypassHtmlSanitizer"></div>
						}
						@else {
							<i class="fa fa-minus"></i>
						}
					}
					@else {
						@if(iconsFolded?.length==1) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsFolded | bypassHtmlSanitizer"></div>
						}
						@else if(iconsFolded) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsFolded[params.data.level] | bypassHtmlSanitizer"></div>
						}
						@else {
							<i class="fa fa-plus"></i>
						}
					}
				}	
			</span>
			<span class="ag-cell-value">{{params.value}}</span>
		</div>
	`,
	styles: `
		.cell{display: flex;gap: 8px;text-align: left;width: 100%;}
		.icon{min-width: 12px;display: flex;margin: auto;color: #000000A6;font-size: 12px}
	`
})
export class TreeArrowRenderer {
	params: any
	icon!: string
	iconsExpanded: any
	iconsFolded: any
	agInit(params: any): void {
		this.params = params
		this.iconsExpanded = params.colDef.treeIcons?.expanded
		this.iconsFolded = params.colDef.treeIcons?.folded
		// console.log('renderer created', params, params.eGridCell, params.eGridCell.clientHeight, params.eParentOfValue, params.eParentOfValue.clientHeight, this.iconsExpanded, this.iconsFolded, params.rowHeight);
	}

	refresh(params: any): boolean {
	//   console.log('renderer refreshed');
	  return true;
	}

	toggle(data: any): void {
		// if(data.hasOwnProperty('expanded')){
			// if(data.expanded ) data.expanded = 0
			// else data.expanded = 1}
		if(data.hasOwnProperty('expanded')){
			data.expanded = !data.expanded
		}
		this.params.api.onFilterChanged()
	}
}

// CellRenderer Component for Tree Right Arrow view
@Component({
	standalone: true,
	imports: [BypassHtmlSanitizerPipe],
	template: `
		<div (click)="params.colDef['toggleOnClick'] == 'cell' && toggle(params.data)" style="padding-left: {{(params.data.level) * 16}}px; display: flex;text-align: left;width: 100%;">
			<span class="ag-cell-value">{{params.value}}</span>
			@if (params.data.hasOwnProperty('expanded')) {
				<span (click)="(!params.colDef['toggleOnClick'] || params.colDef['toggleOnClick'] == 'icon') && toggle(params.data)" style="padding-right: 8px;display: flex;margin: auto;color: #000000A6;font-size: 12px">
					@if(params.data.expanded) {
						@if(iconsExpanded?.length==1) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsExpanded | bypassHtmlSanitizer"></div>
						}
						@else if(iconsExpanded) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsExpanded[params.data.level] | bypassHtmlSanitizer"></div>
						}
						@else {
							<i class="fa fa-chevron-down"></i>
						}
					}
					@else {
						@if(iconsFolded?.length==1) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsFolded | bypassHtmlSanitizer"></div>
						}
						@else if(iconsFolded) {
							<div style="display: flex;align-items: center" [innerHTML]="iconsFolded[params.data.level] | bypassHtmlSanitizer"></div>
						}
						@else {
							<i class="fa fa-chevron-right"></i>
						}
					}
				</span>
			}
		</div>
	`
})
export class TreeArrowRightRenderer {
	params: any
	icon!: string
	iconsExpanded: any
	iconsFolded: any
	agInit(params: any): void {
		this.params = params
		this.iconsExpanded = params.colDef.treeIcons?.expanded
		this.iconsFolded = params.colDef.treeIcons?.folded
		// console.log('renderer created', params, params.eGridCell, params.eGridCell.clientHeight, params.eParentOfValue, params.eParentOfValue.clientHeight, this.iconsExpanded, this.iconsFolded, params.rowHeight);
	}

	refresh(params: any): boolean {
	//   console.log('renderer refreshed');
	  return true;
	}

	toggle(data: any): void {
		if(data.hasOwnProperty('expanded')){
			if(data.expanded == 'true') data.expanded = 'false'
				else data.expanded = 'true'
			}
		this.params.api.onFilterChanged()
	}
}

@Component({
	standalone: true,
	imports: [BypassHtmlSanitizerPipe, CommonModule],
	template: `
		<div style="display: flex;flex-grow:1">
			@for(ind of [].constructor(params.data.level+1); track ind){
				<span (click)="toggle(params.data)" style="border-right: 1px solid #dddddd; width: {{params.eGridCell.offsetHeight}}px;display: flex; justify-content: center; align-items: center;color: #000000A6;font-size: 12px" [ngStyle]="params.data.hasOwnProperty('expanded')?{'cursor': 'pointer'}:{}"> 
					@if (params.data.hasOwnProperty('expanded') && $last) {
						@if(params.data.expanded) {
							@if(iconsExpanded?.length==1) {
								<div style="display: flex;" [innerHTML]="iconsExpanded | bypassHtmlSanitizer"></div>
							}
							@else if(iconsExpanded) {
								<div style="display: flex" [innerHTML]="iconsExpanded[params.data.level] | bypassHtmlSanitizer"></div>
							}
							@else {
								<i class="fa fa-minus"></i>
							}
						}
						@else {
							@if(iconsFolded?.length==1) {
								<div style="display: flex;" [innerHTML]="iconsFolded | bypassHtmlSanitizer"></div>
							}
							@else if(iconsFolded) {
								<div style="display: flex" [innerHTML]="iconsFolded[params.data.level] | bypassHtmlSanitizer"></div>
							}
							@else {
								<i class="fa fa-plus"></i>
							}
						}
					}
				</span>
			}
			<span class="ag-cell-value" style="margin-left: 16px;width: 0%;    text-align: left;">
				<!-- @if(params.colDef.cellTemplate){
					<div style="display: flex" [innerHTML]="params.colDef.cellTemplate(params) | bypassHtmlSanitizer"></div>
				}
				@else { -->
					{{params.value}}
				<!-- } -->
			</span>
		</div>
	`
})
export class TreeArrowRendererBorder {
	params: any
	icon!: string
	iconsExpanded: any
	iconsFolded: any
	agInit(params: any): void {
		this.params = params
		this.iconsExpanded = params.colDef.treeIcons?.expanded
		this.iconsFolded = params.colDef.treeIcons?.folded
		// console.log('renderer created', params, params.eGridCell, params.eGridCell.clientHeight, params.eParentOfValue, params.eParentOfValue.clientHeight, this.iconsExpanded, this.iconsFolded, params.rowHeight, params.colDef.cellRenderer, params.data.cellStyle, eval(params.data.cellStyle), params.colDef.template)
	}

	refresh(params: any): boolean {
	//   console.log('renderer refreshed');
	  return true;
	}

	toggle(data: any): void {
		if(data.hasOwnProperty('expanded')){
			// if(data.expanded ) data.expanded = 0
			// else data.expanded = 1
		}
		if(data.hasOwnProperty('expanded')){
			data.expanded = !data.expanded
		}
		this.params.api.onFilterChanged()
	}
}

@Component({
	standalone: true,
	imports: [FormsModule],
	template: `
	<span class="ag-cell-label-container">
		<div class="ag-header-cell-label" (click)="ag.selectColRow('col', $event)">
			<span class="ag-header-cell-text">{{params.displayName}}</span>
		</div>
		<label for="fold" style="border-right: 1px solid #dddddd; width: {{params.column.colDef.rowHeight || 24}}px;height: 100%;display: flex; justify-content: center; align-items: center;cursor:pointer;color: #000000A6">
			@if(foldAll) {
				<i class="fa fa-minus"></i>
			}
			@else {
				<i class="fa fa-plus"></i>
			}
			<input type="checkbox" id="fold" [(ngModel)]="foldAll" (change)="toggle($event)">
		</label>
	</span>
	`,
	styles: [
		`
		  .ag-cell-label-container {
			display: flex;
			height: 100%;
			padding:0;
			cursor: pointer
		  }
		  #fold {
			display: none
		  }
		`,
	  ],
})
export class FoldAllTreeHeader {
	params: any
	foldAll: any
	ag = inject(AgGridComponent)

	agInit(params: any): void {
		this.params = params
		this.foldAll = true
		// console.log('FoldAllTreeHeader renderer created', params, params.api.getAllDisplayedColumns());
	}

	toggle(state: any): void {
		this.foldAll = state.target.checked
		// this.foldAll = !this.params.api.getRowNode(0).data.expanded
		this.params.api.forEachNode((node: any)=>{
			if(node.data.hasOwnProperty('expanded'))
				// if(this.foldAll){
				// 	node.data.expanded = 1
				// }
				// else node.data.expanded = 0
				node.data.expanded = this.foldAll
				if(node.data.hasOwnProperty('expanded')){
					node.data.expanded = this.foldAll
				}
				// console.log('%cag-grid.component.ts line:164 node', 'color: #007acc;', node);
			})
		this.params.api.onFilterChanged()
		this.params.api.refreshCells({force: true, columns: ['treearrow']})
	}
}
