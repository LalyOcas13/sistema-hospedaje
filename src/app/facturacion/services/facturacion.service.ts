import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Factura {
  id_factura: number;
  id_reserva: number;
  tipo_comprobante: 'Boleta' | 'Factura';
  metodo_pago: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin';
  total: number;
  fecha: string;
}

export interface CrearFacturaRequest {
  id_reserva: number;
  tipo_comprobante: 'Boleta' | 'Factura';
  metodo_pago: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin';
  total: number;
  fecha?: string;
}

export interface Venta {
  id_venta: number;
  id_reserva: number;
  fecha: string;
  total: number;
  estado: 'Pendiente' | 'Pagado';
}

export interface DetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_consumo: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CrearVentaRequest {
  id_reserva: number;
  total: number;
  detalles: {
    id_consumo: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private apiUrl = 'http://localhost:3007/facturacion';
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Facturación
  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/facturas`, { headers: this.getHeaders() });
  }

  crearFactura(factura: CrearFacturaRequest): Observable<Factura> {
    return this.http.post<Factura>(`${this.apiUrl}/facturas`, factura, { headers: this.getHeaders() });
  }

  getFacturasPorReserva(idReserva: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/facturas/reserva/${idReserva}`, { headers: this.getHeaders() });
  }

  // Ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas`, { headers: this.getHeaders() });
  }

  crearVenta(venta: CrearVentaRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/ventas`, venta, { headers: this.getHeaders() });
  }

  getVentaPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/ventas/${id}`, { headers: this.getHeaders() });
  }

  getDetallesVenta(idVenta: number): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/ventas/${idVenta}/detalles`, { headers: this.getHeaders() });
  }

  actualizarEstadoVenta(id: number, estado: 'Pendiente' | 'Pagado'): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/ventas/${id}/estado`, { estado }, { headers: this.getHeaders() });
  }

  // Reportes
  getReporteDiario(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/diario?fecha=${fecha}`, { headers: this.getHeaders() });
  }

  getReporteMensual(anio: number, mes: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/mensual?anio=${anio}&mes=${mes}`, { headers: this.getHeaders() });
  }
}
