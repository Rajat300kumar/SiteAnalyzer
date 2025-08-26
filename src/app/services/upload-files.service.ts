import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { json } from 'stream/consumers';

@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {
  //  private baseUrl="http://localhost:3001";

  constructor(private http: HttpClient) { }

  upload(file: File, folder: string): Observable<object> {
    const formData: FormData = new FormData();
    console.log('%csrc/app/services/upload-files.service.ts:15 file', 'color: #007acc;', file);
    formData.append('myDoc', file);


    // const req = new HttpRequest('POST', '/upload', formData, {
    //   reportProgress: true,
    //   responseType: 'json'
    // });
    // return this.http.request(req);
    return this.http.post('/upload?folder=' + folder + '&filename=' + file.name, formData)
  }
  uploadMultiple_(files: File[], folder: string): Observable<object> {
    const formData: FormData = new FormData();
    files.forEach(file => {
      formData.append('myDocs', file, file.name);
    });

    return this.http.post(`/upload?folder=${folder}`, formData);
  }

  uploadMultiple(files: File[], folder: string): Observable<object[]> {
    var count = files.length
    console.log("count", count)
    const uploadObservables: Observable<object>[] = files.map(file => {
      const formData: FormData = new FormData();
      console.log('%cFile:', 'color: #007acc;', file);
      count--
      console.log("count", count)
      formData.append('myDoc', file);
      return this.http.post(`/upload?folder=${folder}&filename=${file.name}`, formData);
    });
    console.log("uploadObservables", uploadObservables, "\n", forkJoin(uploadObservables))

    // Use forkJoin to wait for all upload requests to complete
    return forkJoin(uploadObservables);
  }
  getFiles(): Observable<any> {
    return this.http.get<any>('/files');
  }
  getFileUrl(fileName: string): string {
    return `/files/${fileName}`;
  }
}
