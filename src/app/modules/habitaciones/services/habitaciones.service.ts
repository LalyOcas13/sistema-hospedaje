import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../../shared/services/local-storage.service';

export interface Habitacion {
  id_habitacion: number;
  numero: string;
  tipo_habitacion: 'Individual' | 'Doble';
  descripcion: string;
  precio: number;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

export interface CrearHabitacionRequest {
  numero: string;
  tipo_habitacion: 'Individual' | 'Doble';
  descripcion: string;
  precio: number;
  estado?: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  
  constructor(private localStorageService: LocalStorageService) { }

  getHabitaciones(): Observable<Habitacion[]> {
    const habitaciones = this.localStorageService.getHabitaciones();
    return of(habitaciones).pipe(delay(300)); // Simular delay de red
  }

  getHabitacionPorId(id: number): Observable<Habitacion> {
    const habitaciones = this.localStorageService.getHabitaciones();
    const habitacion = habitaciones.find((h: any) => h.id_habitacion === id);
    
    if (!habitacion) {
      return throwError(() => new Error('Habitación no encontrada'));
    }
    
    return of(habitacion).pipe(delay(200));
  }

  crearHabitacion(habitacion: CrearHabitacionRequest): Observable<Habitacion> {
    try {
      const nuevaHabitacion = this.localStorageService.guardarHabitacion(habitacion);
      return of(nuevaHabitacion).pipe(delay(500));
    } catch (error) {
      return throwError(() => error);
    }
  }

  actualizarHabitacion(id: number, habitacion: Partial<CrearHabitacionRequest>): Observable<Habitacion> {
    try {
      const habitacionActualizada = this.localStorageService.actualizarHabitacion(id, habitacion);
      return of(habitacionActualizada).pipe(delay(400));
    } catch (error) {
      return throwError(() => error);
    }
  }

  eliminarHabitacion(id: number): Observable<void> {
    try {
      this.localStorageService.eliminarHabitacion(id);
      return of(void 0).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }

  getHabitacionesDisponibles(): Observable<Habitacion[]> {
    const habitaciones = this.localStorageService.getHabitacionesDisponibles();
    return of(habitaciones).pipe(delay(200));
  }

  actualizarEstado(id: number, estado: 'Disponible' | 'Ocupado' | 'Mantenimiento'): Observable<Habitacion> {
    try {
      const habitacionActualizada = this.localStorageService.actualizarEstadoHabitacion(id, estado);
      return of(habitacionActualizada).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }
}
