import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebhookActionComponent } from './webhook-action.component';

describe('WebhookActionComponent', () => {
  let component: WebhookActionComponent;
  let fixture: ComponentFixture<WebhookActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebhookActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebhookActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
