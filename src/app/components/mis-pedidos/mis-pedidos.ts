import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Agregá ChangeDetectorRef acá
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoDTO, PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrls: ['./mis-pedidos.css']
})
export class MisPedidos implements OnInit {
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef); // 2. Inyectalo acá
  
  pedidos: PedidoDTO[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarMisPedidos();
  }

  cargarMisPedidos(): void {
    this.cargando = true;

    this.pedidoService.obtenerMisPedidos().subscribe({
      next: (data) => {
        this.pedidos = data.filter(p => p.estado !== 'carrito');
        this.cargando = false;
        this.cdr.detectChanges(); // ¡Ahora sí va a funcionar perfecto!
      },
      error: (err) => {
        console.error('Error al obtener los pedidos:', err);
        this.pedidos = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}