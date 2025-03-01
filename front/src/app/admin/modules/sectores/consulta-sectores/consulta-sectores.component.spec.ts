import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSectoresComponent } from './consulta-sectores.component';

describe('ConsultaSectoresComponent', () => {
  let component: ConsultaSectoresComponent;
  let fixture: ComponentFixture<ConsultaSectoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaSectoresComponent]
    });
    fixture = TestBed.createComponent(ConsultaSectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
