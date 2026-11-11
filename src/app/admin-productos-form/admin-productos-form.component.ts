import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-productos-form.component.html',
  styleUrls: ['./admin-productos-form.component.css']
})
export class AdminProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiUrl = environment.apiUrl;

  categorias: any[] = [];
  todasLasSubcategorias: any[] = [];
  subcategoriasFiltradas: any[] = [];

  productoId: number | null = null;
  esModoEdicion: boolean = false;
  cargando: boolean = false;
  mensajeError: string = '';

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
    // 1. Cargar Categorías
    this.http.get<any[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorías:', err)
    });

    // 2. Cargar Subcategorías
    this.http.get<any[]>(`${this.apiUrl}/subcategorias`).subscribe({
      next: (data) => {
        this.todasLasSubcategorias = data;
        
        // Si viene en modo edición, cargamos el producto una vez tengamos las subcategorías
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
    this.productoForm.get('id_categoria')?.valueChanges.subscribe((catId) => {
      const categoriaId = Number(catId);
      
      if (!categoriaId) {
        this.subcategoriasFiltradas = [];
        this.productoForm.get('id_subcategoria')?.disable();
        this.productoForm.get('id_subcategoria')?.setValue('');
        return;
      }

      // Filtramos subcategorías pertenecientes a la categoría seleccionada
      this.subcategoriasFiltradas = this.todasLasSubcategorias.filter(
        sub => Number(sub.id_categoria) === categoriaId
      );

      const subcatControl = this.productoForm.get('id_subcategoria');
      subcatControl?.enable();

      // Si la subcategoría actualmente seleccionada no pertenece a la nueva lista, la reseteamos
      const subActual = Number(subcatControl?.value);
      const existeEnFiltro = this.subcategoriasFiltradas.some(s => s.id === subActual);
      if (!existeEnFiltro) {
        subcatControl?.setValue('');
      }
    });
  }

  cargarDatosProducto(id: number): void {
    this.cargando = true;
    this.http.get<any>(`${this.apiUrl}/productos/admin/${id}`).subscribe({
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

        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el producto para editar.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const formVal = this.productoForm.getRawValue(); // getRawValue incluye controles disabled
    const payload = {
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
      ? this.http.put(`${this.apiUrl}/productos/admin/${this.productoId}`, payload)
      : this.http.post(`${this.apiUrl}/productos/admin`, payload);

    peticion.subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/admin/productos']);
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.error || 'Error al guardar el producto.';
        console.error('Error al guardar:', err);
      }
    });
  }
}
