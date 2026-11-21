export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  direccion: string;
  rol: string;
}

export interface ActualizarPerfilDatos {
  nombre: string;
  apellido: string;
  direccion: string;
  passwordActual?: string;
  passwordNueva?: string;
}

