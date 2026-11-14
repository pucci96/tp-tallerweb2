import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [CommonModule, RouterLinkActive, RouterLink],
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
  standalone: true,
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  private router = inject(Router);

  // TODO: conectar con el carrito cuando exista (CarritoService)
  cartCount = 0;

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
