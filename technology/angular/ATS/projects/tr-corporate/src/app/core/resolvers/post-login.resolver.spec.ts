import { TestBed } from '@angular/core/testing';

import { PostLoginResolver } from './post-login.resolver';

describe('PostLoginResolver', () => {
  let resolver: PostLoginResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PostLoginResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
