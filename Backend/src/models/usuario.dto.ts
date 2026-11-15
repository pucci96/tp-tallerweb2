export interface UsuarioDTO {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    direccion: string;
    rol: string;
}

export interface LoginDTO {
    token: string;
    usuario: UsuarioDTO;
}

export interface RolDTO {
    id: number;
    nombre: string;
}

export interface CrearUsuarioDTO {
    nombre: string;
    apellido: string;
    email: string;
    direccion: string;
}

export interface CrearLoginDTO {
    email: string;
    password: string;
}

/**
 * Datos que el usuario puede editar desde su perfil.
 * El email NO se puede cambiar. Para cambiar la contraseña hay que mandar
 * la actual (se verifica) y la nueva; si no se mandan, la contraseña no cambia.
 */
export interface ActualizarUsuarioDTO {
    nombre: string;
    apellido: string;
    direccion: string;
    passwordActual?: string;
    passwordNueva?: string;
}

export interface CrearRolDTO {
    nombre: string;
}
