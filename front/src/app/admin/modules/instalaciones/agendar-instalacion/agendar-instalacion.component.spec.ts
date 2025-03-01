import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendarInstalacionComponent } from './agendar-instalacion.component';

describe('AgendarInstalacionComponent', () => {
  let component: AgendarInstalacionComponent;
  let fixture: ComponentFixture<AgendarInstalacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgendarInstalacionComponent]
    });
    fixture = TestBed.createComponent(AgendarInstalacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
