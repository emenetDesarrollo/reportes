import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormClienteCambioDomicilioComponent } from './form-cliente-cambio-domicilio.component';

describe('FormClienteCambioDomicilioComponent', () => {
  let component: FormClienteCambioDomicilioComponent;
  let fixture: ComponentFixture<FormClienteCambioDomicilioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormClienteCambioDomicilioComponent]
    });
    fixture = TestBed.createComponent(FormClienteCambioDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
