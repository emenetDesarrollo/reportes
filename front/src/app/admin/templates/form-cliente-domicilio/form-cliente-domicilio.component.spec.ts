import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormClienteDomicilioComponent } from './form-cliente-domicilio.component';

describe('FormClienteDomicilioComponent', () => {
  let component: FormClienteDomicilioComponent;
  let fixture: ComponentFixture<FormClienteDomicilioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormClienteDomicilioComponent]
    });
    fixture = TestBed.createComponent(FormClienteDomicilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
