import { Request } from 'express';
import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AgGridComponent } from '../ag-grid/ag-grid.component';
import { APIConfig, TITLE } from '../../../SETTINGS.service';
import { FactoryService } from '../factory/factory.service';
import { TasService } from '../services/data-service.service';
import { CommonModule } from '@angular/common';
import { SideMenuComponent, sideMenuConfig } from "../common/side-menu/side-menu.component";
import { ReferenceComponent, referenceConfig } from "../reference/reference.component";
import { Router } from '@angular/router';
import { TasResizerComponent } from "../tas-resizer/tas-resizer.component";
import { HeaderComponent } from '../common/header/header.component'
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DropdownComponent } from '../common/dropdown/dropdown.component'
import { ListComponent } from '../common/list/list.component'
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { async, timer } from 'rxjs';
import { Dialogmetadata } from './DialogAnimationsExampleDialog';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { UploadFilesService } from '../services/upload-files.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { config } from '../../config'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import axios from 'axios';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [CommonModule, FormsModule, MatCardModule, HeaderComponent, MatButtonModule, MatListModule, ReactiveFormsModule, MatButtonToggleModule, MatIconModule, MatGridListModule, NzBreadCrumbModule, NzButtonModule, NzIconModule, NzInputModule]
})
export class DashboardComponent {
  objectUrl: any;
  http: any;
  sic: any;
  stateIncorp: any;
  fye: any;
  proxyDate: any;
  cik: any;
  proxyUrl1: any;
  ticker: any;
  stateLocation: string = '';
  proxyFilingUrl: string = '';
  getcik: any;
  exchenge: any = '';
  jsonData: any[] = [];
  constructor(private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }
  @ViewChild('iframeB', { static: false }) iframeB!: ElementRef;  // Reference to the iframe
  @ViewChild('iframeB', { static: false }) iframeRef!: ElementRef<HTMLIFrameElement>;

  @ViewChild('iframeC', { static: false }) iframeC!: ElementRef;
  tasService = inject(TasService)
  UploadFilesService = inject(UploadFilesService)
  apiConfig = inject(APIConfig)
  factory = inject(FactoryService)
  router = inject(Router)
  cmp_name: string = ''
  Metadata_: any
  doc_name: string = ''
  tkr: string = ''
  selectedpage: any = []
  title = TITLE

  //
  companyName = '';
  sicCode = '';
  sicDescription = '';
  ownershipData: { owner: string; Filings: string; }[] = [];


  modifiedUrl: string = '';
  selectedElementHtml: string = ''; // Stores the clicked element
  // Dropdown

  insertUniqueNumber(arr: number[], num: number): number[] {
    // Check if the number already exists in the array
    if (!arr.includes(num)) {
      arr.push(num);  // If not, push the number into the array
    }
    return arr;  // Return the updated array

  }

  complist = []
  company_indx: any;
  breadcrumbItems: { name: string; }[] = [];
  websiteUrl: string = '';
  safeUrl: SafeResourceUrl = '';

  // Function to generate breadcrumbs from the path
  generateBreadcrumbs(selete: any): void {
    // Assuming cmp_name is dynamically set, and selete is the path or URL to process
    const basePath = config.frontendBasePath;
    let fullPath = '';

    // Check if selete starts with 'http:', remove it, and take the remaining part of the URL
    if (selete && selete.startsWith('http://')) {
      // Remove the base URL part 'http://172.16.20.178' (or similar) to keep only the path
      const urlParts = selete.split(`${config.frontendBasePath}${this.cmp_name}`);
      if (urlParts.length > 1) {
        selete = urlParts[1];  // Get the remaining part after '/test_datasets/'
      } else {
        selete = '';  // If no '/test_datasets/' part found, reset selete to empty
      }
    }

    // Check if cmp_name is defined and valid
    if (this.cmp_name) {
      // Concatenate the base path, cmp_name, and the remaining part of selete
      fullPath = `${basePath}${this.cmp_name}${selete ? '' + selete : ''}`;

      // Split the full path into segments
      const pathSegments = fullPath.split('/');

      // Generate breadcrumb items by mapping over path segments
      this.breadcrumbItems = pathSegments.map((segment, index) => {
        const breadcrumbUrl = pathSegments.slice(0, index + 1).join('/');
        return {
          name: segment ? decodeURIComponent(segment) : segment
        };
      });

      console.log('Generated Breadcrumbs:', this.breadcrumbItems);
    }

  }
  private proxyUrl = 'http://localhost:1010/proxy1';
  // private proxyUrl = 'https://localhost:1010/proxy3';
  // For Site Analyzer

  companyNamesList: string[] = [];

  getcikdata() {
    console.log("getcik", this.cik)
    this.factory.showLoader();
    this.tasService.getSecSubmission(`${this.cik}`).subscribe({
      next: (data) => {
        this.factory.hideLoader();
        this.factory.tasAlert("Done", '', 1500)
        // console.log("res", data)
        this.companyName = data.name || '';
        this.companyNamesList.push(this.companyName);
        console.log("All company names:", this.companyNamesList);
        this.sic = data.sic || '';
        this.sicDescription = data.sicDescription || '';
        this.stateLocation = data.stateOfOrigin || '';
        this.stateIncorp = data.stateOfIncorporation || '';
        this.exchenge = data.exchanges?.[0]
        const rawFye = data.fiscalYearEnd || '' || '';
        this.fye = rawFye ? this.formatFiscalYearEnd(rawFye) : 'Not available';

        this.ticker = data.tickers?.[0]
        // console.log("this.companyName", this.companyName, "this.sic", this.sic, "this.sicDescription", this.sicDescription, "this.stateIncorp", this.stateIncorp, "this.fye", this.fye, "this.ticker", this.ticker, "this.exchenge", this.exchenge)
        const idx = data.filings.recent.form.findIndex(f => f.trim() === 'DEF 14A');
        this.websiteUrl = `https://www.sec.gov/cgi-bin/own-disp?action=getissuer&CIK=${parseInt(this.cik)}`;
        this.loadWebsite()
        // return
        if (idx >= 0) {
          this.proxyDate = data.filings.recent.filingDate[idx];
          const acc = data.filings.recent.accessionNumber[idx];
          const accNoDash = acc.replace(/-/g, '');
          const doc = data.filings.recent.primaryDocument[idx];
          //https://www.sec.gov/cgi-bin/own-disp?action=getissuer&CIK=0001018724
          this.proxyUrl1 = `https://www.sec.gov/Archives/edgar/data/${parseInt(this.cik)}/${accNoDash}/${doc}`;
          // this.websiteUrl = `https://www.sec.gov/cgi-bin/own-disp?action=getissuer&CIK=${parseInt(this.cik)}`;
          // console.log("websiteUrl", this.websiteUrl)
          // this.getper(this.proxyUrl1)
        }
      }, error: (err) => {
        // Failure: handle error
        // console.error("Failed to load data:", err);
        this.factory.tasAlert("Falil To load", `${err}`, 1500)
      }
    });
  }

  getper(link: string) {
    this.tasService.post('/htmllink', {
      url: link
    }).subscribe({
      next: (res) => {
        console.log('Peer companies:', res.peers);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });

  }




  ngOnInit() {
    this.cik = '0001018724' //0001018724
    this.getcikdata()
    // this.getPeerGroup()
    // this.readExcelFile('./../../../Company_Permid_Ticker_2.xlsx')
  }
  private readExcelFile(filePath: string): void {

    this.http.get(filePath, { responseType: 'arraybuffer' }).subscribe(
      (data: ArrayBuffer) => {
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming you want to read the first sheet in the file
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the sheet to JSON
        this.jsonData = XLSX.utils.sheet_to_json(worksheet);
      },
      (error: any) => {
        console.error('Error reading the file:', error);
      }
    );
  }

  formatFiscalYearEnd(fye: string): string {
    if (!fye || fye.length !== 4) return 'Invalid date';
    const month = fye.substring(0, 2);
    const day = fye.substring(2);
    const monthNames: { [key: string]: string } = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December',
    };
    const monthName = monthNames[month] || month;
    return `${monthName} ${parseInt(day)}`;
  }



  loadWebsite() {
    this.factory.showLoader();
    this.tasService.post_option(this.proxyUrl, { url: this.websiteUrl }, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.factory.hideLoader();
          // console.log('Proxy response:', res);
          // Parse data from raw HTML string directly
          this.getdatafromjson1(res);
          // res is the raw HTML string here
          const blob = new Blob([res], { type: 'text/html' });
          this.objectUrl = URL.createObjectURL(blob);
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
        },
        error: (error: any) => {
          console.error('Proxy error:', error);
          this.factory.hideLoader();
        }
      });
  }

  getdatafromjson1(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract ownership data table rows
    const rows = Array.from(doc.querySelectorAll('table[border="1"] tr')).slice(1); // skip header row

    this.ownershipData = rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        owner: cells[0]?.textContent?.trim() ?? '',
        Filings: cells[1]?.textContent?.trim() ?? ''
      };
    });

  }

  // Rajat Ranjan 20-08-2025
  saveexcel(): void {
    const data = [
      ['Full Company Name', this.companyName],
      ['LSEG Permanent Identifier for Company', ''],
      ['SEC Central Index Key', this.cik],
      ['Trading symbol of primary trading instrument', this.ticker],
      ['Year End Stock Price',],
      ['Exchange code of primary trading instrument', this.exchenge],
      ['Market Cap',],
      ['SIC Industry Classification Name', this.sicDescription],
      ['SIC Industry Classification Identifier Code', this.sic],
      ['Fiscal Year End Date', this.fye],
      ['Date of StreetFeeds File',],
      ['Date of the source document', this.proxyDate],
      ['URL Link to Inline XBRL Viewer (sec.gov)', this.proxyUrl1],
      ['Source File Name',],
      ['Financial Year Ending', '2024'],
      ['Share Price',]
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    // If you want to rename the sheet, specify the name here (e.g., "Company Data")
    const sheetName = 'Company Info'; // New name for the sheet
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, this.companyName + '.xlsx');
  }


  savedisplaydata() {
    const obj = {
      companyName: this.companyName,
      cik: this.cik,
      sic: this.sic,
      sicDescription: this.sicDescription,
      date: this.fye,
      ticker: this.ticker,
      exchange: this.exchenge,
      proxyDate: this.proxyDate,
      link: this.proxyUrl1,
      data: this.ownershipData
    };
    const jsonStr = JSON.stringify(obj, null, 2);
    this.saveToUserSelectedLocation(`${this.cik}_${this.companyName.replace(/\s+/g, '_')}.json`, jsonStr);


    // const jsonStr = JSON.stringify(obj, null, 2); // pretty-print JSON
    // const blob = new Blob([jsonStr], { type: 'application/json' });

    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;

    // // Suggested filename, user can still choose location:
    // a.download = `${this.companyName}.json`;

    // document.body.appendChild(a);
    // a.click();

    // document.body.removeChild(a);
    // window.URL.revokeObjectURL(url);
  }
  async saveToUserSelectedLocation(filename: string, content: string) {
    const fileData = new Blob([content], { type: 'application/json' });

    // Check if the browser supports showSaveFilePicker
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const opts = {
          suggestedName: filename,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        };

        const handle = await (window as any).showSaveFilePicker(opts);
        const writable = await handle.createWritable();

        await writable.write(fileData);
        await writable.close();

        console.log('✅ File saved using File System Access API');
      } catch (err) {
        console.warn('❌ Save cancelled or failed', err);
      }
    } else {
      // Fallback: force download via <a> + Blob
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('⚠️ Used fallback download (unsupported browser)');
    }
  }



  attachClickListener() {
    if (!this.iframeB?.nativeElement) {
      console.error("iframeB reference is not available yet.");
      return;
    }

    const iframe = this.iframeB.nativeElement;

    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.warn("Unable to access iframe document (Cross-Origin issue).");
          return;
        }

        console.log("Attaching click listener to iframe.");

        // Handle click inside iframe B
        iframeDoc.addEventListener('click', (event: any) => {
          event.preventDefault();

          // Extract clicked element
          const clickedElement = event.target as HTMLElement;

          // Get parent elements as a string (for reference)
          let parentElements = '';
          let parent = clickedElement.parentElement;
          while (parent) {
            parentElements = `<${parent.tagName.toLowerCase()}> ` + parentElements;
            parent = parent.parentElement;
          }

          console.log("Clicked Element:", clickedElement.outerHTML);
          console.log("Parent Structure:", parentElements);

          // Store the clicked element data for iframe C
          this.selectedElementHtml = clickedElement.outerHTML;
        });

      } catch (error) {
        console.warn("Cross-origin restriction: Cannot modify iframe content.");
      }
    };
  }

  saveElement() {
    if (!this.iframeC?.nativeElement) {
      console.error("iframeC reference is not available yet.");
      return;
    }

    const iframeC = this.iframeC.nativeElement;

    // Wait for iframe C to be ready, then insert the saved element
    iframeC.onload = () => {
      try {
        const iframeCDoc = iframeC.contentDocument || iframeC.contentWindow.document;
        if (!iframeCDoc) return;

        iframeCDoc.body.innerHTML = this.selectedElementHtml; // Insert saved HTML
      } catch (error) {
        console.warn("Cross-origin restriction: Cannot modify iframe content.");
      }
    };

    // Set a blank page inside iframe C before adding content
    iframeC.srcdoc = "<html><body></body></html>";
  }

  readonly dialog = inject(MatDialog);
  open__(): void {
    const openDialogs = this.dialog.openDialogs;
    const isAlreadyOpen = openDialogs.some(dialog => dialog.componentInstance instanceof Dialogmetadata);

    if (!isAlreadyOpen) {
      const dialogRef = this.dialog.open(Dialogmetadata, {
        width: '1300px',
        maxHeight: '800px',
        data: { "comapnyName": this.companyName }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with:', result);
        if (result) {
          console.log('Dialog closed with:', result);
          this.saveMatchedResults(result);  // Save the updated matched results
        }
      });
    } else {
      console.log('Dialog already open.');
    }
  }


  // Method to save the updated matched results
  saveMatchedResults(updatedResults: any[]): void {
    // Handle saving the updated results
    console.log('Updated Matched Results:', updatedResults);
    // You can send this data to an API or perform any other required operation here
    // Step 1: Data for Sheet 1 ("Companylistdata")
    const companyListData = [
      ['Company Name', 'PermId', 'Ticker'],  // Header row
      ...updatedResults.map(row => [
        row.name,        // Company Name
        row.permId || '',  // PermId
        row.ticker || ''   // Ticker
      ])
    ];
    // Step 2: Data for Sheet 2 ("Company Info")
    const companyInfoData = [
      ['Full Company Name', this.companyName],
      ['LSEG Permanent Identifier for Company', ''],
      ['SEC Central Index Key', this.cik],
      ['Trading symbol of primary trading instrument', this.ticker],
      ['Year End Stock Price', ''],
      ['Exchange code of primary trading instrument', this.exchenge],
      ['Market Cap', ''],
      ['SIC Industry Classification Name', this.sicDescription],
      ['SIC Industry Classification Identifier Code', this.sic],
      ['Fiscal Year End Date', this.fye],
      ['Date of StreetFeeds File', ''],
      ['Date of the source document', this.proxyDate],
      ['URL Link to Inline XBRL Viewer (sec.gov)', this.proxyUrl1],
      ['Source File Name', ''],
      ['Financial Year Ending', '2024'],
      ['Share Price', '']
    ];

    // Step 3: Create worksheets from the data
    const worksheetCompanyList: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(companyListData);
    const worksheetCompanyInfo: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(companyInfoData);

    // Step 4: Create a new workbook and append both sheets
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const sheetName1 = ' Peer Group';
    const sheetName2 = 'Company Info';

    XLSX.utils.book_append_sheet(workbook, worksheetCompanyList, sheetName1);
    XLSX.utils.book_append_sheet(workbook, worksheetCompanyInfo, sheetName2);

    // Step 5: Save the Excel file with the name based on the companyName
    XLSX.writeFile(workbook, `${this.companyName}.xlsx`);
  }


  // Rajat Ranjan 20-08-2025
  getPeerGroup() {
    this.tasService.getcompanylist().subscribe({
      next: (res: any) => {
        console.log("SEC Company List:", res);

        // Example company names to search
        const inputCompanies = ['SAIA INC'];

        inputCompanies.forEach(companyName => {
          const foundCompany = res.find((c: any) => c.title.toUpperCase() === companyName.toUpperCase());

          if (foundCompany) {
            console.log(`Found company: ${foundCompany.title} | CIK: ${foundCompany.cik_str}`);

            const peers = this.getPeerGroupByCompanyName(companyName);
            console.log(`Peer group for ${companyName}:`, peers);
          } else {
            console.warn(`Company ${companyName} not found in SEC list.`);
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  peerGroupData: any = {}
  company = { name: 'Saia Inc.', ticker: 'SAIA' };  // Example company, adjust as needed
  loading = false;
  peerGroup: string[] = [];
  errorMessage: string | null = null;
  getPeerGroupByCompanyName(company: any) {
    console.log(company)
    // Call the service to fetch peer group data
    this.tasService.getPeerGroupByCompanyName(this.company.ticker).subscribe({
      next: (data) => {
        this.loading = false;
        console.log(data)
        this.extractPeerGroup(data);  // Extract peer group from the response
        console.log(this.extractPeerGroup(data))
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching peer group:', err);
        this.errorMessage = 'An error occurred while fetching peer group data.';
      }
    });
  }

  // Extract peer group companies from the data (scraped or API response)
  private extractPeerGroup(data: string) {
    // Using regex or string manipulation to extract peer group data
    const regex = /Peer companies?:.*?<tbody>(.*?)<\/tbody>/s;
    const match = regex.exec(data);
    if (match && match[1]) {
      const peerGroupHtml = match[1];
      const peerGroupNames = this.parsePeerGroupNames(peerGroupHtml);
      this.peerGroup = peerGroupNames;
      console.log("peerGroup", this.peerGroup)
    } else {
      this.errorMessage = 'Peer group table not found in the filing.';
    }
  }

  // Parse the HTML of the peer group names
  private parsePeerGroupNames(html: string): string[] {
    const peerGroupNames: string[] = [];
    const peerGroupRegex = /<tr>.*?<td>(.*?)<\/td>/g;
    let match: RegExpExecArray | null;
    while ((match = peerGroupRegex.exec(html)) !== null) {
      peerGroupNames.push(match[1].trim());
    }
    return peerGroupNames;
  }

}
