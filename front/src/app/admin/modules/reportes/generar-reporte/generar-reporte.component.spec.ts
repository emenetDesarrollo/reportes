import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarReporteComponent } from './generar-reporte.component';

describe('GenerarReporteComponent', () => {
  let component: GenerarReporteComponent;
  let fixture: ComponentFixture<GenerarReporteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerarReporteComponent]
    });
    fixture = TestBed.createComponent(GenerarReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
