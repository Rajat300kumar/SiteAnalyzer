import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { response } from 'express';
// import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError,map,switchMap } from 'rxjs/operators';
import { FactoryService } from '../factory/factory.service';
import { rootPath } from '../../../SETTINGS.service';
// import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiValidatorService {

  http = inject(HttpClient)
  factory = inject(FactoryService)

  checkApi(url: string): Observable<boolean> {
    return this.http.get<boolean>(rootPath + '/apiChecker?url=' + encodeURIComponent(url))
      .pipe(
        map((response) => response),
        catchError(error => {
          return of(false); // Handle the error and return `false`
        })
      );
  }

  checkAllApis(apiList: string[]): any {
    const apiObservables = apiList.map(api => this.checkApi(api));
    return forkJoin(apiObservables)
  }
}
