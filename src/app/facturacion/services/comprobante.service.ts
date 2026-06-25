import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface DatosComprobante {
  reserva: any;
  habitacion: any;
  cliente: any;
  total: number;
  descuento: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  tiempo: string;
  tipoComprobante: string;
  rucIngresado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private datosComprobanteSubject = new Subject<DatosComprobante | null>();
  datosComprobante$ = this.datosComprobanteSubject.asObservable();

  private datosComprobanteActual: DatosComprobante | null = null;

  constructor() {}

  setDatosComprobante(datos: DatosComprobante): void {
    this.datosComprobanteActual = datos;
    this.datosComprobanteSubject.next(datos);
    console.log('💾 ComprobanteService: Datos guardados:', datos);
  }

  getDatosComprobante(): DatosComprobante | null {
    console.log('💾 ComprobanteService: Datos recuperados:', this.datosComprobanteActual);
    return this.datosComprobanteActual;
  }

  limpiarDatos(): void {
    this.datosComprobanteActual = null;
    this.datosComprobanteSubject.next(null);
    console.log('💾 ComprobanteService: Datos limpiados');
  }
}
