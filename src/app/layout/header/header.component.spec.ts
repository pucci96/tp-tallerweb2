import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]) // Resuelve las directivas routerLink en los tests
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta el ciclo inicial de detección de cambios
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sin sesión muestra los links de login y registro', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Iniciar sesión');
    expect(compiled.textContent).toContain('Registrarse');
    expect(compiled.querySelector('.user-name')).toBeNull();
  });

  it('con sesión muestra el nombre del usuario y el botón de cerrar sesión', () => {
    TestBed.inject(AuthService).guardarSesion({
      token: 'token-de-prueba',
      usuario: { id: 1, email: 'a@b.com', nombre: 'Ana', apellido: 'Gómez', direccion: 'Calle 1', rol: 'CLIENTE' },
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.user-name')?.textContent).toContain('Ana');
    expect(compiled.textContent).toContain('Cerrar sesión');
    expect(compiled.textContent).not.toContain('Administración');
  });

  it('muestra el link de administración solo a usuarios ADMIN', () => {
    TestBed.inject(AuthService).guardarSesion({
      token: 'token-de-prueba',
      usuario: { id: 1, email: 'admin@b.com', nombre: 'Admin', apellido: 'X', direccion: 'Y', rol: 'ADMIN' },
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Administración');
  });

  it('debería ocultar el contador con el carrito vacío y mostrar la cantidad real', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-badge')).toBeNull();

    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 3);
    fixture.detectChanges();
    expect(compiled.querySelector('.cart-badge')?.textContent?.trim()).toBe('3');
  });

  it('debería enlazar el botón del carrito a /checkout', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector('.cart-btn');
    expect(boton?.getAttribute('href')).toBe('/checkout');
  });
});
