import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserPermissionComponent } from './add-user-permission.component';

describe('AddUserPermissionComponent', () => {
  let component: AddUserPermissionComponent;
  let fixture: ComponentFixture<AddUserPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUserPermissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
