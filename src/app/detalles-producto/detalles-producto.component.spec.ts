import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DetallesProductoComponent } from './detalles-producto.component';

describe('DetallesProductoComponent', () => {
  let component: DetallesProductoComponent;
  let fixture: ComponentFixture<DetallesProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesProductoComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesProductoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with quantity 1', () => {
    expect(component.quantity()).toBe(1);
  });

  it('should increase quantity up to max', () => {
    component.changeQuantity(1);
    expect(component.quantity()).toBe(2);
    for (let i = 0; i < 10; i++) {
      component.changeQuantity(1);
    }
    expect(component.quantity()).toBe(component.maxQuantity);
  });

  it('should not decrease quantity below 1', () => {
    component.changeQuantity(-1);
    expect(component.quantity()).toBe(1);
  });
});
