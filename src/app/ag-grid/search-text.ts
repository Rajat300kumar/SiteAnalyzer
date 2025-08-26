import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams } from 'ag-grid-community';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <input
      class="_ft"
      type="text"
      [(ngModel)]="text"
      (input)="onInputBoxChanged()"
      (click)="select($event)"
    />`,
  styles: `
    ._ft {
      width: 100%;
      height: 32px;
      border: 1px solid #ddd;
      margin: auto;
      padding: 8px;
      border-radius: 4px;
    }
  `
})
export class NumberFloatingFilterComponent
  implements IFloatingFilterAngularComp {
  params!: IFloatingFilterParams;
  text: string = ''

  agInit(params: IFloatingFilterParams): void {
    // console.log('%csearch_text.ts line:34 params', 'color: #007acc;', params);
    this.params = params;
  }

  onParentModelChanged(parentModel: any) {
    // When the filter is empty we will receive a null value here
    console.log('%csrc/app/ag-grid/search-text.ts:41 parentModel', 'color: #007acc;', parentModel);
    if (parentModel == null) {
      this.text = "";
    } else {
      this.text = parentModel['obj']==''||undefined||null?parentModel['str'] : parentModel['obj'];
    }
  }

  //Search input text
  onInputBoxChanged() {
    console.log('%csrc/app/ag-grid/search-text.ts:50 this.text', 'color: #007acc;', this.text);
    // remove the filter if text is empty otherwise call filter from parent filter component
    this.params.parentFilterInstance((instance: any) => {
      instance.myMethodForTakingValueFromFloatingFilter(this.text != "" ? this.text : null);
    });
  }

  // Select text inside textbox
  select = (e:any) => e.target.select()

}