import { CommonModule } from '@angular/common';
import { Component,EventEmitter,Input,OnInit, Output } from '@angular/core';
import { HttpResponse ,HttpErrorResponse, HttpEventType,} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadFilesService } from '../services/upload-files.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FactoryComponent } from '../factory/factory.component';
import { FactoryService } from '../factory/factory.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule,
    MatSnackBarModule,
    FactoryComponent,],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent implements OnInit {
  currentFile?: File;
  message: string[] = [];
  fileInfos?: Observable<any>;
  selectedFiles: File[] = [];
  successMessage: string = '';

  constructor(
    private uploadService: UploadFilesService,
    private snackBar: MatSnackBar,
    public factory: FactoryService,
  ) { }

  ngOnInit(): void {
    // this.fileInfos = this.uploadService.getFiles();
    // this.selectedFiles = event.target.files;
  }

  @Input() folder: string = ''

  selectFiles(event: any): void {
    console.log(event.target.files, Array.from(event.target.files))
      this.selectedFiles = Array.from(event.target.files);
  }
  uploadFiles(): void {

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(this.selectedFiles[i]);
      }
    }
  }
  // upload(file: File): void {
  //   console.log('Start uploading file:', file.name);
  //   if (file) {
  //     this.uploadService.upload(file).subscribe({
  //       next: (event: any) => {
  //         console.log('Upload event:', event);
  //         if (event.type === HttpEventType.UploadProgress) {
  //           // Handle progress
  //         } else if (event instanceof HttpResponse) {
  //           console.log('Upload success:', event);
  //           const msg = file.name + ": Uploaded successfully!";
  //           //this.successMessage = msg;

  //           window.alert(msg);
  //           console.log(msg);
  //         }
  //       },
  //       error: (err: any) => {
  //         console.error('Upload error:', err);
  //         let msg = file.name + ": Upload failed!";
  //         if (err instanceof HttpErrorResponse) {
  //           if (err.error && err.error.message) {
  //             msg += " " + err.error.message;
  //           }
  //         }
  //         console.error(msg);
  //       }
  //     });
  //   }
  // }
  @Output() done = new EventEmitter()
  upload(file: File): void {
    if (file.type !== 'application/pdf') {
      this.factory.tasAlert('File format not valid. Please upload a PDF file', 'warning', 2000 )
      return;
    }
    console.log('%csrc/app/file-upload/file-upload.component.ts:85 file 11111', 'color: #007acc;', file);
    this.uploadService.upload(file, this.folder).subscribe(
      (res) => {
        console.log('%csrc/app/file-upload/file-upload.component.ts:88 res', 'color: #007acc;', res);
        this.factory.tasAlert('File uploaded successfully', 'success',  2000)
        this.done.emit(true)
      },
      error => {
        console.error('Upload failed:', error);
        this.factory.tasAlert('Upload failed','error', 2000)
      }
    );
  }

  getFileUrl(fileName: string): string {
    return this.uploadService.getFileUrl(fileName);
  }
}
