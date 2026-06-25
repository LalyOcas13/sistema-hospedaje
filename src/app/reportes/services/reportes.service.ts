import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReporteDiario {
  fecha: string;
  habitacion: string;
  cliente: string;
  total: number;
}

export interface ReporteMensual {
  anio: number;
  mes: number;
  total_ingresos: number;
}

export interface EstadisticasGenerales {
  total_habitaciones: number;
  habitaciones_disponibles: number;
  habitaciones_ocupadas: number;
  total_reservas: number;
  total_ingresos_mes: number;
  total_clientes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:3007/reportes';
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Reportes diarios
  getReporteDiario(fecha?: string): Observable<ReporteDiario[]> {
    const url = fecha ? `${this.apiUrl}/diario?fecha=${fecha}` : `${this.apiUrl}/diario`;
    return this.http.get<ReporteDiario[]>(url, { headers: this.getHeaders() });
  }

  // Reportes mensuales
  getReporteMensual(anio?: number, mes?: number): Observable<ReporteMensual[]> {
    let url = `${this.apiUrl}/mensual`;
    if (anio && mes) {
      url += `?anio=${anio}&mes=${mes}`;
    } else if (anio) {
      url += `?anio=${anio}`;
    }
    return this.http.get<ReporteMensual[]>(url, { headers: this.getHeaders() });
  }

  // Estadísticas generales
  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.http.get<EstadisticasGenerales>(`${this.apiUrl}/estadisticas`, { headers: this.getHeaders() });
  }

  // Reportes de ocupación
  getReporteOcupacion(fechaInicio: string, fechaFin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ocupacion?inicio=${fechaInicio}&fin=${fechaFin}`, { headers: this.getHeaders() });
  }

  // Reportes de consumo más vendidos
  getTopConsumos(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-consumos?limit=${limit}`, { headers: this.getHeaders() });
  }

  // Reportes de clientes frecuentes
  getClientesFrecuentes(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes-frecuentes?limit=${limit}`, { headers: this.getHeaders() });
  }

  // Exportar reportes
  exportarReporteDiario(fecha: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/diario?fecha=${fecha}`, { 
      headers: this.getHeaders(),
      responseType: 'blob' 
    });
  }

  exportarReporteMensual(anio: number, mes: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/mensual?anio=${anio}&mes=${mes}`, { 
      headers: this.getHeaders(),
      responseType: 'blob' 
    });
  }
}
