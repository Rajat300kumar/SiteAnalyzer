import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { rootPath } from '../../../SETTINGS.service';

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {
  httpClient = inject(HttpClient)
  apiURL = rootPath+'/api/ag-grid';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    },)
  }
  //It is method of GET
  getAll(): Observable<object> {
    console.log("APIURL",this.apiURL)
    let ab = this.httpClient.get(`${this.apiURL}`)
    console.log("DATA",ab)
    return ab
  }
}
