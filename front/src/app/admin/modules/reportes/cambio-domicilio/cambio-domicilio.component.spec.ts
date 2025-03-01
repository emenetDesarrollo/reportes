import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioDomicilioComponent } from './cambio-domicilio.component';

describe('CambioDomicilioComponent', () => {
  let component: CambioDomicilioComponent;
  let fixture: ComponentFixture<CambioDomicilioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CambioDomicilioComponent]
    });
    fixture = TestBed.createComponent(CambioDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
