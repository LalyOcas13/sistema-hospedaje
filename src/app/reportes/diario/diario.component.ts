import { Component, OnInit } from '@angular/core';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';
import { VentasService } from '../services/ventas.service';
import * as XLSX from 'xlsx';

interface VentaDiaria {
  id: number;
  cliente: string;
  habitacion: string;
  productos: string[];
  total: number;
  fecha: string;
  estado: 'pagado' | 'pendiente' | 'parcial';
}

interface ResumenDiario {
  fecha: string;
  totalVentas: number;
  totalPagado: number;
  totalPendiente: number;
  cantidadVentas: number;
  productosMasVendidos: { nombre: string; cantidad: number }[];
}

@Component({
  selector: 'app-diario',
  standalone: false,
  templateUrl: './diario.component.html',
  styleUrl: './diario.component.css'
})
export class DiarioComponent implements OnInit {
  currentUser = {
    name: 'Adminstrador'
  };

  // Vista actual
  vistaActual: 'resumen' | 'detalles' = 'resumen';
  fechaSeleccionada: string = '';

  // Datos de ejemplo - Base de datos simulada
  todasLasVentas: VentaDiaria[] = [
    {
      id: 1,
      cliente: 'Juan Pérez García',
      habitacion: 'Suite 201',
      productos: ['Agua Mineral', 'Gaseosa'],
      total: 25.00,
      fecha: '2024-05-26',
      estado: 'pagado'
    },
    {
      id: 2,
      cliente: 'María López Martínez',
      habitacion: 'Doble 105',
      productos: ['Snacks', 'Cerveza'],
      total: 38.50,
      fecha: '2024-05-26',
      estado: 'pendiente'
    },
    {
      id: 3,
      cliente: 'Carlos Rodríguez Sánchez',
      habitacion: 'Individual 302',
      productos: ['Agua Mineral', 'Jugo Natural'],
      total: 22.00,
      fecha: '2024-05-26',
      estado: 'parcial'
    },
    {
      id: 4,
      cliente: 'Ana García Fernández',
      habitacion: 'Suite 205',
      productos: ['Cerveza', 'Snacks', 'Gaseosa'],
      total: 45.00,
      fecha: '2024-05-26',
      estado: 'pagado'
    },
    {
      id: 5,
      cliente: 'Luis Martínez López',
      habitacion: 'Doble 108',
      productos: ['Agua Mineral'],
      total: 15.00,
      fecha: '2024-05-27',
      estado: 'pagado'
    },
    {
      id: 6,
      cliente: 'Carmen Rodríguez',
      habitacion: 'Suite 201',
      productos: ['Gaseosa', 'Snacks'],
      total: 32.00,
      fecha: '2024-05-27',
      estado: 'pagado'
    },
    {
      id: 7,
      cliente: 'Pedro García',
      habitacion: 'Individual 302',
      productos: ['Cerveza'],
      total: 18.00,
      fecha: '2024-05-27',
      estado: 'pendiente'
    }
  ];

  // Datos filtrados por fecha
  resumenDiario: ResumenDiario = {
    fecha: '',
    totalVentas: 0,
    totalPagado: 0,
    totalPendiente: 0,
    cantidadVentas: 0,
    productosMasVendidos: []
  };

  ventasDiarias: VentaDiaria[] = [];

  constructor(
    private mensajeFlotanteService: MensajeFlotanteService,
    private ventasService: VentasService
  ) { }

  ngOnInit(): void {
    // Inicializar con la fecha de hoy (usando fecha local, no UTC)
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    this.fechaSeleccionada = `${year}-${month}-${day}`;
    this.cargarDatosPorFecha(this.fechaSeleccionada);

    // Suscribirse a cambios en las ventas
    this.ventasService.ventas$.subscribe(() => {
      this.cargarDatosPorFecha(this.fechaSeleccionada);
    });
  }

  cargarDatosPorFecha(fecha: string): void {
    // Obtener ventas del servicio (ventas reales) + datos simulados
    const ventasReales = this.ventasService.obtenerVentasPorFecha(fecha);
    const ventasSimuladas = this.todasLasVentas.filter(venta => venta.fecha === fecha);

    console.log('📊 Cargando datos para fecha:', fecha);
    console.log('📊 Ventas reales:', ventasReales);
    console.log('📊 Ventas simuladas:', ventasSimuladas);

    // Combinar ventas reales y simuladas
    this.ventasDiarias = [...ventasReales, ...ventasSimuladas];

    // Calcular resumen
    this.resumenDiario = {
      fecha: fecha,
      totalVentas: this.ventasDiarias.reduce((sum, v) => sum + v.total, 0),
      totalPagado: this.ventasDiarias.filter(v => v.estado === 'pagado').reduce((sum, v) => sum + v.total, 0),
      totalPendiente: this.ventasDiarias.filter(v => v.estado === 'pendiente').reduce((sum, v) => sum + v.total, 0),
      cantidadVentas: this.ventasDiarias.length,
      productosMasVendidos: this.calcularProductosMasVendidos()
    };

    if (this.ventasDiarias.length === 0) {
      this.mensajeFlotanteService.mostrarInfo(
        `No hay ventas registradas para la fecha ${fecha}`,
        'Sin Datos'
      );
    }
  }

  onFechaChange(): void {
    if (this.fechaSeleccionada) {
      this.cargarDatosPorFecha(this.fechaSeleccionada);
    }
  }

  private calcularProductosMasVendidos(): { nombre: string; cantidad: number }[] {
    const productosMap: { [key: string]: number } = {};

    this.ventasDiarias.forEach(venta => {
      venta.productos.forEach(producto => {
        productosMap[producto] = (productosMap[producto] || 0) + 1;
      });
    });

    return Object.entries(productosMap)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
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

    // Hoja 1: Resumen del día
    const resumenData = [
      ['HOSPEDAJE LAY - REPORTE DIARIO DE VENTAS'],
      [`Fecha: ${this.resumenDiario.fecha}`],
      [''],
      ['RESUMEN DEL DÍA'],
      ['Concepto', 'Monto'],
      ['Total Ventas', this.resumenDiario.totalVentas],
      ['Total Pagado', this.resumenDiario.totalPagado],
      ['Total Pendiente', this.resumenDiario.totalPendiente],
      ['Cantidad de Ventas', this.resumenDiario.cantidadVentas]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    // Aplicar estilos al resumen
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

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2: Productos más vendidos
    const productosData = [
      ['PRODUCTOS MÁS VENDIDOS'],
      [''],
      ['Producto', 'Cantidad'],
      ...this.resumenDiario.productosMasVendidos.map(p => [p.nombre, p.cantidad])
    ];
    const wsProductos = XLSX.utils.aoa_to_sheet(productosData);

    wsProductos['A1'].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' }
    };
    wsProductos['A3'].s = { font: { bold: true } };
    wsProductos['B3'].s = { font: { bold: true } };

    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');

    // Hoja 3: Detalle de ventas
    const ventasData = [
      ['DETALLE DE VENTAS'],
      [''],
      ['ID', 'Cliente', 'Habitación', 'Productos', 'Total (S/.)', 'Estado', 'Fecha'],
      ...this.ventasDiarias.map(v => [
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
    XLSX.writeFile(wb, `reporte_diario_${this.resumenDiario.fecha}.xlsx`);

    this.mensajeFlotanteService.mostrarInfo(
      'Reporte diario exportado correctamente',
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
    const fecha = this.resumenDiario.fecha;

    let ventasHTML = '';
    this.ventasDiarias.forEach(venta => {
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

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Diario - ${fecha}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
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
            font-size: 20px;
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
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DIARIO DE VENTAS</h1>
          <p>HOSPEDAJE LAY</p>
          <p>Fecha: ${fecha}</p>
        </div>

        <div class="resumen">
          <h3>RESUMEN DEL DÍA</h3>
          <div class="resumen-row">
            <span>Total Ventas:</span>
            <span>S/. ${this.resumenDiario.totalVentas.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Total Pagado:</span>
            <span>S/. ${this.resumenDiario.totalPagado.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Total Pendiente:</span>
            <span>S/. ${this.resumenDiario.totalPendiente.toFixed(2)}</span>
          </div>
          <div class="resumen-row">
            <span>Cantidad de Ventas:</span>
            <span>${this.resumenDiario.cantidadVentas}</span>
          </div>
        </div>

        <h3>DETALLE DE VENTAS</h3>
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
}
