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
import { SelectorEstrellasComponent } from '../selector-estrellas/selector-estrellas.component';


/** Cantidad máxima de productos relacionados que se muestran. */
const MAX_RELACIONADOS = 4;

/** Largo máximo de un comentario (igual que en el backend). */
export const MAX_LARGO_COMENTARIO = 500;

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SelectorEstrellasComponent],
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

  /** Recibe la estrella elegida que emite <app-selector-estrellas> (output calificacionCambiada). */
  elegirCalificacion(valor: number): void {
    this.nuevaCalificacion.set(valor);
    this.errorComentario.set('');
  }

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

  /*Estado de la interfaz (señales, igual que LoginComponent)*/
  readonly quantity = signal(1);
  readonly showToast = signal(false);
  readonly showShippingFeedback = signal(false);
  readonly isAddingToCart = signal(false);

  readonly transferPrice = computed(() => Math.round((this.producto()?.precio ?? 0) * 0.9));
  /** No se puede elegir más cantidad que el stock disponible. */
  readonly maxQuantity = computed(() => Math.max(1, this.producto()?.stock ?? 1));
  readonly sinStock = computed(() => (this.producto()?.stock ?? 0) <= 0);

  /*Acciones*/
  changeQuantity(delta: number): void {
    const next = Math.max(1, Math.min(this.maxQuantity(), this.quantity() + delta));
    this.quantity.set(next);
  }

  triggerAddToCart(): void {
    const productoActual = this.producto();
    if (!productoActual || this.isAddingToCart() || this.sinStock()) return;

    this.isAddingToCart.set(true);

    this.pedidoService.agregarAlCarrito({
      id: productoActual.id,
      nombre: productoActual.nombre,
      categoria: productoActual.categoria?.nombre ?? '',
      subcategoria: productoActual.subcategoria?.nombre ?? '',
      precio: productoActual.precio,
      imageUrl: productoActual.imagen ?? '',
    }, this.quantity()).subscribe({
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
