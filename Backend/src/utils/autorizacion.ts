/**
 * Reglas de autorización compartidas por todo el backend.
 * Están en un solo lugar para que el middleware, los controllers y los services
 * no repitan (y no puedan contradecir) la misma regla.
 */

/** Nombre del rol administrador, tal como está guardado en la tabla Rol. */
export const ROL_ADMIN = 'ADMIN';

/** true si el rol del token es ADMIN. */
export function esRolAdmin(rol: string | undefined): boolean {
  return rol === ROL_ADMIN;
}

/**
 * Un recurso (datos de usuario, pedido...) solo lo puede ver o modificar
 * su dueño, o un ADMIN.
 */
export function esDuenioOAdmin(idDuenio: number, idUsuario: number, esAdmin: boolean): boolean {
  return idDuenio === idUsuario || esAdmin;
}
