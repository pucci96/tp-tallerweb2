import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-checkout-resultado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-resultado.component.html',
  styleUrls: ['./checkout-resultado.component.css'],
})
export class CheckoutResultadoComponent implements OnInit {
  private readonly router = inject(Router);
  readonly pedido = inject(CheckoutService).ultimoPedido;

  ngOnInit(): void {
    if (!this.pedido()) {
      this.router.navigate(['/home']);
    }
  }
}
