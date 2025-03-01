import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPoblacionesComponent } from './consulta-poblaciones.component';

describe('ConsultaPoblacionesComponent', () => {
  let component: ConsultaPoblacionesComponent;
  let fixture: ComponentFixture<ConsultaPoblacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaPoblacionesComponent]
    });
    fixture = TestBed.createComponent(ConsultaPoblacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
