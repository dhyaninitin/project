import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { AppCustomOverlayComponent } from 'app/shared/component/custom-overlay/custom-overlay.component';

import { CustomOverlayref } from './custom-overlay-ref';

interface CustomDialogConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
}

const DEFAULT_CONFIG: CustomDialogConfig = {
  hasBackdrop: true,
  backdropClass: 'dark-backdrop',
  panelClass: 'tm-custom-overlay-dialog-panel',
};

@Injectable()
export class CustomOverlayService {
  constructor(private overlay: Overlay) {}

  open(config: CustomDialogConfig = {}) {
    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);

    // Instantiate remote control
    const dialogRef = new CustomOverlayref(overlayRef);

    // Create ComponentPortal that can be attached to a PortalHost
    const customOverlayPortal = new ComponentPortal(AppCustomOverlayComponent);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(customOverlayPortal);

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());
    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    return dialogRef;
  }

  private createOverlay(config: CustomDialogConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  private getOverlayConfig(config: CustomDialogConfig): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy,
    });

    return overlayConfig;
  }
}
