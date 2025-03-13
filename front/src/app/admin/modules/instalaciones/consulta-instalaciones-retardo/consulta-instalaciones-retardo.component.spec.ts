import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaInstalacionesRetardoComponent } from './consulta-instalaciones-retardo.component';

describe('ConsultaInstalacionesRetardoComponent', () => {
  let component: ConsultaInstalacionesRetardoComponent;
  let fixture: ComponentFixture<ConsultaInstalacionesRetardoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaInstalacionesRetardoComponent]
    });
    fixture = TestBed.createComponent(ConsultaInstalacionesRetardoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
