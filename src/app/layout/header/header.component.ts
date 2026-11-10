import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  imports: [CommonModule, RouterModule, RouterLinkActive, RouterLink],
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
  standalone: true,
})
export class HeaderComponent {
  //Cambiar cuando tengamos BD
  userName: string ='user';
  cartCount: number = 2;
}
