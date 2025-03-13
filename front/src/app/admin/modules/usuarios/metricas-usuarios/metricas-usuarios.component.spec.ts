import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricasUsuariosComponent } from './metricas-usuarios.component';

describe('MetricasUsuariosComponent', () => {
  let component: MetricasUsuariosComponent;
  let fixture: ComponentFixture<MetricasUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetricasUsuariosComponent]
    });
    fixture = TestBed.createComponent(MetricasUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
