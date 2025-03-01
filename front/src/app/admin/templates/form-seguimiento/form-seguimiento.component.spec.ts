import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSeguimientoComponent } from './form-seguimiento.component';

describe('FormSeguimientoComponent', () => {
  let component: FormSeguimientoComponent;
  let fixture: ComponentFixture<FormSeguimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormSeguimientoComponent]
    });
    fixture = TestBed.createComponent(FormSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
