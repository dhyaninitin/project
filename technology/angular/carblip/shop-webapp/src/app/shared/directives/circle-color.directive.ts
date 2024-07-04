import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appCircleColor]',
})
export class CircleColorDirective implements AfterViewInit {
  @Input() public hexColor: any;
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.style.background = '#' + this.hexColor;
    this.el.nativeElement.style.background =
      '-moz-linear-gradient(left, #' +
      this.hexColor +
      'cc 0%, #' +
      this.hexColor +
      ' 100%)';
    this.el.nativeElement.style.background =
      '-webkit-gradient(linear, left top, right top, color-stop(0%,#' +
      this.hexColor +
      'cc), color-stop(100%,#' +
      this.hexColor +
      '))';
    this.el.nativeElement.style.background =
      '-webkit-linear-gradient(left, #' +
      this.hexColor +
      'cc 0%, #' +
      this.hexColor +
      ' 100%)';
    this.el.nativeElement.style.background =
      '-o-linear-gradient(left, #' +
      this.hexColor +
      'cc 0%, #' +
      this.hexColor +
      ' 100%)';
    this.el.nativeElement.style.background =
      '-ms-linear-gradient(left, #' +
      this.hexColor +
      'cc 0%, #' +
      this.hexColor +
      ' 100%)';
    this.el.nativeElement.style.backgroundImage =
      'linear-gradient( to right, #' +
      this.hexColor +
      'cc 0%,  #' +
      this.hexColor +
      '   100%)';
  }
}
