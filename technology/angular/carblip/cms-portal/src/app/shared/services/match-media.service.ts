import { Injectable } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MatchMediaService {
  activeMediaQuery: string;
  onMediaChange: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private media: MediaObserver) {
    this.activeMediaQuery = '';
    this.init();
  }

  private init(): void {
    this.media.asObservable().subscribe((change: MediaChange[]) => {
      if (this.activeMediaQuery !== change[0].mqAlias) {
        this.activeMediaQuery = change[0].mqAlias;
        this.onMediaChange.next(change[0].mqAlias);
      }
    });
  }
}
