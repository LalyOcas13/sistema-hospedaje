import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../../../shared/services/local-storage.service';

export interface Reserva {
  id_reserva: number;
  id_habitacion: number;
  id_cliente: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  tiempo: string;
  descuento: number;
  total: number;
  total_descuento: number;
  estado: 'Pendiente' | 'Pagado' | 'Finalizada';
}

export interface CrearReservaRequest {
  id_habitacion: number;
  id_cliente: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  tiempo: string;
  descuento?: number;
  total: number;
  total_descuento: number;
  estado?: 'Pendiente' | 'Pagado' | 'Finalizada';
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  
  constructor(private localStorageService: LocalStorageService) { }

  getReservas(): Observable<Reserva[]> {
    const reservas = this.localStorageService.getReservas();
    return of(reservas).pipe(delay(300)); // Simular delay de red
  }

  getReservaPorId(id: number): Observable<Reserva> {
    const reservas = this.localStorageService.getReservas();
    const reserva = reservas.find((r: any) => r.id_reserva === id);
    
    if (!reserva) {
      return throwError(() => new Error('Reserva no encontrada'));
    }
    
    return of(reserva).pipe(delay(200));
  }

  crearReserva(reserva: CrearReservaRequest): Observable<Reserva> {
    try {
      const nuevaReserva = this.localStorageService.guardarReserva(reserva);
      return of(nuevaReserva).pipe(delay(500));
    } catch (error) {
      return throwError(() => error);
    }
  }

  actualizarReserva(id: number, reserva: Partial<CrearReservaRequest>): Observable<Reserva> {
    try {
      // Para simplificar, actualizamos todo el arreglo
      const reservas = this.localStorageService.getReservas();
      const index = reservas.findIndex((r: any) => r.id_reserva === id);
      
      if (index === -1) {
        throw new Error('Reserva no encontrada');
      }
      
      reservas[index] = { ...reservas[index], ...reserva };
      this.localStorageService.setItem('hoteleria_reservas', reservas);
      
      return of(reservas[index]).pipe(delay(400));
    } catch (error) {
      return throwError(() => error);
    }
  }

  eliminarReserva(id: number): Observable<void> {
    try {
      const reservas = this.localStorageService.getReservas();
      const index = reservas.findIndex((r: any) => r.id_reserva === id);
      
      if (index === -1) {
        throw new Error('Reserva no encontrada');
      }
      
      reservas.splice(index, 1);
      this.localStorageService.setItem('hoteleria_reservas', reservas);
      
      return of(void 0).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }

  getReservasPorCliente(idCliente: number): Observable<Reserva[]> {
    const reservas = this.localStorageService.getReservasPorCliente(idCliente);
    return of(reservas).pipe(delay(200));
  }

  getReservasPorHabitacion(idHabitacion: number): Observable<Reserva[]> {
    const reservas = this.localStorageService.getReservasPorHabitacion(idHabitacion);
    return of(reservas).pipe(delay(200));
  }

  getReservasPorFecha(fechaInicio: string, fechaFin: string): Observable<Reserva[]> {
    const reservas = this.localStorageService.getReservas();
    const filtradas = reservas.filter((r: any) => 
      r.fecha >= fechaInicio && r.fecha <= fechaFin
    );
    return of(filtradas).pipe(delay(200));
  }

  actualizarEstado(id: number, estado: 'Pendiente' | 'Pagado' | 'Finalizada'): Observable<Reserva> {
    return this.actualizarReserva(id, { estado });
  }
}
