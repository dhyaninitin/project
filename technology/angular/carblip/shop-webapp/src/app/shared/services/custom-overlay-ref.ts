import { OverlayRef } from '@angular/cdk/overlay';

export class CustomOverlayref {
  constructor(private overlayRef: OverlayRef) {}

  close(): void {
    this.overlayRef.dispose();
  }
}
