import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FactoryService } from '../factory/factory.service';
import { rootPath } from '../../../SETTINGS.service';
interface SecSubmission {
  exchanges: any;
  tickers: any;
  name: string;
  cik: string;
  companyName: string;
  sic: string;
  sicDescription: string;
  stateOfIncorporation: string;
  stateOfOrigin: string;
  fiscalYearEnd: string;
  filings: {
    recent: {
      form: string[];
      accessionNumber: string[];
      filingDate: string[];
      primaryDocument: string[];
    }
  };
}
@Injectable({
  providedIn: 'root'
})
export class TasService {
  httpClient = inject(HttpClient)
  factory = inject(FactoryService)
  apiURL = rootPath + '/api/ag-grid';


  getSecSubmission(cik: string): Observable<SecSubmission> {
    // Make sure CIK has leading zeros (10 digits) if needed
    const paddedCik = cik.padStart(10, '0');
    const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
    console.log("url", url)
    return this.httpClient.get<SecSubmission>(url);
  }
  getcompanylist() {
    const url = 'https://www.sec.gov/files/company_tickers.json';
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    return this.httpClient.get(proxyUrl + url);
  }
  // Example function to fetch peer group dynamically using OpenPermID API (mocked)
  fetchPeerGroupFromAPI(ticker: string): Observable<any> {
    // Replace with real API endpoint and your API key
    const apiUrl = `https://api.openpermID.com/peer-group?ticker=${ticker}&apikey=YOUR_API_KEY`;
    return this.httpClient.get(apiUrl);
  }
  // Function to get peer group by company ticker
  getPeerGroupByCompanyName(ticker: string): Observable<any> {
    const url = `https://finance.yahoo.com/quote/${ticker}/profile`;  // URL for Yahoo Finance profile page
    return this.httpClient.get(url, { responseType: 'text' });
  }


  saveData(data: any) {
    return this.httpClient.post<{ message: string }>('/save-data', data);
  }

  getStock(pd: object) {
    console.log("httpClient", pd)
    return this.httpClient.post('/stock', pd);
  }
  //It is method of GET
  getAll(): Observable<object> {
    // console.log("APIURL",this.apiURL)
    let ab = this.httpClient.get(`${this.apiURL}`)
    console.log("DATA", ab)
    return ab
  }
  user = 'TAS - UI';
  data = ''
  ajax_request(post_data: any, method: any): Observable<object> {
    var default_data = { 'user_id': this.user }

    if (post_data['cmd_id'] != 1)
      post_data = Object.assign(post_data, default_data);
    // console.log('CGI', JSON.stringify(post_data));
    this.data = JSON.stringify(post_data);
    var url = '/post_method';
    if ('post_path' in post_data)
      url = '/post_method_doc'
    if (post_data['post_path'] == 'writeFavicon') url = rootPath + '/writeFavicon'

    if (!method) {
      method = 'POST';
    }
    if (method == 'GET') {
      url = '/get_method';
    }
    if (method == 'LOGIN') {
      method = 'POST';
      url = '/login_post';
    }

    if ('pst_rd' in post_data)
      url = post_data['pst_rd']

    if ('post_path' in post_data)
      delete post_data['post_path']
    const params = new HttpParams()
      .set('full_data', this.data)
    // .set('method', method);
    this.factory.showLoader()
    return this.httpClient.post(url, { params }, {})
    /* if(!('no_ps' in post_data)){
      pss_idx = pss_idx+1;
      $root
    } */
  }

  postCall(url: string, data: any): Observable<object> {
    this.data = JSON.stringify(data);
    // const params = new HttpParams()
    // .set('full_data', this.data)
    this.factory.showLoader()
    return this.httpClient.post(url, data, {})
  }

  // In your dataService
  post(method: any, data: any): Observable<any> {
    console.log("method", method, "data", data)
    return this.httpClient.post<any>(method, data)
  }

  //   post_option(method: any, data: any, options: any = {}): Observable<any> {
  //     console.log("method", method, "data", data, "options", options);
  //     return this.httpClient.post<any>(method, data, options);
  // }
  post_option(method: string, data: any, options: any = {}): Observable<any> {
    console.log("method", method, "data", data, "options", options);
    const token = localStorage.getItem('token'); // or from AuthService
    console.log("token", token)
    const defaultOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Expect JSON
      })
    };
    const mergedOptions = { ...defaultOptions, ...options };
    return this.httpClient.post<any>(method, data, mergedOptions);
  }

  webapi(pd: any): Observable<any> {
    console.log("webapi Method", "url", pd)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(pd['method'], { params: pd, headers })
  }

  postDataapi(pd: any): Observable<any> {
    console.log("webapi Method", "url", pd)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(pd['method'], { params: pd, headers })
  }

  apiCall(url: string): Observable<object> {
    this.factory.showLoader()
    url = rootPath + '/requestObject?url=' + encodeURIComponent(url)
    // console.log('%csrc/app/services/data-service.service.ts:73 url', 'color: #007acc;', url);
    return this.httpClient.get<any[]>(url)
  }

  api_pdglist(url: string) {
    return this.httpClient.post(url, {}); // ✅ Make a POST request
  }
}
