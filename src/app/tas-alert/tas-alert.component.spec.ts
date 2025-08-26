import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasAlertComponent } from './tas-alert.component';

describe('TasAlertComponent', () => {
  let component: TasAlertComponent;
  let fixture: ComponentFixture<TasAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasAlertComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
