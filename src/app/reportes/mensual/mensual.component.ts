import { Component, OnInit } from '@angular/core';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';
import { VentasService } from '../services/ventas.service';
import * as XLSX from 'xlsx';

interface VentaMensual {
  id: number;
  cliente: string;
  habitacion: string;
  productos: string[];
  total: number;
  fecha: string;
  estado: 'pagado' | 'pendiente' | 'parcial';
}

interface ResumenMensual {
  mes: string;
  año: number;
  totalVentas: number;
  totalPagado: number;
  totalPendiente: number;
  cantidadVentas: number;
  productosMasVendidos: { nombre: string; cantidad: number }[];
  ventasPorDia: { dia: number; total: number; cantidad: number }[];
  habitacionMasRentable: { habitacion: string; ingresos: number; ventas: number };
  habitacionesEstadisticas: { 
    habitacion: string; 
    tipo: string; 
    ingresos: number; 
    ventas: number; 
    ocupacion: number; 
    estado: 'disponible' | 'ocupada' | 'mantenimiento' | 'reservado';
  }[];
}

@Component({
  selector: 'app-mensual',
  standalone: false,
  templateUrl: './mensual.component.html',
  styleUrl: './mensual.component.css'
})
export class MensualComponent implements OnInit {
  currentUser = {
    name: 'Adminstrador'
  };

  // Filtros (usando fecha local, no UTC)
  mesSeleccionado: number = new Date().getMonth();
  anioSeleccionado: number = new Date().getFullYear();
  vistaActual: 'resumen' | 'detalles' = 'resumen';

  // Datos de ejemplo - Base de datos simulada
  todasLasVentas: VentaMensual[] = [
    // Enero 2024
    {
      id: 1,
      cliente: 'Juan Pérez García',
      habitacion: 'Suite 201',
      productos: ['Agua Mineral', 'Gaseosa', 'Snacks'],
      total: 45.00,
      fecha: '2024-01-01',
      estado: 'pagado'
    },
    {
      id: 2,
      cliente: 'María López Martínez',
      habitacion: 'Doble 105',
      productos: ['Cerveza', 'Jugo Natural'],
      total: 38.50,
      fecha: '2024-01-02',
      estado: 'pendiente'
    },
    {
      id: 3,
      cliente: 'Carlos Rodríguez Sánchez',
      habitacion: 'Individual 302',
      productos: ['Agua Mineral', 'Snacks'],
      total: 22.00,
      fecha: '2024-01-03',
      estado: 'parcial'
    },
    {
      id: 4,
      cliente: 'Ana García Fernández',
      habitacion: 'Suite 205',
      productos: ['Cerveza', 'Gaseosa', 'Agua Mineral'],
      total: 52.00,
      fecha: '2024-01-04',
      estado: 'pagado'
    },
    {
      id: 5,
      cliente: 'Luis Martínez López',
      habitacion: 'Doble 108',
      productos: ['Snacks', 'Jugo Natural', 'Cerveza'],
      total: 48.00,
      fecha: '2024-01-05',
      estado: 'pagado'
    },
    // Febrero 2024
    {
      id: 6,
      cliente: 'Carmen Rodríguez',
      habitacion: 'Suite 201',
      productos: ['Agua Mineral'],
      total: 15.00,
      fecha: '2024-02-01',
      estado: 'pagado'
    },
    {
      id: 7,
      cliente: 'Pedro García',
      habitacion: 'Doble 105',
      productos: ['Gaseosa', 'Snacks'],
      total: 32.00,
      fecha: '2024-02-02',
      estado: 'pagado'
    },
    {
      id: 8,
      cliente: 'Laura Martínez',
      habitacion: 'Individual 302',
      productos: ['Cerveza'],
      total: 18.00,
      fecha: '2024-02-03',
      estado: 'pendiente'
    },
    // Marzo 2024
    {
      id: 9,
      cliente: 'Roberto Sánchez',
      habitacion: 'Suite 205',
      productos: ['Agua Mineral', 'Gaseosa'],
      total: 28.00,
      fecha: '2024-03-01',
      estado: 'pagado'
    },
    {
      id: 10,
      cliente: 'Elena López',
      habitacion: 'Doble 108',
      productos: ['Snacks', 'Cerveza'],
      total: 42.00,
      fecha: '2024-03-02',
      estado: 'pagado'
    },
    // Mayo 2024
    {
      id: 11,
      cliente: 'Miguel Fernández',
      habitacion: 'Suite 201',
      productos: ['Agua Mineral', 'Jugo Natural'],
      total: 35.00,
      fecha: '2024-05-26',
      estado: 'pagado'
    },
    {
      id: 12,
      cliente: 'Sofía Rodríguez',
      habitacion: 'Doble 105',
      productos: ['Gaseosa', 'Snacks'],
      total: 32.00,
      fecha: '2024-05-27',
      estado: 'pagado'
    },
    {
      id: 13,
      cliente: 'Diego Martínez',
      habitacion: 'Individual 302',
      productos: ['Cerveza'],
      total: 18.00,
      fecha: '2024-05-27',
      estado: 'pendiente'
    }
  ];

  // Datos filtrados por mes y año
  resumenMensual: ResumenMensual = {
    mes: '',
    año: 0,
    totalVentas: 0,
    totalPagado: 0,
    totalPendiente: 0,
    cantidadVentas: 0,
    productosMasVendidos: [],
    ventasPorDia: [],
    habitacionMasRentable: {
      habitacion: '',
      ingresos: 0,
      ventas: 0
    },
    habitacionesEstadisticas: []
  };

  ventasMensuales: VentaMensual[] = [];

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private mensajeFlotanteService: MensajeFlotanteService,
    private ventasService: VentasService
  ) { }

  ngOnInit(): void {
    this.cargarDatosPorPeriodo(this.mesSeleccionado, this.anioSeleccionado);
  }

  cargarDatosPorPeriodo(mes: number, anio: number): void {
    // Obtener ventas del servicio (ventas reales) + datos simulados
    const ventasReales = this.ventasService.obtenerVentasPorPeriodo(mes, anio);
    const ventasSimuladas = this.todasLasVentas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta.getMonth() === mes && fechaVenta.getFullYear() === anio;
    });

    // Combinar ventas reales y simuladas
    this.ventasMensuales = [...ventasReales, ...ventasSimuladas];

    // Calcular resumen
    this.resumenMensual = {
      mes: this.meses[mes],
      año: anio,
      totalVentas: this.ventasMensuales.reduce((sum, v) => sum + v.total, 0),
      totalPagado: this.ventasMensuales.filter(v => v.estado === 'pagado').reduce((sum, v) => sum + v.total, 0),
      totalPendiente: this.ventasMensuales.filter(v => v.estado === 'pendiente').reduce((sum, v) => sum + v.total, 0),
      cantidadVentas: this.ventasMensuales.length,
      productosMasVendidos: this.calcularProductosMasVendidos(),
      ventasPorDia: this.calcularVentasPorDia(),
      habitacionMasRentable: this.calcularHabitacionMasRentable(),
      habitacionesEstadisticas: this.calcularEstadisticasHabitaciones()
    };

    if (this.ventasMensuales.length === 0) {
      this.mensajeFlotanteService.mostrarInfo(
        `No hay ventas registradas para ${this.meses[mes]} ${anio}`,
        'Sin Datos'
      );
    }
  }

  onMesChange(): void {
    this.cargarDatosPorPeriodo(this.mesSeleccionado, this.anioSeleccionado);
  }

  onAnioChange(): void {
    this.cargarDatosPorPeriodo(this.mesSeleccionado, this.anioSeleccionado);
  }

  private calcularProductosMasVendidos(): { nombre: string; cantidad: number }[] {
    const productosMap: { [key: string]: number } = {};

    this.ventasMensuales.forEach(venta => {
      venta.productos.forEach(producto => {
        productosMap[producto] = (productosMap[producto] || 0) + 1;
      });
    });

    return Object.entries(productosMap)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }

  private calcularVentasPorDia(): { dia: number; total: number; cantidad: number }[] {
    const ventasPorDiaMap: { [key: number]: { total: number; cantidad: number } } = {};

    this.ventasMensuales.forEach(venta => {
      const dia = new Date(venta.fecha).getDate();
      if (!ventasPorDiaMap[dia]) {
        ventasPorDiaMap[dia] = { total: 0, cantidad: 0 };
      }
      ventasPorDiaMap[dia].total += venta.total;
      ventasPorDiaMap[dia].cantidad += 1;
    });

    return Object.entries(ventasPorDiaMap)
      .map(([dia, data]) => ({ dia: parseInt(dia), total: data.total, cantidad: data.cantidad }))
      .sort((a, b) => a.dia - b.dia);
  }

  private calcularHabitacionMasRentable(): { habitacion: string; ingresos: number; ventas: number } {
    const habitacionMap: { [key: string]: { ingresos: number; ventas: number } } = {};

    this.ventasMensuales.forEach(venta => {
      if (!habitacionMap[venta.habitacion]) {
        habitacionMap[venta.habitacion] = { ingresos: 0, ventas: 0 };
      }
      habitacionMap[venta.habitacion].ingresos += venta.total;
      habitacionMap[venta.habitacion].ventas += 1;
    });

    const habitaciones = Object.entries(habitacionMap)
      .map(([habitacion, data]) => ({ habitacion, ingresos: data.ingresos, ventas: data.ventas }))
      .sort((a, b) => b.ingresos - a.ingresos);

    return habitaciones.length > 0 ? habitaciones[0] : { habitacion: '', ingresos: 0, ventas: 0 };
  }

  private calcularEstadisticasHabitaciones(): { 
    habitacion: string; 
    tipo: string; 
    ingresos: number; 
    ventas: number; 
    ocupacion: number; 
    estado: 'disponible' | 'ocupada' | 'mantenimiento' | 'reservado';
  }[] {
    const habitacionMap: { [key: string]: { ingresos: number; ventas: number } } = {};

    this.ventasMensuales.forEach(venta => {
      if (!habitacionMap[venta.habitacion]) {
        habitacionMap[venta.habitacion] = { ingresos: 0, ventas: 0 };
      }
      habitacionMap[venta.habitacion].ingresos += venta.total;
      habitacionMap[venta.habitacion].ventas += 1;
    });

    return Object.entries(habitacionMap)
      .map(([habitacion, data]) => ({
        habitacion,
        tipo: this.getTipoHabitacion(habitacion),
        ingresos: data.ingresos,
        ventas: data.ventas,
        ocupacion: Math.min(Math.round((data.ventas / 30) * 100), 100),
        estado: 'disponible' as const
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  }

  private getTipoHabitacion(habitacion: string): string {
    if (habitacion.includes('Suite')) return 'Suite';
    if (habitacion.includes('Doble')) return 'Doble';
    if (habitacion.includes('Individual')) return 'Individual';
    return 'Simple';
  }

  cambiarVista(vista: 'resumen' | 'detalles'): void {
    this.vistaActual = vista;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pagado': return 'estado-pagado';
      case 'pendiente': return 'estado-pendiente';
      case 'parcial': return 'estado-parcial';
      default: return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pagado': return 'fas fa-check-circle';
      case 'pendiente': return 'fas fa-clock';
      case 'parcial': return 'fas fa-exclamation-circle';
      default: return '';
    }
  }

  exportarReporte(): void {
    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen mensual
    const resumenData = [
      ['HOSPEDAJE LAY - REPORTE MENSUAL DE VENTAS'],
      [`Periodo: ${this.resumenMensual.mes} ${this.resumenMensual.año}`],
      [''],
      ['RESUMEN MENSUAL'],
      ['Concepto', 'Monto'],
      ['Total Ventas', this.resumenMensual.totalVentas],
      ['Total Pagado', this.resumenMensual.totalPagado],
      ['Total Pendiente', this.resumenMensual.totalPendiente],
      ['Cantidad de Ventas', this.resumenMensual.cantidadVentas],
      [''],
      ['HABITACIÓN MÁS RENTABLE'],
      ['Habitación', this.resumenMensual.habitacionMasRentable.habitacion],
      ['Ingresos', this.resumenMensual.habitacionMasRentable.ingresos],
      ['Ventas', this.resumenMensual.habitacionMasRentable.ventas]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    wsResumen['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };
    wsResumen['A4'].s = {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: '4472C4' } }
    };
    wsResumen['A5'].s = { font: { bold: true } };
    wsResumen['B5'].s = { font: { bold: true } };
    wsResumen['A12'].s = {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: '70AD47' } }
    };

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2: Productos más vendidos
    const productosData = [
      ['PRODUCTOS MÁS VENDIDOS'],
      [''],
      ['Producto', 'Cantidad'],
      ...this.resumenMensual.productosMasVendidos.map(p => [p.nombre, p.cantidad])
    ];
    const wsProductos = XLSX.utils.aoa_to_sheet(productosData);

    wsProductos['A1'].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
    wsProductos['A3'].s = { font: { bold: true } };
    wsProductos['B3'].s = { font: { bold: true } };

    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');

    // Hoja 3: Ventas por día
    const ventasDiaData = [
      ['VENTAS POR DÍA'],
      [''],
      ['Día', 'Total (S/.)', 'Cantidad'],
      ...this.resumenMensual.ventasPorDia.map(v => [v.dia, v.total, v.cantidad])
    ];
    const wsVentasDia = XLSX.utils.aoa_to_sheet(ventasDiaData);

    wsVentasDia['A1'].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
    wsVentasDia['A3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentasDia['B3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentasDia['C3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };

    XLSX.utils.book_append_sheet(wb, wsVentasDia, 'Ventas por Día');

    // Hoja 4: Estadísticas de habitaciones
    const habitacionesData = [
      ['ESTADÍSTICAS DE HABITACIONES'],
      [''],
      ['Habitación', 'Tipo', 'Ingresos', 'Ventas', 'Ocupación (%)', 'Estado'],
      ...this.resumenMensual.habitacionesEstadisticas.map(h => [
        h.habitacion,
        h.tipo,
        h.ingresos,
        h.ventas,
        h.ocupacion,
        h.estado
      ])
    ];
    const wsHabitaciones = XLSX.utils.aoa_to_sheet(habitacionesData);

    wsHabitaciones['A1'].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
    wsHabitaciones['A3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsHabitaciones['B3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsHabitaciones['C3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsHabitaciones['D3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsHabitaciones['E3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsHabitaciones['F3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };

    XLSX.utils.book_append_sheet(wb, wsHabitaciones, 'Habitaciones');

    // Hoja 5: Detalle de ventas
    const ventasData = [
      ['DETALLE DE VENTAS'],
      [''],
      ['ID', 'Cliente', 'Habitación', 'Productos', 'Total (S/.)', 'Estado', 'Fecha'],
      ...this.ventasMensuales.map(v => [
        v.id,
        v.cliente,
        v.habitacion,
        v.productos.join(' | '),
        v.total,
        v.estado,
        v.fecha
      ])
    ];
    const wsVentas = XLSX.utils.aoa_to_sheet(ventasData);

    wsVentas['A1'].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
    wsVentas['A3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['B3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['C3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['D3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['E3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['F3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };
    wsVentas['G3'].s = { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } } };

    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');

    // Generar y descargar archivo
    XLSX.writeFile(wb, `reporte_mensual_${this.resumenMensual.mes}_${this.resumenMensual.año}.xlsx`);

    this.mensajeFlotanteService.mostrarInfo(
      'Reporte mensual exportado correctamente',
      'Exportación Exitosa'
    );
  }

  imprimirReporte(): void {
    const printContent = this.generarHTMLImpresion();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.mensajeFlotanteService.mostrarError(
        'No se pudo abrir la ventana de impresión',
        'Error de Impresión'
      );
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  private generarHTMLImpresion(): string {
    const periodo = `${this.resumenMensual.mes} ${this.resumenMensual.año}`;

    let ventasHTML = '';
    this.ventasMensuales.forEach(venta => {
      const productosStr = venta.productos.join(', ');
      ventasHTML += `
        <tr>
          <td>${venta.id}</td>
          <td>${venta.cliente}</td>
          <td>${venta.habitacion}</td>
          <td>${productosStr}</td>
          <td>S/. ${venta.total.toFixed(2)}</td>
          <td>${venta.estado}</td>
          <td>${venta.fecha}</td>
        </tr>
      `;
    });

    let habitacionesHTML = '';
    this.resumenMensual.habitacionesEstadisticas.forEach(h => {
      habitacionesHTML += `
        <tr>
          <td>${h.habitacion}</td>
          <td>${h.tipo}</td>
          <td>S/. ${h.ingresos.toFixed(2)}</td>
          <td>${h.ventas}</td>
          <td>${h.ocupacion}%</td>
          <td>${h.estado}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Mensual - ${periodo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .resumen {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
          }
          .resumen-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .resumen-row.total {
            border-top: 1px solid #333;
            padding-top: 5px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #333;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 9px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE MENSUAL DE VENTAS</h1>
          <p>HOSPEDAJE LAY</p>
          <p>Periodo: ${periodo}</p>
        </div>

        <div class="resumen">
          <h3>RESUMEN MENSUAL</h3>
          <div class="resumen-row">
            <span>Total Ventas:</span>
            <span>S/. ${this.resumenMensual.totalVentas.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Total Pagado:</span>
            <span>S/. ${this.resumenMensual.totalPagado.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Total Pendiente:</span>
            <span>S/. ${this.resumenMensual.totalPendiente.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Cantidad de Ventas:</span>
            <span>${this.resumenMensual.cantidadVentas}</span>
          </div>
          <div class="resumen-row">
            <span>Habitación Más Rentable:</span>
            <span>${this.resumenMensual.habitacionMasRentable.habitacion} (S/. ${this.resumenMensual.habitacionMasRentable.ingresos.toFixed(2)})</span>
          </div>
        </div>

        <h3 class="section-title">ESTADÍSTICAS DE HABITACIONES</h3>
        <table>
          <thead>
            <tr>
              <th>Habitación</th>
              <th>Tipo</th>
              <th>Ingresos</th>
              <th>Ventas</th>
              <th>Ocupación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${habitacionesHTML}
          </tbody>
        </table>

        <h3 class="section-title">DETALLE DE VENTAS</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Habitación</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${ventasHTML}
          </tbody>
        </table>

        <div class="footer">
          <p>Reporte generado automáticamente por Sistema de Hotel</p>
          <p>Fecha de impresión: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  getPorcentajePagado(): number {
    return (this.resumenMensual.totalPagado / this.resumenMensual.totalVentas) * 100;
  }

  getPorcentajePendiente(): number {
    return (this.resumenMensual.totalPendiente / this.resumenMensual.totalVentas) * 100;
  }

  getEstadoHabitacionClass(estado: string): string {
    switch (estado) {
      case 'disponible': return 'estado-disponible';
      case 'ocupada': return 'estado-ocupada';
      case 'mantenimiento': return 'estado-mantenimiento';
      case 'reservado': return 'estado-reservado';
      default: return '';
    }
  }

  getEstadoHabitacionIcon(estado: string): string {
    switch (estado) {
      case 'disponible': return 'fas fa-check-circle';
      case 'ocupada': return 'fas fa-user';
      case 'mantenimiento': return 'fas fa-tools';
      case 'reservado': return 'fas fa-calendar-check';
      default: return '';
    }
  }

  getOcupacionColor(ocupacion: number): string {
    if (ocupacion >= 80) return 'ocupacion-alta';
    if (ocupacion >= 50) return 'ocupacion-media';
    return 'ocupacion-baja';
  }
}
