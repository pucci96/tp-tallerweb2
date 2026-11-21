import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]) // Resuelve las directivas routerLink de la plantilla
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta el ciclo inicial de renderizado
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el año actual en el copyright', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const copyrightElement = compiled.querySelector('.copyright');
    expect(copyrightElement?.textContent).toContain(component.currentYear.toString());
  });

  it('debería mostrar el texto del proyecto de simulación', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const simulationText = compiled.querySelector('.simulation-pill span');
    expect(simulationText?.textContent).toContain('Proyecto educativo de simulación');
  });
});
