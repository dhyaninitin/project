import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
    selector: '[appDragScroll]'
})
export class DragScrollDirective {
    private isDragging = false;
    private startX: number;
    private startY: number;
    private scrollLeft: number;
    private scrollTop: number;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.scrollLeft = this.el.nativeElement.scrollLeft;
        this.scrollTop = this.el.nativeElement.scrollTop;
        this.renderer.addClass(this.el.nativeElement, 'drag-scroll-active');
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) {
            return;
        }

        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;

        this.el.nativeElement.scrollLeft = this.scrollLeft - deltaX;
        this.el.nativeElement.scrollTop = this.scrollTop - deltaY;
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
        this.renderer.removeClass(this.el.nativeElement, 'drag-scroll-active');
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent) {
        this.isDragging = false;
        this.renderer.removeClass(this.el.nativeElement, 'drag-scroll-active');
    }
}
