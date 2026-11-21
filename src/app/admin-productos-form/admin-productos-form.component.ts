import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriaService } from '../services/categoria.service';
import { ProductService } from '../services/product.service';
import { Categoria, Subcategoria } from '../interfaces/categoria';
import { GuardarProductoAdminDTO } from '../interfaces/producto';

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-productos-form.component.html',
  styleUrls: ['./admin-productos-form.component.css']
})
export class AdminProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoriaService = inject (CategoriaService);
  private productService = inject (ProductService);

  categorias: Categoria[] = [];
  todasLasSubcategorias: Subcategoria[] = [];
  subcategoriasFiltradas: Subcategoria[] = [];

  productoId: number | null = null;
  esModoEdicion: boolean = false;
  readonly cargando =signal (false);
  readonly mensajeError = signal('');

  productoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    id_categoria: ['', [Validators.required]],
    id_subcategoria: [{ value: '', disabled: true }, [Validators.required]],
    precio: [null, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagen: [''],
    descripcion: [''],
    destacado: [false]
  });

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.escucharCambioCategoria();
  }

  cargarDatosIniciales(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error cargando categorías:', err)
    });

    this.categoriaService.obtenerSubcategorias().subscribe({
      next: (data) => {
        this.todasLasSubcategorias = data;

        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
          this.productoId = Number(idParam);
          this.esModoEdicion = true;
          this.cargarDatosProducto(this.productoId);
        }
      },
      error: (err) => console.error('Error cargando subcategorías:', err)
    });
  }

  escucharCambioCategoria(): void {
    this.productoForm.get('id_categoria')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((catId) => {
      const categoriaId = Number(catId);
      
      if (!categoriaId) {
        this.subcategoriasFiltradas = [];
        this.productoForm.get('id_subcategoria')?.disable();
        this.productoForm.get('id_subcategoria')?.setValue('');
        return;
      }

      
      this.subcategoriasFiltradas = this.todasLasSubcategorias.filter(
        sub => Number(sub.id_categoria) === categoriaId
      );

      const subcatControl = this.productoForm.get('id_subcategoria');
      subcatControl?.enable();

      
      const subActual = Number(subcatControl?.value);
      const existeEnFiltro = this.subcategoriasFiltradas.some(s => s.id === subActual);
      if (!existeEnFiltro) {
        subcatControl?.setValue('');
      }
    });
  }

  cargarDatosProducto(id: number): void {
    this.cargando.set(true);
    this.productService.obtenerAdminPorId(id).subscribe({
      next: (prod) => {
        this.productoForm.patchValue({
          nombre: prod.nombre,
          id_categoria: prod.id_categoria,
          precio: prod.precio,
          stock: prod.stock,
          imagen: prod.imagen,
          descripcion: prod.descripcion,
          destacado: prod.destacado
        });

       
        this.subcategoriasFiltradas = this.todasLasSubcategorias.filter(
          sub => Number(sub.id_categoria) === Number(prod.id_categoria)
        );
        this.productoForm.get('id_subcategoria')?.enable();
        this.productoForm.get('id_subcategoria')?.setValue(prod.id_subcategoria);

        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudo cargar el producto para editar.');
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    const formVal = this.productoForm.getRawValue(); // getRawValue incluye controles disabled
    const payload: GuardarProductoAdminDTO = {
      nombre: formVal.nombre,
      precio: Number(formVal.precio),
      stock: Number(formVal.stock),
      id_categoria: Number(formVal.id_categoria),
      id_subcategoria: Number(formVal.id_subcategoria),
      imagen: formVal.imagen,
      descripcion: formVal.descripcion,
      destacado: Boolean(formVal.destacado)
    };

    const peticion = (this.esModoEdicion && this.productoId)
      ? this.productService.actualizarAdmin(this.productoId, payload)
      : this.productService.crearAdmin(payload);

    peticion.subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/admin/productos']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(err.error?.error || 'Error al guardar el producto.');
        console.error('Error al guardar:', err);
      }
    });
  }
}
