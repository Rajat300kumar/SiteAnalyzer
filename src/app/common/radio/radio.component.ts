import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, QueryList, ElementRef, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioButton } from '@angular/material/radio';
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [MatRadioModule, FormsModule, MatDividerModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent implements OnChanges {
  @Input() Radio: string[] = []
  @Input() ariaPlaceholder: string = '';  // Placeholder text for the radio group
  @Input() selectedValue: string = '';  // The selected value passed from the parent
  @Input() scrollHeight: string = ''; // Height from parent
  @Output() radioSelected = new EventEmitter<string>();
  // @ViewChildren('radioItems') radioItems!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren(MatRadioButton) radioItems!: QueryList<MatRadioButton>;


  @ViewChildren('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  radioselect: string = ''
  // dynamicHeight = '86vh'; // Default max height

  updateHeight(newHeight: string) {
    this.scrollHeight = newHeight;
  }
  ngAfterViewInit(): void {
    // Scroll to the initially selected item (if any) after the view initializes
    setTimeout(() => this.scrollToSelected(), 300);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedValue']) {
      // Check if this is the first change
      if (!changes['selectedValue'].isFirstChange()) {
        this.radioselect = changes['selectedValue'].currentValue;
        setTimeout(() => this.scrollToSelected(), 300);
      } else {
        this.radioselect = changes['selectedValue'].currentValue; // Handles the initial value
        setTimeout(() => this.scrollToSelected(), 300);
      }
    } else {
      console.warn('selectedValue change not detected');
      this.radioselect = ''; // Default value or handle gracefully
    }
  }


  onSelect(selectedSeason: string): void {
    console.log('Selected Season:', selectedSeason);
    this.radioselect = selectedSeason; // Optional, for additional logic
    this.radioSelected.emit(this.radioselect);
  }
  scrollToSelected(): void {
    if (!this.radioItems || this.radioItems.length === 0) {
      console.warn('No radio items available for scrolling.');
      return;
    }


    const radioArray = this.radioItems.toArray();

    const selectedIndex = radioArray.findIndex(
      (radio) => radio.value === this.selectedValue
    );
    if (selectedIndex !== -1) {
      const selectedRadio = radioArray[selectedIndex];
      selectedRadio._inputElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      console.warn('Selected index out of bounds or radio items mismatch.');
    }
  }

}
