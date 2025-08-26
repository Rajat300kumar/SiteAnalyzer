import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasResizerComponent } from './tas-resizer.component';

describe('TasResizerComponent', () => {
  let component: TasResizerComponent;
  let fixture: ComponentFixture<TasResizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasResizerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasResizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
