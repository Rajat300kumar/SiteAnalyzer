import { DashboardComponent } from './../../dashboard/dashboard.component';
import { Component, ElementRef, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [MatAutocompleteModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent implements OnChanges {
  // input: any;
  @Input() options: (string | number)[] = [];  // Accepts array of options
  // @Input() options: any = {}
  @Input() label: string = 'Dropdown';  // Accepts label text
  @Input() selectedOption: string | number | null = null; // Pre-selected option@Input() selectedOption: string | number = '';
  @ViewChild('input') input !: ElementRef<HTMLInputElement>;
  @Output() optionSelected = new EventEmitter<string>();
  myControl = new FormControl('');
  filteredOptions: (string | number)[] = [];
  lebel = 'Select Batch'
  constructor() {
    this.filteredOptions = Array.isArray(this.options) ? this.options.slice() : [];
    console.log('to string', this.options, this.filteredOptions)
  }
  onSelect(selectedValue: any,) {
    console.log("<<>>", typeof selectedValue, "\n", selectedValue)
    this.optionSelected.emit(selectedValue);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      console.log("changes['options']", changes['options'])
      this.filteredOptions = Array.isArray(this.options) ? this.options.slice() : [];
    }

    if (changes['selectedOption'] && this.selectedOption != null) {
      console.log("changes['selectedOption']", changes['selectedOption'])

      // Set the pre-selected value in the form control
      this.myControl.setValue(this.selectedOption.toString());
    }
  }

  filter(): void {
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


