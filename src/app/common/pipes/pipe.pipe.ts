import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Pipe({
  name: 'filter',
  standalone: true
})
export class Filter implements PipeTransform {
  transform(items: any[], searchText: string, objKey: string = ''): any[] {
    console.log(items, searchText, objKey, items.includes(searchText))
    if (!items) {
      return [];
    }
    if (!searchText?.length) {
      return items;
    }
    searchText = searchText.toLowerCase();
    if(Array.isArray(items[0])||typeof items[0] == 'string') {
      return items.filter(item => 
        // Implement your filtering logic here
        item?.toString()?.toLowerCase()?.includes(searchText)
      );
    }
    else {
      return items.filter(item => 
        // Implement your filtering logic here
        item[objKey]?.toString()?.toLowerCase()?.includes(searchText)
      );
    }
  }
}


@Pipe({ standalone: true,name: 'bypassHtmlSanitizer' })
export class BypassHtmlSanitizerPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): SafeHtml {
    console.log(html)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Pipe({ standalone: true,name: 'bypassHtmlUrlSanitizer' })
export class BypassHtmlUrlSanitizerPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): SafeHtml {
    console.log(html)
    return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }
}