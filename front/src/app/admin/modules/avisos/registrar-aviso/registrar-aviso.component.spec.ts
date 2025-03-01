import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAvisoComponent } from './registrar-aviso.component';

describe('RegistrarAvisoComponent', () => {
  let component: RegistrarAvisoComponent;
  let fixture: ComponentFixture<RegistrarAvisoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarAvisoComponent]
    });
    fixture = TestBed.createComponent(RegistrarAvisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
