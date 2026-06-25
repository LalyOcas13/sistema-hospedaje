export interface ConsumoItem {
  cantidad: number;
  producto: string;
  precio: number;
  importe: number;
  estado: string;
}

export interface Producto {
  nombre: string;
  precio: number;
}

export interface NuevoProducto {
  nombre: string;
  detalle: string;
  precio: number;
  cantidad: number;
  estado: string;
}
