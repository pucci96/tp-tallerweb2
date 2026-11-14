/** Un comentario tal como se muestra en la página de detalle del producto. */
export interface ComentarioDTO {
  id: number;
  id_usuario: number;
  autor: string;        // "Juan P." (nombre + inicial del apellido)
  calificacion: number; // 1 a 5
  texto: string;
  fecha: Date;
}

/** Comentarios de un producto junto con el resumen de su calificación. */
export interface ComentariosProductoDTO {
  promedio: number; // 0 si todavía no tiene comentarios; redondeado a 1 decimal
  cantidad: number;
  comentarios: ComentarioDTO[];
}

/** Lo que manda el cliente para comentar. El usuario se toma del token. */
export interface CrearComentarioDTO {
  calificacion: number;
  texto: string;
}
