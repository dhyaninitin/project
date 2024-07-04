import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-image-resize',
  templateUrl: './image-resize.component.html',
  styleUrls: ['./image-resize.component.scss'],
})
export class ImageResizeComponent {
  copiedImageData: any;
  imageWidth!: number;
  imageHeight!: number;
  imageNotResized: boolean = true;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<ImageResizeComponent>
  ) {}

  insertImage() {
    const insertImageButton = document.querySelector(
      '#insertImageButton'
    ) as HTMLElement;
    insertImageButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();
      input.addEventListener('change', () => {
        const file = input.files![0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.addEventListener('load', () => {
            const img = document.createElement('img');
            img.src = reader.result as string;
            img.classList.add('resized-image');
            const insertedImage = document.getElementById('insertedImage');
            if (insertedImage !== null) {
              insertedImage.innerHTML = ''; // Clear the existing content
              insertedImage.appendChild(img);
            }
          });
        }
      });
    });
  }

  resizeImage() {
    const insertedImage = document.getElementById('insertedImage');
    if (insertedImage) {
      const img = insertedImage.querySelector('img');
      if (img) {
        if(this.imageWidth && this.imageHeight) {
          img.style.width = this.imageWidth + 'px';
          img.style.height = this.imageHeight + 'px';
          this.imageNotResized = false;
        }else {
          this.snackBar.open('Set width & height first to resize image !', 'Cancel', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      }else{
        this.snackBar.open('There is no image to resize !', 'Cancel', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    }
  }

  copyImage() {
    const insertedImage = document.getElementById('insertedImage');
    if (insertedImage) {
      const img = insertedImage.querySelector('img');
      if (img) {
        const copiedImage = new Image();
        copiedImage.src = img.src;
        copiedImage.style.width = this.imageWidth + 'px';
        copiedImage.style.height = this.imageHeight + 'px';

        const canvas = document.createElement('canvas');
        canvas.width = this.imageWidth;
        canvas.height = this.imageHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(copiedImage, 0, 0, this.imageWidth, this.imageHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]);
            }
          }, 'image/png');
        }
        this.snackBar.open('Image copied to clipboard', 'Cancel', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.imageNotResized = true;
        this.dialog.close();
      }
    }
  }
}
