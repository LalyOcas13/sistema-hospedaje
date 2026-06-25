import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Habitacion {
  id_habitacion: number;
  numero: string;
  tipo_habitacion: 'Individual' | 'Doble' | 'Matrimonial';
  descripcion: string;
  precio: number;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

export interface CrearHabitacionRequest {
  numero: string;
  tipo_habitacion: 'Individual' | 'Doble' | 'Matrimonial';
  descripcion: string;
  precio: number;
  estado?: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private apiUrl = 'http://localhost:3000/habitaciones';
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getHabitacionPorId(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  crearHabitacion(habitacion: CrearHabitacionRequest): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.apiUrl, habitacion, { headers: this.getHeaders() });
  }

  actualizarHabitacion(id: number, habitacion: Partial<CrearHabitacionRequest>): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.apiUrl}/${id}`, habitacion, { headers: this.getHeaders() });
  }

  eliminarHabitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getHabitacionesDisponibles(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/disponibles`, { headers: this.getHeaders() });
  }

  actualizarEstado(id: number, estado: 'Disponible' | 'Ocupado' | 'Mantenimiento'): Observable<Habitacion> {
    return this.http.patch<Habitacion>(`${this.apiUrl}/${id}/estado`, { estado }, { headers: this.getHeaders() });
  }
}
