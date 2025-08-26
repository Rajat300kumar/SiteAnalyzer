import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntdropdownComponent } from './antdropdown.component';

describe('AntdropdownComponent', () => {
  let component: AntdropdownComponent;
  let fixture: ComponentFixture<AntdropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntdropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntdropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
