import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el nombre de usuario inicial', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const userNameElement = compiled.querySelector('.user-name');
    expect(userNameElement?.textContent).toContain(component.userName);
  });

  it('debería mostrar la cantidad de items en el carrito', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badgeElement = compiled.querySelector('.cart-badge');
    expect(badgeElement?.textContent).toContain(component.cartCount.toString());
  });
});