import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FactoryComponent } from "./factory/factory.component";
import { ApiValidatorService } from './services/api-validator.service';
import { apiList, rootPath } from '../../SETTINGS.service';
import { FactoryService } from './factory/factory.service';
import { TasService } from './services/data-service.service';
import { timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, CommonModule, FormsModule, FactoryComponent]
})
export class AppComponent {
  apiValidator = inject(ApiValidatorService);
  factory = inject(FactoryService);
  tasService = inject(TasService)
  httpClient = inject(HttpClient)

  svg: string = ''
  icons: any
  writeFavicon(svg: string) {
    var name = 'favicon.svg'
    this.tasService.postCall(rootPath + '/writeFavicon', { name: name, svg: svg }).subscribe((res: any) => {
      this.factory.hideLoader()
      this.icons = res.icons
      this.changeFavicon(name)
      console.log('%csrc/app/app.component.ts:45 res', 'color: #007acc;', res, this.icons);
    })
  }
  changeFavicon(icon: string) {
    var favicon = document.querySelector('#favicon');
    console.log('%csrc/app/app.component.ts:39 favicon,', 'color: #007acc;', favicon, icon, (favicon as HTMLLinkElement).href);
    (favicon as HTMLLinkElement).href = 'assets/blank.svg'
    timer(1).subscribe(() => (favicon as HTMLLinkElement).href = rootPath + '/getFavicon?icon=' + icon)
  }

  ngOnInit() {
    // Call the API validation before proceeding with login
    this.factory.showLoader()
    this.apiValidator.checkAllApis(apiList).subscribe({
      next: (results: any) => {
        this.factory.hideLoader()
        console.log('All API results:', results, results.includes(false), sessionStorage['user_id']);
        if (results.includes(false)) {
          console.log('%cerror src/app/app.component.ts line:33 Api Services not running', 'color: red; display: block; width: 100%;',);
          // this.factory.tasAlert('Api Services not running', 'error');
        } else {
          console.log('ALL APIs WORKING');
          if (!sessionStorage['user_id']) this.factory.logout_func()
        }
      },
      error: (error: any) => {
        console.error('Error in forkJoin:', error);
      },
    });
  }
}
