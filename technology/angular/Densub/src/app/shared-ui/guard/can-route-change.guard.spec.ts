import { TestBed } from '@angular/core/testing';

import { CanRouteChangeGuard } from './can-route-change.guard';

describe('CanRouteChangeGuard', () => {
  let guard: CanRouteChangeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanRouteChangeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
