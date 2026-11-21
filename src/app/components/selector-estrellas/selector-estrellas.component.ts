import { Component, computed, input, output, signal } from '@angular/core';

/**
 * Selector de calificación de 1 a 5 estrellas, reutilizable.
 *
 * - Recibe del padre la calificación elegida con input().
 * - Avisa al padre la estrella que se eligió con output(): el padre decide
 *   qué hacer con ese valor (guardarlo, validarlo, etc.).
 *
 * Uso: <app-selector-estrellas [calificacion]="valor()" (calificacionCambiada)="elegir($event)" />
 */
@Component({
  imports: [],
  selector: 'app-selector-estrellas',
  styleUrl: './selector-estrellas.component.css',
  templateUrl: './selector-estrellas.component.html',
})
export class SelectorEstrellasComponent {
  /** Calificación elegida actualmente (0 = ninguna). */
  readonly calificacion = input(0);
  /** Deshabilita las estrellas (por ejemplo, mientras se envía el formulario). */
  readonly deshabilitado = input(false);

  /** Se emite con el número de estrella (1 a 5) cuando el usuario hace click. */
  readonly calificacionCambiada = output<number>();

  readonly estrellas = [1, 2, 3, 4, 5];

  /** Estrella bajo el mouse: sirve para "previsualizar" antes de hacer click. */
  readonly hover = signal(0);

  /** Estrellas que se ven llenas (la del hover tiene prioridad sobre la elegida). */
  readonly visible = computed(() => this.hover() || this.calificacion());

  elegir(valor: number): void {
    this.calificacionCambiada.emit(valor);
  }
}
