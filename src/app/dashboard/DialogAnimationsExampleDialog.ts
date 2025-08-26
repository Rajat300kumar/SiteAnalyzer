import { json } from 'stream/consumers';
// Dialog Example
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, inject, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DropdownComponent } from '../common/dropdown/dropdown.component'
import { TasService } from '../services/data-service.service';
import { FactoryService } from '../factory/factory.service';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AgGridComponent, AGGridConfig } from '../ag-grid/ag-grid.component';



import { MatTable, MatTableModule, } from '@angular/material/table';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from '../services/loader.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import * as companyData from '../../assets/Permline.json'
import { HttpClient } from '@angular/common/http';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'jsondatadisplay',
  template: `

  <div class="container" style="width: 100%;">
    <div class="row m-0 p-0" style="display: flex;flex-direction:row;width:100%;height:80vh">
      <!-- Company Past -->
      <div class="col-md-3" style="width: 32%;height:80%;text-align: center;">
        {{dialogData.comapnyName}}
        <h4>1. Paste Company Names</h4>
          <mat-form-field appearance="fill" style="width: 100%;height:auto">
            <mat-label>Paste one company per line</mat-label>
            <textarea
              matInput
              rows="22"
              [(ngModel)]="pastedText"
              (ngModelChange)="onTextPaste()"
            ></textarea>
          </mat-form-field>
        <!-- Save Button -->
        <div style="margin-top: 10px;">
          <button mat-raised-button color="primary" (click)="onSave()">Save</button>
          <button mat-raised-button (click)="onCancel()">Cancel</button>
        </div>
      </div>
      <!-- Company Permid and Ticker -->
       <div class="col-md-5" style="width: 38%;height:90%;text-align: center;">
        <h4>2. Matched Results (Editable)</h4>
        <div style="height: 100%;overflow:scroll">
              <table mat-table [dataSource]="matchedResults" class="mat-elevation-z1" style="width: 100%; margin-top: 10px;">
                <!-- Company Name -->
                <ng-container matColumnDef="company">
                  <th mat-header-cell *matHeaderCellDef style="width: 45%;">Company</th>
                  <td mat-cell *matCellDef="let row"  style="width: 45%;">{{ row.name }}</td>
                </ng-container>

                <!-- PermId -->
                <ng-container matColumnDef="permId">
                  <th mat-header-cell *matHeaderCellDef style="width: 30%;">PermId</th>
                  <td mat-cell *matCellDef="let row" style="width: 30%;">
                    <input *ngIf="row.permId" matInput [(ngModel)]="row.permId" placeholder="PermId" style="height: 40px;" />
                  </td>
                </ng-container>

                <!-- Ticker -->
                <ng-container matColumnDef="ticker">
                  <th mat-header-cell *matHeaderCellDef style="width: 25%;">Ticker</th>
                  <td mat-cell *matCellDef="let row" style="width: 25%;">
                    <input *ngIf="row.ticker" matInput [(ngModel)]="row.ticker" placeholder="Ticker" style="height: 40px;"/>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['company', 'permId', 'ticker']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['company', 'permId', 'ticker'];" (click)="onRowSelect(row)" [ngClass]="{'selected-row': selectedRow === row}"></tr>
              </table>
       </div>
       </div>
       <!-- Company json list -->
        <div class="col-md-4" style="width: 30%;height:80%;text-align: center;">
             <h4>3. Company List (with Search)</h4>
                <mat-form-field appearance="fill" style="width: 100%;">
                  <mat-label>Search Companies</mat-label>
                  <input matInput [(ngModel)]="searchQuery" placeholder="Search by Company Name, Ticker, or PermId" />
                </mat-form-field>

                <div style="height: 100%;overflow:scroll">
                  <table mat-table [dataSource]="filteredCompanyList()" class="mat-elevation-z1" style="width: 100%;">

                  <!-- Company Name -->
                  <ng-container matColumnDef="company">
                    <th mat-header-cell *matHeaderCellDef>Company</th>
                    <td mat-cell *matCellDef="let company" (click)="onCompanySelect(company)">
                      {{ company['Company Name'] }}
                    </td>
                  </ng-container>

                  <!-- PermId -->
                  <ng-container matColumnDef="permId">
                    <th mat-header-cell *matHeaderCellDef>PermId</th>
                    <td mat-cell *matCellDef="let company">{{ company.PermId }}</td>
                  </ng-container>

                  <!-- Ticker -->
                  <ng-container matColumnDef="ticker">
                    <th mat-header-cell *matHeaderCellDef>Ticker</th>
                    <td mat-cell *matCellDef="let company">{{ company.Ticker }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['company', 'permId', 'ticker']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['company', 'permId', 'ticker'];"></tr>
                </table>
                </div>


        </div>
    </div>
  </div>
    `,
  standalone: true,
  imports: [MatButtonModule, MatTableModule, MatDialogModule, MatIconModule, FormsModule, CommonModule, MatTable,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
  .selected-row {
  background-color: #d3e0ea; /* light blue background */
  color: #000; /* text color */
}

    table {
																border-collapse: collapse;
                                                                width:100%
																}
															table td {
																border-top: 0px solid gray;
																border-right: 0px solid gray;
																border-radius: 0px;
																}
															table td:last-child {
																border-right: none;
																}
															table th {
																border-right: 1px solid gray;
																border-radius: 0px;
																}
															table th:last-child {
																border-right: none;
																}`

})
export class Dialogmetadata implements OnInit {
  public dataSource: any;
  @Output() metadata = new EventEmitter<any>();
  constructor(private http: HttpClient, private cdrf: ChangeDetectorRef,
    public dialogRef: MatDialogRef<Dialogmetadata>, // Dialog reference
    @Inject(MAT_DIALOG_DATA) public dialogData: any, // Injected data
  ) {
    console.log('Dialog Data:', this.dialogData);
    this.matchedResults = [];
  }

  // Rajat 21-08-2025

  pastedText = '';
  searchQuery = '';
  companyList: Array<any> = [];
  matchedResults: Array<{ name: string, permId: number | null, ticker: string | null }> = [];
  // Variable to track selected row
  selectedRow: any = null;
  ngOnInit(): void {
    this.http.get<any[]>('assets/Permline.json').subscribe(data => {
      this.companyList = data;
      console.log(this.companyList)
    });
  }

  onTextPaste(): void {
    const lines = this.pastedText
      .split('\n')
      .map(line => this.normalize(line))
      .filter(line => line.length > 0);

    let updatedText = '';

    this.matchedResults = lines.map(pastedName => {
      const match = this.companyList.find(c =>
        this.normalize(c['Company Name']) === pastedName
      );

      if (match) {
        updatedText +=  `${pastedName}\n`;  // If match, update with company name
        return { name: match['Company Name'], permId: match.PermId, ticker: match.Ticker };
      } else {
        updatedText += `${pastedName}\n`;  // If no match, retain the original pasted name
        return { name: pastedName, permId: null, ticker: null };
      }
    });

    // If there were any matches, update the pastedText with the updated values
    if (this.matchedResults.some(result => result.permId !== null)) {
      this.pastedText = updatedText.trim();  // Update only if there's at least one match
    }
  }


  onTextPaste_(): void {
    const lines = this.pastedText
      .split('\n')
      .map(line => this.normalize(line))
      .filter(line => line.length > 0);

    this.matchedResults = lines.map(pastedName => {
      const match = this.companyList.find(c =>
        this.normalize(c['Company Name']) === pastedName
      );

      return match
        ? { name: match['Company Name'], permId: match.PermId, ticker: match.Ticker }
        : { name: pastedName, permId: null, ticker: null };
    });
  }

  normalize(name: string): string {
    return name
      .replace(/,/g, '')          // remove commas
      .replace(/\s+/g, ' ')       // normalize whitespace
      .trim()                     // remove leading/trailing spaces
      .toLowerCase();             // make lowercase
  }



  filteredCompanyList(): any[] {
    if (!this.searchQuery?.trim()) return this.companyList;

    const query = this.searchQuery.toLowerCase();

    return this.companyList.filter(c =>
      (c['Company Name']?.toLowerCase()?.includes(query)) ||
      (String(c.Ticker || '').toLowerCase().includes(query)) ||
      (String(c.PermId || '').includes(query))
    );
  }

  onCompanySelect(company: any): void {

    // Directly update the selected row in matchedResults with the PermId and Ticker
    if (this.selectedRow) {
      this.selectedRow.permId = company.PermId;
      this.selectedRow.ticker = company.Ticker;
    }

    // Log the result to check if it's updating correctly
    console.log('Updated matchedResults:', this.matchedResults);

    this.cdrf.detectChanges()
  }

  // Save function
  onSave(): void {
    console.log("save");

    // Filter to get only rows that have a PermId and Ticker set
    const dataToSave = this.matchedResults.filter(row => row.permId && row.ticker);

    if (dataToSave.length > 0) {
      console.log('Saving Data:', dataToSave);

      // Emit the filtered data back to the parent component
      this.metadata.emit({ data: this.matchedResults });  // Ensure this is emitting the correct data

      // Close the dialog after saving
      this.dialogRef.close(this.matchedResults);  // Send back data when dialog closes
    } else {
      console.log('No data to save');
    }
  }
  // Cancel button handler (close dialog without saving)
  onCancel(): void {
    this.dialogRef.close();
  }

  // Update selected row
  onRowSelect(row: any): void {
    console.log(row)
    this.selectedRow = row;
  }

  logData() {
    console.log('Current Data:', this.matchedResults);
    this.metadata.emit({ "data": this.matchedResults });
  }

}
