import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService, ProductoDetalle, Comentario } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../productCard/productCard.component';
import { PedidoService } from '../services/pedido.service';


/** Cantidad máxima de productos relacionados que se muestran. */
const MAX_RELACIONADOS = 4;

/** Largo máximo de un comentario (igual que en el backend). */
export const MAX_LARGO_COMENTARIO = 500;

export interface ProductThumb {
  label: string;
  src: string;
  alt: string;
}

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalles-producto.component.html',
  styleUrls: ['./detalles-producto.component.css']
})
export class DetallesProductoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private pedidoService = inject(PedidoService);

  /* Producto real, cargado desde el backend según el :id de la URL */
  readonly producto = signal<ProductoDetalle | null>(null);
  readonly cargando = signal(true);
  readonly mensajeError = signal('');

  /** Otros productos de la misma categoría que el producto que se está viendo. */
  readonly relacionados = signal<Product[]>([]);

  /* ---------- Comentarios y calificación ---------- */
  readonly comentarios = signal<Comentario[]>([]);
  readonly promedio = signal(0);
  readonly cantidadOpiniones = signal(0);
  readonly maxLargoComentario = MAX_LARGO_COMENTARIO;

  /** Las 5 estrellas del promedio: cuánto se pinta cada una (0, 50 o 100 %). */
  readonly estrellasPromedio = computed(() => this.porcentajesEstrellas(this.promedio()));

  /** Usuario logueado (null si no hay sesión): solo los logueados pueden comentar. */
  readonly usuario = this.authService.usuarioActual;
  /** Si el usuario logueado ya comentó este producto (solo se permite un comentario). */
  readonly yaComento = computed(() => {
    const usuario = this.usuario();
    return !!usuario && this.comentarios().some((c) => c.id_usuario === usuario.id);
  });

  /** Formulario para comentar */
  readonly nuevaCalificacion = signal(0);
  readonly calificacionHover = signal(0);
  readonly nuevoTexto = signal('');
  readonly enviandoComentario = signal(false);
  readonly errorComentario = signal('');
  readonly comentarioPublicado = signal(false);

  constructor() {
    // Se escucha paramMap (y no snapshot) para que, si se navega de un producto
    // a otro sin salir de la página, se vuelva a cargar con el id nuevo.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.cargarProducto(Number(params.get('id')));
    });
  }

  private cargarProducto(id: number): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.producto.set(null);
    this.relacionados.set([]);
    this.quantity.set(1);
    this.limpiarComentarios();

    this.productService.obtenerDetalle(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.cargando.set(false);
        this.cargarRelacionados(producto);
        this.cargarComentarios(producto.id);
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError.set(
          err.status === 404 || err.status === 400
            ? 'El producto que buscás no existe o fue eliminado.'
            : 'No se pudo cargar el producto. Intentá de nuevo más tarde.'
        );
        this.cargando.set(false);
      },
    });
  }

  /** Busca en el catálogo otros productos de la misma categoría (sin incluir el actual). */
  private cargarRelacionados(producto: ProductoDetalle): void {
    this.productService.obtenerProductos().subscribe({
      next: (todos) => {
        // Si mientras tanto se navegó a otro producto, esta respuesta ya no sirve.
        if (this.producto()?.id !== producto.id) return;
        this.relacionados.set(
          todos
            .filter((p) => p.categoryId === producto.categoria.id && p.id !== producto.id)
            .slice(0, MAX_RELACIONADOS)
        );
      },
      error: (err) => console.error('Error al cargar productos relacionados:', err),
    });
  }

  /** Vacía los comentarios y el formulario (al cambiar de producto). */
  private limpiarComentarios(): void {
    this.comentarios.set([]);
    this.promedio.set(0);
    this.cantidadOpiniones.set(0);
    this.nuevaCalificacion.set(0);
    this.calificacionHover.set(0);
    this.nuevoTexto.set('');
    this.errorComentario.set('');
    this.comentarioPublicado.set(false);
  }

  /** Trae los comentarios y el promedio del producto. */
  private cargarComentarios(idProducto: number): void {
    this.productService.obtenerComentarios(idProducto).subscribe({
      next: (resultado) => {
        if (this.producto()?.id !== idProducto) return; // se navegó a otro producto
        this.comentarios.set(resultado.comentarios);
        this.promedio.set(resultado.promedio);
        this.cantidadOpiniones.set(resultado.cantidad);
      },
      error: (err) => console.error('Error al cargar comentarios:', err),
    });
  }

  /**
   * Cuánto se pinta cada una de las 5 estrellas para una calificación.
   * Ej: 3.5 → [100, 100, 100, 50, 0]. Se redondea a la media estrella más cercana.
   */
  porcentajesEstrellas(valor: number): number[] {
    const redondeado = Math.round(valor * 2) / 2;
    return [1, 2, 3, 4, 5].map((n) => (redondeado >= n ? 100 : redondeado >= n - 0.5 ? 50 : 0));
  }

  /** Selector de estrellas del formulario: elegir y "previsualizar" con el mouse. */
  elegirCalificacion(valor: number): void {
    this.nuevaCalificacion.set(valor);
    this.errorComentario.set('');
  }

  /** Estrellas que se ven llenas en el selector (la del hover tiene prioridad). */
  readonly calificacionVisible = computed(() => this.calificacionHover() || this.nuevaCalificacion());

  publicarComentario(): void {
    const producto = this.producto();
    if (!producto || this.enviandoComentario()) return;

    const calificacion = this.nuevaCalificacion();
    const texto = this.nuevoTexto().trim();
    if (calificacion < 1 || calificacion > 5) {
      this.errorComentario.set('Elegí una calificación de 1 a 5 estrellas.');
      return;
    }
    if (!texto) {
      this.errorComentario.set('Escribí tu comentario.');
      return;
    }
    if (texto.length > MAX_LARGO_COMENTARIO) {
      this.errorComentario.set(`El comentario puede tener hasta ${MAX_LARGO_COMENTARIO} caracteres.`);
      return;
    }

    this.enviandoComentario.set(true);
    this.errorComentario.set('');

    this.productService.comentar(producto.id, { calificacion, texto }).subscribe({
      next: () => {
        this.enviandoComentario.set(false);
        this.nuevaCalificacion.set(0);
        this.nuevoTexto.set('');
        this.comentarioPublicado.set(true);
        // Se recargan para tener el promedio actualizado (lo calcula el backend).
        this.cargarComentarios(producto.id);
      },
      error: (err: HttpErrorResponse) => {
        this.enviandoComentario.set(false);
        this.errorComentario.set(err.error?.error || 'No se pudo publicar el comentario. Intentá de nuevo.');
      },
    });
  }

  /** Link "N opiniones" del encabezado: baja hasta la sección de comentarios. */
  irAOpiniones(event: Event): void {
    event.preventDefault();
    document.getElementById('opiniones')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Datos de maqueta que todavía no existen en la base */
  readonly originalPrice = 112000;
  readonly currency = 'ARS';

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

  /*Estado de la interfaz (señales, igual que LoginComponent)*/
  readonly quantity = signal(1);
  readonly selectedThumbnail = signal(0);
  readonly showToast = signal(false);
  readonly showShippingFeedback = signal(false);
  readonly isAddingToCart = signal(false);
  readonly isFavorite = signal(false);

  readonly transferPrice = computed(() => Math.round((this.producto()?.precio ?? 0) * 0.9));
  /** No se puede elegir más cantidad que el stock disponible. */
  readonly maxQuantity = computed(() => Math.max(1, this.producto()?.stock ?? 1));
  readonly sinStock = computed(() => (this.producto()?.stock ?? 0) <= 0);

  /*Acciones*/
  changeQuantity(delta: number): void {
    const next = Math.max(1, Math.min(this.maxQuantity(), this.quantity() + delta));
    this.quantity.set(next);
  }

  selectThumbnail(index: number): void {
    this.selectedThumbnail.set(index);
  }

  triggerAddToCart(): void {
    const productoActual = this.producto();
    if (!productoActual || this.isAddingToCart() || this.sinStock()) return;

    this.isAddingToCart.set(true);
    const cantidadSeleccionada = this.quantity();

    // 1. Buscamos si el usuario ya tiene un pedido en estado 'carrito'
    this.pedidoService.obtenerMisPedidos().subscribe({
      next: (pedidos) => {
        let carritoActivo = pedidos.find(p => p.estado === 'carrito');

        const ejecutarAgregar = (idPedido: number) => {
          this.pedidoService.agregarProducto(idPedido, {
            id_producto: productoActual.id,
            cantidad: cantidadSeleccionada
          }).subscribe({
            next: () => {
              this.isAddingToCart.set(false);
              this.showToast.set(true);
              
              // Ocultar toast automáticamente a los 4 segundos
              setTimeout(() => {
                this.showToast.set(false);
              }, 4000);
            },
            error: (err) => {
              console.error('Error al agregar el producto al carrito:', err);
              this.isAddingToCart.set(false);
            }
          });
        };

        if (carritoActivo) {
          ejecutarAgregar(carritoActivo.id);
        } else {
          // Si no tiene carrito activo, lo creamos primero y luego agregamos el producto
          this.pedidoService.crearPedido().subscribe({
            next: (nuevoCarrito) => {
              ejecutarAgregar(nuevoCarrito.id);
            },
            error: (err) => {
              console.error('Error al crear el carrito:', err);
              this.isAddingToCart.set(false);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener los pedidos:', err);
        this.isAddingToCart.set(false);
      }
    });
  }

  simulateShipping(): void {
    this.showShippingFeedback.set(true);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  /** Redirige al usuario hacia la vista del carrito de compras */
irAlCarrito(): void {
  this.showToast.set(false); // Cierra el toast opcionalmente al hacer click
  this.router.navigate(['/carrito']);
}
}
