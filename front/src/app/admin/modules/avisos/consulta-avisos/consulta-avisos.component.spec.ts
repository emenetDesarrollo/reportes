import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAvisosComponent } from './consulta-avisos.component';

describe('ConsultaAvisosComponent', () => {
  let component: ConsultaAvisosComponent;
  let fixture: ComponentFixture<ConsultaAvisosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaAvisosComponent]
    });
    fixture = TestBed.createComponent(ConsultaAvisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
