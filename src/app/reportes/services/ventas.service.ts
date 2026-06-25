import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface Venta {
  id: number;
  cliente: string;
  habitacion: string;
  productos: string[];
  total: number;
  fecha: string;
  estado: 'pagado' | 'pendiente' | 'parcial';
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private ventas: Venta[] = [];
  private ventasSubject = new Subject<Venta[]>();
  ventas$ = this.ventasSubject.asObservable();

  constructor() {
    // Cargar ventas desde localStorage si existen
    this.cargarVentas();
  }

  agregarVenta(venta: Venta): void {
    venta.id = this.generarId();
    this.ventas.push(venta);
    this.guardarVentas();
    this.ventasSubject.next([...this.ventas]);
    console.log('💾 VentasService: Venta agregada:', venta);
  }

  obtenerVentas(): Venta[] {
    return [...this.ventas];
  }

  obtenerVentasPorFecha(fecha: string): Venta[] {
    return this.ventas.filter(venta => venta.fecha === fecha);
  }

  obtenerVentasPorPeriodo(mes: number, anio: number): Venta[] {
    return this.ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta.getMonth() === mes && fechaVenta.getFullYear() === anio;
    });
  }

  private generarId(): number {
    return this.ventas.length > 0 ? Math.max(...this.ventas.map(v => v.id)) + 1 : 1;
  }

  private guardarVentas(): void {
    localStorage.setItem('ventas', JSON.stringify(this.ventas));
  }

  private cargarVentas(): void {
    const ventasGuardadas = localStorage.getItem('ventas');
    if (ventasGuardadas) {
      this.ventas = JSON.parse(ventasGuardadas);
    }
  }

  limpiarVentas(): void {
    this.ventas = [];
    localStorage.removeItem('ventas');
    this.ventasSubject.next([]);
  }
}
