import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaVisitasComponent } from './consulta-visitas.component';

describe('ConsultaVisitasComponent', () => {
  let component: ConsultaVisitasComponent;
  let fixture: ComponentFixture<ConsultaVisitasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaVisitasComponent]
    });
    fixture = TestBed.createComponent(ConsultaVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
