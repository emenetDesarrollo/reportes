import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormReporteComponent } from './form-reporte.component';

describe('FormReporteComponent', () => {
  let component: FormReporteComponent;
  let fixture: ComponentFixture<FormReporteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormReporteComponent]
    });
    fixture = TestBed.createComponent(FormReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
