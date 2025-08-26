import { Renderer2, Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service'
@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [PdfJsViewerModule, CommonModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnChanges {
  @Input() pdfSrc: any; // Input for PDF source
  @ViewChild('pdfViewerOnDemand', { static: false }) pdfViewerOnDemand!: any;
  // @ViewChild('pdfViewerOnDemand', { static: false }) pdfViewerOnDemand!: ElementRef;
  private canvasElement!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  loadPdfViewer: boolean = false; // Controls the visibility of the PDF viewer
  constructor(public loader: LoaderService, private renderer: Renderer2) { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("Config PDF:", this.pdfSrc.pdf, changes);  // Log the full URL
    // return
    if (changes['pdfSrc'].currentValue.activeTab === "pdf" && this.pdfSrc) {
      const pdfPath = decodeURIComponent(this.pdfSrc.pdf);  // Decode if necessary
      console.log("Decoded PDF Path:", pdfPath);

      // Fetch the PDF as a Blob
      fetch(pdfPath)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob); // Create a Blob URL
          if (this.pdfViewerOnDemand) {
            console.log("this.pdfViewerOnDemand", this.pdfViewerOnDemand)
            this.pdfViewerOnDemand.pdfSrc = blobUrl;  // Use the Blob URL as the PDF source
            this.pdfViewerOnDemand.refresh();  // Refresh the viewer with the Blob URL
            // console.log("this.pdfViewerOnDemand", this.pdfViewerOnDemand.iframe, "finef pdf", changes['pdfSrc'].currentValue.ref[0].hasOwnProperty('bbox'),"find error ",changes['pdfSrc'].currentValue.ref[0])
            setTimeout(() => {
              const iframe = this.pdfViewerOnDemand.iframe.nativeElement as HTMLIFrameElement;
              console.log("Iframe Element:", iframe);

              if (iframe) {
                this.createCanvasOverlay(iframe);
                if (!changes['pdfSrc'].currentValue.ref[0].hasOwnProperty('bbox'))
                  return
                else if (changes['pdfSrc'].currentValue.ref[0].bbox[2] != 0)
                  this.highlightTextInPdf(iframe, changes['pdfSrc'].currentValue);
                else
                  return console.log("No bbox is present")
              }
            }, 800); // Delay to ensure the iframe loads the PDF
          }
        })
        .catch(error => console.error('Error fetching PDF:', error));
    }
  }

  // Highlighting text on the canvas using bbox values

  highlightTextInPdf(iframe: HTMLIFrameElement, item: any) {
    console.log("item", item, "\n", iframe)
    console.log("item ref", item.ref[0], "\n", item.ref[0].bbox)
    // return
    var arr_bboxrwdt: any
    const bboxs: any[][] = []; // To store all bounding boxes

    // Convert strings to numbers and process each bounding box
    item.ref[0].bbox.forEach((bbox: any) => {
      // Convert strings to numbers
      const [x1, y1, x2, y2] = bbox.map((coord: any) => parseFloat(coord));

      // Calculate w, x, y, z
      const w = x1;
      const x = y1;
      const y = x2 - x1;
      const z = y2 - y1;

      // Store in arraybf
      const arraybf = [];
      arraybf.push(w, x, y, z);

      // Push to bboxs
      bboxs.push(arraybf);

      // Log the result
      console.log("arraybf", arraybf);
    });
    // Final bboxs array
    console.log("bboxs", bboxs);
    const pbox = item.ref[0].coord; // Page dimensions
    const className = "highlight-box";
    var bg = 'rgba(243, 230, 88, 0.3)'
    var border = '2px solid rgb(244, 67, 54)'
    const page_ = item.ref[0].p; // Page number
    var flag = true
    this.highlightsbbox_withclass(iframe, bboxs, pbox, className, flag, bg, border, page_);
  }

  highlightsbbox_withclass(iframe: HTMLIFrameElement, bboxs: any, pbox: any, className: string, flag: boolean, bg: string, border: string, page: any) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    console.log("iframeDoc", iframeDoc, "page", page)
    if (iframeDoc) {
      // Select the canvas corresponding to the PDF page
      // const canvas = iframeDoc.querySelector(`.page[data-page-number="${page}"] canvas`);
      // Step 1: Find the target PDF page
      const targetPage = iframeDoc.querySelector(`.page[data-page-number="${page}"]`);

      if (!targetPage) {
        console.error(`Page ${page} not found in the iframe.`);
        return;
      }
      // Step 2: Scroll to the target page
      targetPage.scrollIntoView({ behavior: "smooth", block: "center" });
      // Step 3: Wait for the canvas to render (asynchronous rendering support)
      const checkCanvas = setInterval(() => {
        const canvas = targetPage.querySelector("canvas");
        if (canvas) {
          clearInterval(checkCanvas);
          console.log(`Canvas found for page ${page}. Adding highlights.`);

          const canvasContainer = canvas.parentElement;
          if (canvasContainer) {
            // Remove previous highlights to avoid duplication
            canvasContainer.querySelectorAll(`.${className}`).forEach((el) => el.remove());

            // Destructure pbox dimensions
            const [pboxX, pboxY, pboxWidth, pboxHeight] = pbox;

            // Add highlights for each bounding box
            bboxs.forEach((bbox: any, index: number) => {
              const [x, y, width, height] = bbox;

              // Calculate positions and dimensions relative to the pbox
              const left = (x / pbox[2]) * canvasContainer.clientWidth;
              const top = (y / pbox[3]) * canvasContainer.clientHeight;
              const boxWidth = (width / pbox[2]) * canvasContainer.clientWidth;
              const boxHeight = (height / pbox[3]) * canvasContainer.clientHeight;

              // Create a highlight div
              const highlightDiv = document.createElement('div');
              highlightDiv.className = className;
              highlightDiv.style.position = 'absolute';
              highlightDiv.style.left = `${left}px`;
              highlightDiv.style.top = `${top - 1}px`;
              highlightDiv.style.width = `${boxWidth}px`;
              highlightDiv.style.height = `${boxHeight}px`;
              highlightDiv.style.background = bg;
              highlightDiv.style.border = border;
              highlightDiv.style.pointerEvents = 'none'; // Ensure it doesn't interfere with interactions

              // Append the highlight to the canvas container
              canvasContainer.appendChild(highlightDiv);
              // Scroll to the first highlight added
              if (index === 0) {
                highlightDiv.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              console.log(`Highlight added for bbox ${index + 1} on page ${page}`);
            });
          }
        }
      }, 100); // Polling interval to wait for the canvas to render

    }
  }
  // this.highlightsbbox_withclass(iframe, bboxs, pbox, className, true, bg, border, page);

  private createCanvasOverlay(iframe: HTMLIFrameElement): void {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error("Unable to access iframe document.");
      return;
    }

    const pdfContainer = iframeDoc.body.querySelector('div'); // PDF container
    console.log("[pdf]", pdfContainer)
    if (pdfContainer) {
      const { width, height } = pdfContainer.getBoundingClientRect();
      console.log("[pdf] width Height", width, height, "\n", pdfContainer.getBoundingClientRect())
      // Create the canvas
      this.canvasElement = this.renderer.createElement('canvas');
      this.renderer.setStyle(this.canvasElement, 'position', 'absolute');
      this.renderer.setStyle(this.canvasElement, 'top', '0');
      this.renderer.setStyle(this.canvasElement, 'left', '0');
      this.renderer.setStyle(this.canvasElement, 'z-index', '100');
      this.renderer.setStyle(this.canvasElement, 'pointer-events', 'auto');
      this.renderer.setStyle(this.canvasElement, 'display', 'block')
      this.renderer.setStyle(this.canvasElement, 'cursor', 'crosshair')
      this.renderer.setAttribute(this.canvasElement, 'width', `${width}`);
      this.renderer.setAttribute(this.canvasElement, 'height', `${height}`);

      this.ctx = this.canvasElement.getContext('2d')!;
      pdfContainer.appendChild(this.canvasElement);
      // Add Buttons
      const saveButton = this.renderer.createElement('button');
      const cancelButton = this.renderer.createElement('button');
      this.renderer.setStyle(saveButton, 'position', 'absolute');
      this.renderer.setStyle(cancelButton, 'position', 'absolute');
      this.renderer.setStyle(saveButton, 'top', `${height + 10}px`);
      this.renderer.setStyle(cancelButton, 'top', `${height + 10}px`);
      this.renderer.setStyle(saveButton, 'left', '10px');
      this.renderer.setStyle(cancelButton, 'left', '80px');
      this.renderer.setStyle(saveButton, 'z-index', '200');
      this.renderer.setStyle(cancelButton, 'z-index', '200');
      saveButton.innerText = 'Save';
      cancelButton.innerText = 'Cancel';

      pdfContainer.appendChild(saveButton);
      pdfContainer.appendChild(cancelButton);

      this.addCanvasEventListeners(saveButton, cancelButton);
      // this.addCanvasEventListeners();
    }
  }
  private addCanvasEventListeners(saveButton: HTMLButtonElement, cancelButton: HTMLButtonElement): void {
    let startX = 0;
    let startY = 0;
    let isDrawing = false;
    let annotation: { x: number; y: number; width: number; height: number } | null = null;

    this.canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
      isDrawing = true;
      const rect = this.canvasElement.getBoundingClientRect();
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
    });

    this.canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
      if (!isDrawing) return;

      const rect = this.canvasElement.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      // Clear canvas and draw rectangle
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);

      // Save annotation details temporarily
      annotation = {
        x: startX,
        y: startY,
        width: currentX - startX,
        height: currentY - startY,
      };
    });

    this.canvasElement.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Save Button Click
    saveButton.addEventListener('click', () => {
      if (annotation) {
        const pageBBox = '0_0_599_844'; // Example page bounding box
        const pdfBBox = this.convertToPdfCoordinates(annotation, pageBBox);
        console.log('Saved PDF Bounding Box:', pdfBBox);

        // Send to backend or handle the saved annotation
        // this.dataService.saveAnnotation({ bbox: pdfBBox }).subscribe();

        this.clearCanvas(); // Optional: Clear after saving
      } else {
        console.error('No annotation to save.');
      }
    });

    // Cancel Button Click
    cancelButton.addEventListener('click', () => {
      this.clearCanvas();
      annotation = null;
      console.log('Annotation cancelled.');
    });
  }

  private convertToPdfCoordinates(annotation: { x: number, y: number, width: number, height: number }, pageBBox: string): string {
    const [pdfX0, pdfY0, pdfX1, pdfY1] = pageBBox.split('_').map(Number);
    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const pdfWidth = pdfX1 - pdfX0;
    const pdfHeight = pdfY1 - pdfY0;

    const x0 = (annotation.x / canvasWidth) * pdfWidth + pdfX0;
    const y0 = (annotation.y / canvasHeight) * pdfHeight + pdfY0;
    const x1 = ((annotation.x + annotation.width) / canvasWidth) * pdfWidth + pdfX0;
    const y1 = ((annotation.y + annotation.height) / canvasHeight) * pdfHeight + pdfY0;

    return `${x0.toFixed(1)}_${y0.toFixed(1)}_${x1.toFixed(1)}_${y1.toFixed(1)}`;
  }


  private redrawCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.ctx.beginPath();
    this.ctx.rect(
      Math.min(this.startX, this.currentX),
      Math.min(this.startY, this.currentY),
      Math.abs(this.currentX - this.startX),
      Math.abs(this.currentY - this.startY)
    );
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private addButtons(bbox: { x: number; y: number; width: number; height: number }): void {
    const saveButton = this.renderer.createElement('button');
    const cancelButton = this.renderer.createElement('button');
    this.renderer.setStyle(saveButton, 'position', 'absolute');
    this.renderer.setStyle(saveButton, 'top', `${bbox.y}px`);
    this.renderer.setStyle(saveButton, 'left', `${bbox.x + bbox.width + 10}px`);
    this.renderer.setStyle(saveButton, 'z-index', '200');
    this.renderer.setProperty(saveButton, 'innerText', 'save');
    this.renderer.setStyle(cancelButton, 'position', 'absolute');
    this.renderer.setStyle(cancelButton, 'top', `${bbox.y}px`);
    this.renderer.setStyle(cancelButton, 'left', `${bbox.x + bbox.width + 60}px`);
    this.renderer.setStyle(cancelButton, 'z-index', '200');
    this.renderer.setProperty(cancelButton, 'innerText', 'Cancel');

    this.renderer.listen(saveButton, 'click', () => {
      console.log('Saved annotation with bbox:', bbox);
      const scale = 1.5; // Example scale factor
      const BBox = this.convertToOldBBox(bbox, scale);

      console.log("BBox", BBox); // Outputs: "142.0_211.0_380.0_225.0"
      this.clearCanvas();
      saveButton.remove();
      cancelButton.remove();
    });

    this.renderer.listen(cancelButton, 'click', () => {
      this.clearCanvas();
      saveButton.remove();
      cancelButton.remove();
    });

    this.renderer.appendChild(this.canvasElement.parentElement, saveButton);
    this.renderer.appendChild(this.canvasElement.parentElement, cancelButton);
  }
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  // Enable drawing mode (pointer-events and cursor change)
  enableDrawing() {
    this.renderer.setStyle(this.canvasElement, 'pointer-events', 'all'); // Allow interaction
    this.renderer.setStyle(this.canvasElement, 'cursor', 'crosshair'); // Set cursor to crosshair
  }

  // Disable drawing mode (pointer-events set to 'none')
  disableDrawing() {
    this.renderer.setStyle(this.canvasElement, 'pointer-events', 'none'); // Disable interaction
    this.renderer.setStyle(this.canvasElement, 'cursor', 'default'); // Reset cursor to default
  }
  convertToOldBBox(newBBox: { x: number, y: number, width: number, height: number }, scale: number): string {
    const x1 = newBBox.x / scale;
    const y1 = newBBox.y / scale;
    const x2 = (newBBox.x + newBBox.width) / scale;
    const y2 = (newBBox.y + newBBox.height) / scale;

    return `${x1.toFixed(1)}_${y1.toFixed(1)}_${x2.toFixed(1)}_${y2.toFixed(1)}`;
  }


}
