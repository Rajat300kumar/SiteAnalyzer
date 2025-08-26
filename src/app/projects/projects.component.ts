import { Component, OnInit, inject } from '@angular/core';
import { AGGridConfig, AgGridComponent } from "../ag-grid/ag-grid.component";
import { FactoryService } from '../factory/factory.service';
import { BypassHtmlSanitizerPipe } from "../services/pipe.pipe";
import { timer } from 'rxjs';
import { APIConfig } from '../../../SETTINGS.service';
import { TasService } from '../services/data-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [AgGridComponent, BypassHtmlSanitizerPipe],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {

  factory = inject(FactoryService)
  tasService = inject(TasService)
  apiConfig = inject(APIConfig)
  router = inject(Router)

  title = 'Title'
  icon = `<svg width="26" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect ry="2" rx="2" height="24" width="26" x="0" y="0" style="fill:#FFAC47;stroke:black;stroke-width:0"></rect>
      <rect x="7" y="6" rx="0" ry="0" width="12" height="12" style="fill:#fff;stroke:black;stroke-width:0"></rect>
      <rect x="10" y="9" rx="0" ry="0" width="6" height="6" style="fill:#FFAC47;stroke:black;stroke-width:0"></rect>
      <rect x="11.5" y="10.5" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
      <rect x="3" y="6" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0">
      </rect>
      <rect x="7" y="3" rx="0" ry="0" width="3" height="4" style="fill:#fff;stroke:black;stroke-width:0">
      </rect>
      <rect x="20" y="15" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
      <rect x="16" y="18" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
  </svg>`

  projectsGrid: AGGridConfig = {
    columnDefs: [],
    rowData: [],
    gridOptions: {},
    defaultColDef: {},
    flags: {},
  };

  ngOnInit() {
    console.log('%cHello src/app/projects/projects.component.ts:47 ', 'background: green; color: white; display: block;');
    // var pd = {
    //   symbols: ["TCS.NS"],
    //   range: "YTD",
    //   reportType: "price",
    //   movingAverages: [20]
    // }
    var pd = {
      "symbols": ["TCS.NS"],
      "range": "YTD",
      "reportType": "price",
      "movingAverages": ["SMA20"]
    }

    console.log("pd", pd)

    this.tasService.getStock(pd).subscribe({
      next: (res: any) => { console.log(res) },
      error: (err) => { console.log(err) }
    })
  }

  getProject() {
    // console.log('%csrc/app/review/review.component.ts:109 this.router.lastSuccessfulNavigation() REVIEW', 'color: #007acc;', this.router.lastSuccessfulNavigation, this.router.lastSuccessfulNavigation?.extras.state?.['data']);
    // timer(1000).subscribe(()=>this.tasService.apiCall(this.apiConfig.dataAPI(this.router.lastSuccessfulNavigation?.extras.state?.['data'].col4)).subscribe({
    //   next: (res: any) => {
    //     console.log('%csrc/app/services/data-service.service.ts:56 res', 'color: #007acc;', res);
    //     this.factory.hideLoader()
    //     res.data.coldef.at(-1).cellRenderer = (params: any) => '<i class="fa fa-chevron-right"></i>'
    //     res.data.coldef.at(-1).onCellClicked =  (params: any) => this.router.navigate(['dashboard'], { state: { data: params.data } }),
    //     this.projectsGrid = {
    //       columnDefs: [...res.data.coldef/* , {
    //         field: 'review',
    //         headerName: 'Review',
    //         width: '80px',
    //         suppressSizeToFit: true,
    //         filter: false,
    //         // add icon
    //         cellRenderer: (params: any) => !(params.rowIndex%2) ? '<i class="fa fa-chevron-right"></i>' : '',
    //         onCellClicked: (params: any) => {
    //           // route to review component and send data
    //           return !(params.rowIndex%2) ? this.router.navigate(['dashboard'], { state: { data: params.data } }) : 0
    //         },
    //         // center icon
    //         cellStyle: (params: any) => {
    //           return !(params.rowIndex%2) ? {
    //             'height': '63px',
    //             'background-color': 'white',
    //             'display': 'flex',
    //             'align-items': 'center',
    //             'justify-content': 'center',
    //             'cursor': 'pointer'
    //           } : {}
    //         },
    //         rowSpan: (params:any) => !(params.node.rowIndex%2) ? 2 : 1,
    //       } */],
    //       rowData: res.data.rows,
    //       gridOptions: {},
    //       defaultColDef: {
    //         suppressSizeToFit: false,
    //         // cellRenderer: (params: any) => params.value.v
    //       },
    //       flags: {
    //         id: 'dataview',
    //         filter: true,
    //         sizeColumnsToFit: true
    //       },
    //     }
    //   },
    //   error: (error: any) => {
    //     console.log('ERROR',error);
    //     this.factory.hideLoader()
    //     this.factory.tasAlert('There was an error in retrieving data from the server', 'error', 2000)
    //   }
    // })
    // )
  }

}
