import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { ImageLoadService } from '../services/image-load.service';

@Directive({
  selector: '[appLazyloader]',
})
export class LazyloaderDirective implements OnChanges {
  @Input() public src: any;
  @Input() public srcset: any;

  private spinner: Element;
  constructor(
    private elem: ElementRef,
    private renderer: Renderer2,
    private imageLoadService$: ImageLoadService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.srcset) {
      this.elem.nativeElement.srcset = changes.srcset.currentValue;
      this.showLoading('srcset');
    } else if (changes.src) {
      this.elem.nativeElement.src = changes.src.currentValue;
      this.showLoading('src');
    }
  }

  createSpinner() {
    if (!this.spinner) {
      this.spinner = document.createElement('i');
      this.spinner.className = 'fa fa-spin fa-spinner loading-spin';
    }
  }

  showLoading(source: string) {
    const parentElem = this.elem.nativeElement.parentElement;

    this.createSpinner();
    parentElem.appendChild(this.spinner);
    this.renderer.setStyle(this.elem.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.spinner, 'display', 'block');

    if (source === 'src') {
      const img_src = this.elem.nativeElement.src;
      this.imageLoadService$.loadImage(img_src).subscribe(() => {
        this.renderer.setStyle(this.elem.nativeElement, 'display', 'block');
        this.renderer.setStyle(this.spinner, 'display', 'none');
      });
    } else {
      const img_srcset = this.elem.nativeElement.srcset;
      const sizes = this.elem.nativeElement.sizes;
      this.imageLoadService$
        .loadImageWithSrcset(img_srcset, sizes)
        .subscribe(() => {
          this.renderer.setStyle(this.elem.nativeElement, 'display', 'block');
          this.renderer.setStyle(this.spinner, 'display', 'none');
        });
    }
  }
}
