import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRequestComponent } from './my-request.component';

describe('TrimComponent', () => {
  let component: MyRequestComponent;
  let fixture: ComponentFixture<MyRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyRequestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
