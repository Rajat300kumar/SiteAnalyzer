import { Injectable } from "@angular/core";

export const PORT = '1010'
export const TITLE = 'TAS Company'
export const ICON = `<svg width="26" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect ry="2" rx="2" height="24" width="26" x="0" y="0" style="fill:#FFAC47;stroke:black;stroke-width:0"></rect>
    <rect x="7" y="6" rx="0" ry="0" width="12" height="12" style="fill:#fff;stroke:black;stroke-width:0"></rect>
    <rect x="10" y="9" rx="0" ry="0" width="6" height="6" style="fill:#FFAC47;stroke:black;stroke-width:0"></rect>
    <rect x="11.5" y="10.5" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
    <rect x="3" y="6" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
    <rect x="7" y="3" rx="0" ry="0" width="3" height="4" style="fill:#fff;stroke:black;stroke-width:0"></rect>
    <rect x="20" y="15" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
    <rect x="16" y="18" rx="0" ry="0" width="3" height="3" style="fill:#fff;stroke:black;stroke-width:0"></rect>
</svg>`

export const folderPaths = {
  varWwwHtml: '/var/www/html/'
}

export const rootPath = ''

@Injectable({
  providedIn: 'root'
})
export class APIConfig {

  apiList = {
    mandatory: {
      gridAPI: 'http://172.16.20.242',
      dataAPI: 'http://localhost:9988',
      // dataAPI: 'http://localhost:6127',
      docAPI: 'http://172.16.20.125',
      // gridAPI: 'http://172.16.20.241:9098',
      // documentAPI: 'http://172.16.20.241:1600'
      authAPI: `https://172.16.20.241:8010`
    },
    optional: {
      documentAPI: 'https://172.16.20.241:8010',
      uploadAPI: 'http://172.16.20.241:9099',
    }
  }

  authenticationAPI(username: string, password: string) {
    var path = `/authenticate?uname=${username}&upass=${password}`
    return this.apiList.mandatory.authAPI + path
  }

  // To call api from server to avoid cross origin error
  gridDataURL() {
    var path = '/misc/output.json'
    return this.apiList.mandatory.gridAPI + path
  }
  dataAPI(docid: string, pno: string) {
    var path = '/dataAPI'
    var query = '?docid=' + docid + '&pno=' + pno
    return this.apiList.mandatory.dataAPI + path + query
  }
  // docAPI(docid: string) {
  //     var path = `/getDataPDF?${encodeURIComponent('http://172.16.20.125/documentstore/input/docs/'+docid+'/srcdoc/'+docid+'.pdf')}#zoom=page-width`
  //     // var path = `http://172.16.20.125/documentstore/input/docs/${docid}/srcdoc/${docid}.pdf`
  //     return /* this.apiList.mandatory.docAPI + */ path
  // }
  docAPI(docid: string, pno: string) {
    var path = rootPath + '/getDataPDF?' + encodeURIComponent(`http://172.16.20.120:9098/getpdfpage2?projid=10099&docid=${docid}&pgno=${pno}`) + '#zoom=page-width'
    // var path = `http://172.16.20.125/documentstore/input/docs/${docid}/srcdoc/${docid}.pdf`
    return /* this.apiList.mandatory.docAPI + */ path
  }
  fmtAPI(docid: string, p: string) {
    return rootPath + `/request?http://172.16.20.120:9098/get_formatDisplay?projid=10099&docid=${docid}&pgno=${p}`
  }
  getPageNo(docid: string) {
    return `http://localhost:9988/dataAPI?docid=${docid}&get=pages`
    // return `http://localhost:6127/dataAPI?docid=${docid}&get=pages`
  }

  projectURL() {
    var path = '/projects'
    return this.apiList.optional.documentAPI + path
  }
  batchURL() {
    var path = '/batchview'
    return this.apiList.mandatory.gridAPI + path
  }
  documentviewURL(batchid: number) {
    var path = '/documentview'
    var queryParams = `?batchid=${batchid}`
    return this.apiList.mandatory.gridAPI + path + queryParams
  }
  groupviewURL(batchid: number) {
    var path = '/groupview'
    var queryParams = `?batchid=${batchid}`
    return this.apiList.mandatory.gridAPI + path + queryParams
  }
  dashboardURL() {
    var path = '/dashboard'
    return this.apiList.mandatory.gridAPI + path
  }
  dataviewGridURL(groupid: any) {
    var path = '/dataview'
    var queryParams = `?groupid=${groupid}`
    return this.apiList.mandatory.gridAPI + path + queryParams
  }

  serverDocumentPath = rootPath + '/getData'
  getDoc(type: string, projid: string, docid: string, pgno: string) {
    var get
    if (type == 'html') get = 'newblockhtmlintf'
    else if (type == 'pdf') get = 'pdfpage'
    var queryParams = `?projid=${projid}&docid=${docid}&pgno=${pgno}&get=${get}`
    return this.apiList.optional.documentAPI + this.serverDocumentPath + queryParams
  }

  uploadFilesURL(folder: any, filename: any) {
    var uploadFilesPath = '/uploadfile'
    var queryParams = `?compname=${folder}&filename=${filename}`
    return this.apiList.optional.uploadAPI + uploadFilesPath + queryParams
  }
}

export const apiList = Object.values((new APIConfig()).apiList.mandatory)
