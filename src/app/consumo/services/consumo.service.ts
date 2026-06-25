import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Consumo {
  id_consumo: number;
  nombre: string;
  detalle: string;
  precio: number;
  stock: number;
  estado: 'Activo' | 'Inactivo';
}

export interface CrearConsumoRequest {
  nombre: string;
  detalle: string;
  precio: number;
  stock: number;
  estado?: 'Activo' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private apiUrl = 'http://localhost:3007/consumo';
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getConsumos(): Observable<Consumo[]> {
    return this.http.get<Consumo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getConsumoPorId(id: number): Observable<Consumo> {
    return this.http.get<Consumo>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearConsumo(consumo: CrearConsumoRequest): Observable<Consumo> {
    return this.http.post<Consumo>(this.apiUrl, consumo, { headers: this.getHeaders() });
  }

  actualizarConsumo(id: number, consumo: Partial<CrearConsumoRequest>): Observable<Consumo> {
    return this.http.put<Consumo>(`${this.apiUrl}/${id}`, consumo, { headers: this.getHeaders() });
  }

  eliminarConsumo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getConsumosActivos(): Observable<Consumo[]> {
    return this.http.get<Consumo[]>(`${this.apiUrl}/activos`, { headers: this.getHeaders() });
  }

  actualizarStock(id: number, stock: number): Observable<Consumo> {
    return this.http.patch<Consumo>(`${this.apiUrl}/${id}/stock`, { stock }, { headers: this.getHeaders() });
  }

  actualizarEstado(id: number, estado: 'Activo' | 'Inactivo'): Observable<Consumo> {
    return this.http.patch<Consumo>(`${this.apiUrl}/${id}/estado`, { estado }, { headers: this.getHeaders() });
  }
}
