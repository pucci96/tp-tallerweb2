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

export interface CrearRolDTO {
    nombre: string;
}
