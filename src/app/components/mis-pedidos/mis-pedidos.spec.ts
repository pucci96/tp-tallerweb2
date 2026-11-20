import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MisPedidos } from './mis-pedidos';

describe('MisPedidos', () => {
  let component: MisPedidos;
  let fixture: ComponentFixture<MisPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPedidos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MisPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
