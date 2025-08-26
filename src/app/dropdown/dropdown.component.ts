import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Filter } from '../services/pipe.pipe';

export interface dropdownConfig {
  list: any,
  // Function called on selecting item. If 
  cb?: Function,
  // either array of string depending on multiple or single selection
  selectedItems: any,
  // to search in list elements
  searchField?: boolean,
  // whether there are buttons to go to prev/next item in list
  increment?: boolean,
  // different kind of icons for increment: 'font'|'pagination'|'zoom'|'text'
  role?: string,
  // if list items are object, key in object to be displayed
  displayKey?: string,
  // single or multiple selection
  selectionType?: string,
  // add item to list
  addField?: boolean,
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, Filter],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {

  config = input.required<dropdownConfig>()

  open = false
  filter = ''
  
  array = true
  searchWidth = {}

  ngOnInit() {
    this.config().selectedItems = this.config().selectionType == 'multiple' ? [this.config().list?.[0]] : this.config().list?.[0]
    this.array = !!this.config().displayKey//Array.isArray(this.config().selectedItem)
    console.log('%csrc/app/dropdown/dropdown.component.ts:17 listItems, selection', 'color: #007acc;', this.config().list, this.config().selectedItems, this.config().displayKey, this.array);
  }

  updateSelection(item: any) {
    console.log('%csrc/app/dropdown/dropdown.component.ts:30 type', 'color: #007acc;', item);
    switch(item) {
      case 'prev':
        this.config().selectedItems = this.config().list[this.config().list.indexOf(this.config().selectedItems)-1] || this.config().list[0]
        break
      case 'next':
        this.config().selectedItems = this.config().list[this.config().list.indexOf(this.config().selectedItems)+1] || this.config().list.at(-1)
        break
      default:
        if(this.config().selectionType == 'multiple') {
          // delete if exists otherwise insert
          var ind = this.config().selectedItems.indexOf(item)
          console.log('%csrc/app/dropdown/dropdown.component.ts:54 ind', 'color: #007acc;', ind);
          if(this.config().selectedItems.includes('All'))
            this.config().selectedItems = this.config().selectedItems.filter((i: any)=>i!='All')
          if(item == 'All')
            this.config().selectedItems = [item]
          else
            ind > -1 ? this.config().selectedItems.splice(ind, 1) : this.config().selectedItems.push(item)
        }
        else {
          this.config().selectedItems = item
        }
    }
    if(this.config().cb)
      (this.config().cb as any)(this.config().selectedItems, item)
    if(this.config().selectionType == 'single' && this.config().list.includes(item))
      this.togglePopup()
    console.log('%crefComponent_v3/src/app/dropdown/dropdown.component.ts:54 this.config().selectedItem', 'color: #007acc;', this.config().selectedItems, item);
  }

  togglePopup() {
    this.open = !this.open
    if(this.config().searchField && this.open) {
      this.config().searchField = false
      setTimeout(() => {
        this.searchWidth = {width: (document.querySelector('.dropdownItem')?.clientWidth || 0) + 'px'}
        console.log('%crefComponent_v3/src/app/dropdown/dropdown.component.ts:41 this.config().searchField, this.searchWidth', 'color: #007acc;', this.config().searchField, this.searchWidth, document.querySelector('.dropdownItem'), document.querySelector('.dropdownItem')?.clientWidth);
        setTimeout(() => {
          this.config().searchField = true
        }, 1);
      }, 1);
    }
  }

  isActive = (item: any) => Array.isArray(this.config().selectedItems) ? this.config().selectedItems?.includes(item) : this.config().selectedItems == item

  addField() {
    console.log("add")
    if (this.filter.trim() !== '' && !this.config().list.includes(this.filter))  {
      this.config().list.push(this.filter);
      this.config().selectedItems = this.filter
      this.open = false
    }
    this.filter = '';
  }
}