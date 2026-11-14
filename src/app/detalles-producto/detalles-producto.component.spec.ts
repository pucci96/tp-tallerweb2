import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CartService } from '../services/cart.service';
import { DetallesProductoComponent } from './detalles-producto.component';

describe('DetallesProductoComponent', () => {
  let component: DetallesProductoComponent;
  let fixture: ComponentFixture<DetallesProductoComponent>;

  beforeEach(async () => {
    localStorage.clear();
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

  afterEach(() => localStorage.clear());

  it('debería agregar el producto actual al carrito con la cantidad elegida', () => {
    component.changeQuantity(1);
    component.triggerAddToCart();
    expect(TestBed.inject(CartService).items()).toEqual([
      { id: 1, nombre: component.title, precio: component.price, imagen: component.mainImageSrc, cantidad: 2 },
    ]);
    expect(component.showToast()).toBe(true);
  });

  it('debería agregar y navegar a /checkout con "Comprar ahora"', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.comprarAhora();
    expect(TestBed.inject(CartService).cantidadTotal()).toBe(1);
    expect(navigate).toHaveBeenCalledWith(['/checkout']);
  });

  it('debería enlazar los accesos del aviso al checkout con la cantidad real', async () => {
    component.triggerAddToCart();
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.toast-link');
    expect(links[0].textContent).toContain('Ver carrito (1)');
    expect(links[0].getAttribute('href')).toBe('/checkout');
    expect(links[1].getAttribute('href')).toBe('/checkout');
  });
});
