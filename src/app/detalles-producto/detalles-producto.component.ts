import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

export interface ProductThumb {
  label: string;
  src: string;
  alt: string;
}

export interface ProductSpec {
  parameter: string;
  detail: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface RelatedProduct {
  label: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
}

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalles-producto.component.html',
  styleUrls: ['./detalles-producto.component.css']
})
export class DetallesProductoComponent {
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  // Hardcoded until the page loads a real product by :id (see spec follow-up).
  readonly productId = 1;
  readonly cantidadEnCarrito = this.cart.cantidadTotal;
  readonly cantidadAgregada = signal(1);

/* Datos del producto (mismo contenido del diseño original)         */
  readonly sku = 'TECNO-KB-94500';
  readonly category = 'Teclados Mecánicos';
  readonly title = 'Teclado Mecánico RGB Switch Red TKL Custom';
  readonly rating = 4.8;
  readonly reviewsCount = 52;
  readonly price = 94500;
  readonly originalPrice = 112000;
  readonly currency = 'ARS';
  readonly stockText = 'Stock disponible';
  readonly stockDetail = '(14 unidades para envío inmediato)';

  readonly mainImageSrc =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVRut7prLz_IW6bEmu-eA4j3AkmUQ_MNUiCFWcVGQ7XL3eaBkbQfgv3RoBCP7zY--vyPPT7Q-_K8sE-NoPOQHirrYPMp8Cu_MtOs5GLmdyZHFiBy9odEqSTVVHsABcfyS8wmpOOJaBSllWyblzgV4UADFRscIVPawfrPE_3uRYWailnhDN04AsFXx5pxRzqfpxd1NyvylhFBnbOih--d9614-W7k0UCicWvAyGcl0';
  readonly mainImageAlt = 'Teclado Mecánico RGB Switch Red TKL Custom';

  readonly thumbnails: ProductThumb[] = [
    {
      label: 'Perspectiva',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx0xoXnmePZREHBSybWNZN7Zt0hIsGlCcO7yy38WH7p3fq8-UbLaywI5c-KjpL9vyomF6vilvfTcSgKBthjWjOVKGBGcuye13Tg0aJcPtvLGsePImtS1nyHiYKUH8Rqthc5vf7YTfJYXiYVjKEPkbIIyqIOnW7qxf9MLI4-Iz77VnMp6F6glaNBxPLbogWQekWHxlPTTHZYQQMGVV_lemo-PrnOsY7ff9UY_gqGX4',
      alt: 'Modern sleek black mechanical gaming keyboard with vibrant custom per-key RGB backlighting'
    },
    {
      label: 'Cenital',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAOZbqYzGonlOkeq-dxqrKaDk2narY_31cyGeFt2LF8UjLvW3T7uuEcjtj_8mxf9PXfW0KoWUz0vPemQekX0QkTVyzmg6zS7eugZBZr7W9v-nphGF7TmGCJy5hfi4GHLD2FLnJAOPrP7f-U8Qe3_2OK0qIgQBgfSgxIs5A3Ed1Y4mx94Qk0R2jKKa5aZt6tT8Gr5wdjLxdHRpair2OJs3nwiL3WP16WHz4G_ariVk',
      alt: 'Top down flat-lay view of an 80 percent tenkeyless compact mechanical keyboard'
    },
    {
      label: 'Switches',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDESOk1h784lY_281nozrwvAe19Yg9wWbwH_Wqvvip8GOFR52Xd0GHNnghpWOxxGaSCxxbXNJifH31exK-zoIgGbulUH7EcVF-vyLDj28lbHD86ZtLPTtgkLDB6ecsS0lF-X1bg5mJLlwD0OGb3fyUNoJRo3TC9zVPMggy4RB8wlQkh6qgRvtEKUVRZ3lV22djMIA2A2PS018-Vee3FqyTCooXGyR8C_eJ9fjzwq7U',
      alt: 'Macro extreme close-up of mechanical red linear switches'
    },
    {
      label: 'Cable Type-C',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCvvDu3BFai8TyDvctmyW9Em-Ng4d4ue8OkgGVJeTQJYzWA7i1iAHolA2gCCM6N8RY1BtZNX0C4uDllJarnbbW17Rfnqr80A8RdrVT7gOhZFiDz5HITCqw5aEK03QtpfqbDsXmO2P3bl6gOcZUop1eiDEmsvsD2veZVQpYu1tj5SvA3-O8puS9wqskqameh1j8eJj6GysQtYJ1kP-ntNYX2lKH97cThGJKkfdRPCM',
      alt: 'Side profile ergonomic typing angle showing aluminum bevel'
    },
    {
      label: 'Setup RGB',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjxVArcfYTPCgLBH_YFFMGpgMH7pjULlg1TgLnJMXWgvqrz7bGWOuz7SLvKr2Ddxk4PzT8sUGB9G1pfFCdPAkHW6CSZktAo0yoqAU1iTQpMfbp3auOt1seZIP3LAI4u6XrIDAoPbI2YvM5FZTpWsxn0RuFHrgdxb6XM2K88postikMRJH8BoI2xcUndq4VC7LGmfEBvtsEqkDQxLyk7xHISYIztSvYm4WPDK5LpZs',
      alt: 'Gaming battlestation environment at night with keyboard glowing with teal and magenta RGB'
    }
  ];

  readonly specs: ProductSpec[] = [
    { parameter: 'Tipo de Interruptor (Switch)', detail: 'Mecánico Red Lineal (Hot-swappable 3/5 pines)' },
    { parameter: 'Formato', detail: 'TKL 80% (87 Teclas con Layout ISO Español con letra Ñ)' },
    { parameter: 'Conectividad', detail: 'Cable USB-C a USB-A desmontable mallado (1000Hz Polling Rate)' },
    { parameter: 'Anti-Ghosting', detail: '100% N-Key Rollover (NKRO) simultáneo' },
    { parameter: 'Estructura & Material', detail: 'Placa superior de Aluminio Anodizado + Keycaps PBT Doble Inyección' },
    { parameter: 'Iluminación', detail: 'Chroma RGB 16.8M de colores con 18 modos preestablecidos' },
    { parameter: 'Dimensiones & Peso', detail: '356 x 135 x 38 mm — 890 gramos (alta estabilidad antideslizante)' },
    { parameter: 'Compatibilidad SO', detail: 'Windows 11 / 10 / 8, macOS Sonoma/Ventura, Linux Ubuntu & Steam Deck' }
  ];

  readonly features: ProductFeature[] = [
    {
      icon: 'tune',
      title: 'Switches Lineales Red (50M)',
      description: 'Recorrido suave y silencioso de 2.0mm con fuerza de actuación ligera de 45g, ideal para tiempos de respuesta récord.'
    },
    {
      icon: 'palette',
      title: 'Iluminación RGB 16.8M',
      description: 'Efectos dinámicos configurables por tecla con perfiles integrados en memoria onboard sin software forzoso.'
    },
    {
      icon: 'keyboard',
      title: 'Keycaps PBT Double-Shot',
      description: 'Inmunes al desgaste y brillo por uso continuado con leyenda translúcida nítida en español latinoamericano.'
    },
    {
      icon: 'cable',
      title: 'Cable Type-C Desmontable',
      description: 'Mallado trenzado de 1.8 metros con conectores bañados en oro para máxima durabilidad y transporte seguro.'
    }
  ];

  readonly related: RelatedProduct[] = [
    {
      label: 'Mouses',
      title: 'Mouse Gamer Inalámbrico 26K DPI',
      price: 48900,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw9swQTsx0q4Yw4WnYRXT14-j3p4dG7Bdm61452pWbEe6gCteO7AZUeeaGSeX_ftcVLSau2x8lsm5B359_-xdcNu5uM6iQzkYgnEA-Wg08hH4R2kH-5GbpdraWgL3zteT90YPx6FzkAdcQxVLFAP1smJnPxYdIxbKTi5HqnhB4TuW_-1zbP2TCth0XiID2cnwEEa9sghUME_rgi6zACuz8NLU794OhhKNGTLD3YsM',
      badge: '26.000 DPI'
    },
    {
      label: 'Mousepads',
      title: 'Mousepad XL Speed 900x400 Topo',
      price: 21500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCihOI7hDciVbBZ6uHtaySmFi6f37ngxmYkuOKUpdlo6X950ZYbBOBHTw50tOXf41558OA7EIFDBDTDvNzduyZVuEVTz6O00wc0shTapUgE8P5UGGCvxmP1sdKPFtQw_yFuPzp9p-HMvnWquauduPKLBG09bnH9mLEYMq8PGkvivfdXw-jAS8CigcIVTuUyNP4iANLTfs39FHjXYlcB2ZydGsR4HS3T4MxcyDoJgg8',
      badge: 'Envío Gratis'
    },
    {
      label: 'Accesorios',
      title: 'Kit de Modding & Lubricación Switches',
      price: 16200,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXRws5qx6vc4oGwpEzEoIDn8BrEbObXn7HLct_Jd_hsZVp3Bum6zb-qHVI7B0Sh_ZS5qjkfqN0fs8AcFg6F9tcEYmKAmQSG_2MmF8sMu9evmPdCBpYbL2YwFhvOwyXFolryPlvGWcz_J1SmZvRZRq3TUq4hN53kJa2WB4wwf9IkL6zVjLJT9xTUfC-ZYE4QYwLTu4Czpue6YvmjeK_wVsjyj8fpl69fHdsMhD3NN4'
    },
    {
      label: 'Audio',
      title: 'Auriculares Pro 7.1 Espacial Wireless',
      price: 119999,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwfA84ZW77v0kLbaL8Gcu357ag-NHYQ1dX_dJVgM5d29VM_6aUHMIL32pjn1-9P_wzEJmWXZ0sTaPJ0uz4aG-kTO2YVCEkUZx5bUoMKhSPdqmjzUIhGjk6rJjwskCEDtdeJqAg9fv1Wr-YS0ejOTKLqx9PVbjVVk9LTjIzDGa5wjbglh7dxHFHUjJKBYfmmH2hX4Nzc1wvunw82c7slQCE6BxPmKw5l59rA-0ehrE',
      badge: 'Últimas 2 un.'
    }
  ];

  /*Paths de iconos SVG (Material Symbols Outlined)*/
  readonly iconPaths: Record<string, string> = {
    tune: 'M11,21V15h2v2h8v2H13v2H11ZM3,19V17H9v2H3Zm4-4V13H3V11H7V9H9v6H7Zm4-2V11H21v2H11Zm4-4V3h2V5h4V7H17V9H15ZM3,7V5H13V7H3Z',
    palette: 'M12,22q-2.05,0-3.88-0.79Q6.3,20.43 4.94,19.06Q3.58,17.7 2.79,15.88T2,12Q2,9.92 2.81,8.1q0.81-1.83 2.2-3.17Q6.4,3.57 8.25,2.79T12.2,2q2,0 3.78,0.69t3.11,1.9t2.13,2.88Q22,9.13 22,11.05q0,2.88-1.75,4.41T16,17H14.15q-0.22,0-0.31,0.13T13.75,17.4q0,0.3 0.38,0.86t0.38,1.29q0,1.25-0.69,1.85T12,22Zm0-10ZM7.58,12.58Q8,12.15 8,11.5T7.58,10.43T6.5,10T5.43,10.43T5,11.5t0.43,1.07T6.5,13t1.08-0.43Zm3-4Q11,8.15 11,7.5T10.58,6.43T9.5,6T8.43,6.43T8,7.5T8.43,8.57T9.5,9t1.08-0.43Zm5,0Q16,8.15 16,7.5T15.58,6.43T14.5,6T13.43,6.43T13,7.5t0.43,1.07T14.5,9t1.08-0.43Zm3,4Q19,12.15 19,11.5t-0.43-1.08T17.5,10t-1.07,0.42T16,11.5t0.43,1.07T17.5,13t1.07-0.43ZM12,20q0.23,0 0.36-0.13t0.14-0.32q0-0.35-0.38-0.82T11.75,17.3q0-1.05 0.73-1.68T14.25,15H16q1.65,0 2.82-0.96T20,11.05q0-3.03-2.31-5.04T12.2,4Q8.8,4 6.4,6.32T4,12q0,3.32 2.34,5.66T12,20Z',
    keyboard: 'M4,19q-0.82,0-1.41-0.59T2,17V7Q2,6.18 2.59,5.59T4,5H20q0.83,0 1.41,0.59Q22,6.18 22,7V17q0,0.82-0.59,1.41T20,19H4Zm0-2H20V7H4V17Zm4-1h8V14H8v2ZM5,13H7V11H5v2Zm3,0h2V11H8v2Zm3,0h2V11H11v2Zm3,0h2V11H14v2Zm3,0h2V11H17v2ZM5,10H7V8H5v2Zm3,0h2V8H8v2Zm3,0h2V8H11v2Zm3,0h2V8H14v2Zm3,0h2V8H17v2ZM4,17V7V17Z',
    cable: 'M5,21q-0.42,0-0.71-0.29Q4,20.43 4,20V19H3V15q0-0.43 0.29-0.71T4,14H5V7Q5,5.35 6.18,4.17T9,3t2.83,1.17T13,7V17q0,0.82 0.59,1.41T15,19t1.41-0.59T17,17V10H16q-0.42,0-0.71-0.29T15,9V5h1V4q0-0.43 0.29-0.71T17,3h2q0.43,0 0.71,0.29T20,4V5h1V9q0,0.42-0.29,0.71T20,10H19v7q0,1.65-1.18,2.82T15,21t-2.82-1.18T11,17V7q0-0.82-0.59-1.41T9,5Q8.18,5 7.59,5.59Q7,6.18 7,7v7H8q0.43,0 0.71,0.29T9,15v4H8v1q0,0.43-0.29,0.71T7,21H5Z',
  };

  getIconPath(iconName: string): string {
    return this.iconPaths[iconName] || '';
  }

  /*Estado de la interfaz (señales, igual que LoginComponent)*/
  readonly quantity = signal(1);
  readonly stars = [1, 2, 3, 4, 5];
  readonly selectedThumbnail = signal(0);
  readonly showToast = signal(false);
  readonly showShippingFeedback = signal(false);
  readonly isAddingToCart = signal(false);
  readonly isFavorite = signal(false);

  readonly transferPrice = computed(() => Math.round(this.price * 0.9));
  readonly maxQuantity = 5;

  readonly activeImage = computed(() => {
    const thumb = this.thumbnails[this.selectedThumbnail()];
    return {
      src: thumb?.src ?? this.mainImageSrc,
      alt: thumb?.alt ?? this.mainImageAlt,
    };
  });

  /*Acciones*/
  changeQuantity(delta: number): void {
    const next = Math.max(1, Math.min(this.maxQuantity, this.quantity() + delta));
    this.quantity.set(next);
  }

  selectThumbnail(index: number): void {
    this.selectedThumbnail.set(index);
  }

  private agregarProductoActual(): void {
    this.cart.agregar(
      { id: this.productId, nombre: this.title, precio: this.price, imagen: this.mainImageSrc },
      this.quantity(),
    );
    this.cantidadAgregada.set(this.quantity());
  }

  comprarAhora(): void {
    this.agregarProductoActual();
    this.router.navigate(['/checkout']);
  }

  triggerAddToCart(): void {
    this.agregarProductoActual();
    this.isAddingToCart.set(true);
    this.showToast.set(true);

    setTimeout(() => {
      this.isAddingToCart.set(false);
      this.showToast.set(false);
    }, 5500);
  }

  simulateShipping(): void {
    this.showShippingFeedback.set(true);
  }

  closeToast(): void {
    this.showToast.set(false);
  }
}
