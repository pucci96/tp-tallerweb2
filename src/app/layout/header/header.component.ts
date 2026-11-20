import { Component, OnInit, inject } from '@angular/core'; //  Importá OnInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  imports: [CommonModule, RouterLinkActive, RouterLink],
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
  standalone: true,
})
export class HeaderComponent implements OnInit { // Agregá implements OnInit
  protected readonly auth = inject(AuthService);
  public readonly pedidoService = inject(PedidoService);
  private router = inject(Router);

  // Estado para el menú hamburguesa en mobile
  public menuAbierto = false;

  ngOnInit(): void {
    // Cuenta desde el backend si hay sesión, o desde localStorage si somos invitados.
    this.pedidoService.inicializarContador();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }
  
  cerrarSesion(): void {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}