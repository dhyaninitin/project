import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class ImageLoadService {
  constructor() {}

  loadImage(imagePath: string): Observable<any> {
    return Observable.create(function(observer) {
      if (!imagePath) {
        observer.next(true);
      }
      const img = new Image();
      img.onload = function() {
        observer.next(img);
      };
      img.src = imagePath;
      img.onerror = function(err) {
        observer.next(true);
      };
    });
  }

  loadImageWithSrcset(imagePath: string, sizes: string): Observable<any> {
    return Observable.create(function(observer) {
      if (!imagePath) {
        observer.next(true);
      }
      const img = new Image();
      img.onload = function() {
        observer.next(img);
      };
      img.setAttribute('sizes', sizes);
      img.setAttribute('srcset', imagePath);
      img.onerror = function(err) {
        observer.next(true);
      };
    });
  }

  loadImages(imagePaths: string[]) {
    const images: Array<Observable<any>> = [];
    imagePaths.forEach(imagePath => {
      images.push(this.loadImage(imagePath));
    });
    return combineLatest(images);
  }
}
