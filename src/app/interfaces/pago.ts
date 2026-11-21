export interface DatosTarjeta {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
}

export interface ResultadoPago {
  aprobado: boolean;
  motivo?: string;
}

