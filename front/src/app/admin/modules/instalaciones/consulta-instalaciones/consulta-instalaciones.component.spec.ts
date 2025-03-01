import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaInstalacionesComponent } from './consulta-instalaciones.component';

describe('ConsultaInstalacionesComponent', () => {
  let component: ConsultaInstalacionesComponent;
  let fixture: ComponentFixture<ConsultaInstalacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaInstalacionesComponent]
    });
    fixture = TestBed.createComponent(ConsultaInstalacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
