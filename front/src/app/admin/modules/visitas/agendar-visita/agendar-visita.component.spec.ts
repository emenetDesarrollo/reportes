import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendarVisitaComponent } from './agendar-visita.component';

describe('AgendarVisitaComponent', () => {
  let component: AgendarVisitaComponent;
  let fixture: ComponentFixture<AgendarVisitaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgendarVisitaComponent]
    });
    fixture = TestBed.createComponent(AgendarVisitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
