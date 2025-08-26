import { Component, ElementRef, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatListModule, MatDividerModule, MatInputModule, MatIconModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatAutocompleteModule, CommonModule, MatButtonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  @Input() options: (string | number)[] = [];  // Accepts array of options
  @Output() optionSelected_list = new EventEmitter<string>();
  @Input() selectedOption: string | number | null = null; // Pre-selected option@Input() selectedOption: string | number = '';
  filteredOptions: (string | number)[] = [];
  filterText: string = ''
  selectedOption__: any = null;
  selectedFilter: 'all' | 'true' | 'false' = 'all'; // Default filter
  myControl = new FormControl('');
  @ViewChild('input') input !: ElementRef<HTMLInputElement>;
  constructor() {
    this.filteredOptions = Array.isArray(this.options) ? this.options.slice() : [];
    console.log('to string', this.options, this.filteredOptions)
  }

  // Method to filter data
  filterBy(filter: 'all' | 'true' | 'false'): void {
    this.selectedFilter = filter; // Update selected filter for highlighting
    if (filter === 'all') {
      this.filteredOptions = [...this.options];
    } else if (filter === 'true') {
      this.filteredOptions = this.options.filter((item: any) => item[2] === true);
    } else if (filter === 'false') {
      this.filteredOptions = this.options.filter((item: any) => item[2] === false);
    }
    this.onSelect(this.filteredOptions[0])
  }

  onSelect(selectedValue: any,) {
    console.log("<<>>", selectedValue)
    this.selectedOption__ = selectedValue
    this.optionSelected_list.emit(selectedValue);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = Array.isArray(this.options) ? this.options.slice() : [];
      this.onSelect(this.filteredOptions[0])
    }

    if (changes['selectedOption'] && this.selectedOption != null) {
      // Set the pre-selected value in the form control
      this.myControl.setValue(this.selectedOption.toString());
      // this.onSelect(this.filteredOptions[0])
    }
  }

  filter(): void {
    // this.filterBy('all')
    // console.log(",,....", this.options)
    if (Array.isArray(this.options)) {
      // If options is an array, copy it to filteredOptions
      this.filteredOptions = this.options.slice();
    } else if (this.options && typeof this.options === 'object') {
      // If options is an object, extract values and assign them to filteredOptions
      this.filteredOptions = Object.values(this.options);  // This converts object values into an array
    } else {
      // If options is neither an array nor an object, initialize as an empty array
      this.filteredOptions = [];
    }
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter((option: any) =>
      option.toString().toLowerCase().includes(filterValue)
    );
  }
}
