import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
  id: number;
  category: string;
  imageUrl: string;
  title: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productCard.component.html',
  styleUrls: ['./productCard.component.css']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
}