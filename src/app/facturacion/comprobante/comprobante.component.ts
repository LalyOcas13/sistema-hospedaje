import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';
import { ComprobanteService } from '../services/comprobante.service';
import { VentasService } from '../../reportes/services/ventas.service';

interface Cliente {
  tipoDocumento: string;
  numeroDocumento: string;
  nombresApellidos: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoHabitacion: string;
  numeroHabitacion: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
}

interface Producto {
  id: number;
  nombre: string;
  detalle: string;
  precio: number;
  cantidad: number;
  stock: number;
  subtotal: number;
  estado: string;
  codigoBarras?: string;
}

interface DatosBoleta {
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

@Component({
  selector: 'app-comprobante',
  standalone: false,
  templateUrl: './comprobante.component.html',
  styleUrl: './comprobante.component.css'
})
export class ComprobanteComponent implements OnInit {
  currentUser = {
    name: 'Laly Melissa Ocas Vasquez'
  };

  // Datos de la empresa para boleta
  empresa = {
    razonSocial: 'HOSPEDAJE LAY',
    ruc: '10609451522',
    telefono: '987654321',
    email: 'info@hospedajelay.com',
    direccion: 'JIRON FRANCISCO PIZARRO 627',
    departamento: 'La Libertad',
    provincia: 'Trujillo',
    distrito: 'La Esperanza',
    codigoPais: 'PE'
  };

  // Cliente de la boleta
  clienteBoleta: Cliente | null = null;
  documentoBusqueda: string = '';
  
  // Datos de la reserva recibida
  datosReserva: DatosBoleta | null = null;
  tipoComprobanteActual: string = 'boleta'; // 'boleta' o 'factura'

  constructor(
    private router: Router,
    private mensajeFlotanteService: MensajeFlotanteService,
    private comprobanteService: ComprobanteService,
    private ventasService: VentasService
  ) {
    this.generarNumeroBoleta();
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit iniciado');
    // Obtener datos de la reserva del servicio
    this.datosReserva = this.comprobanteService.getDatosComprobante();
    console.log('📋 Datos de reserva recibidos del servicio:', this.datosReserva);
    console.log('📋 Tipo de comprobante recibido:', this.datosReserva?.tipoComprobante);

    if (this.datosReserva) {
      // Determinar tipo de comprobante
      this.tipoComprobanteActual = this.datosReserva?.tipoComprobante || 'boleta';
      console.log('📋 Tipo de comprobante actual establecido:', this.tipoComprobanteActual);
      console.log('📋 datosReserva es null?', this.datosReserva === null);
      console.log('📋 tipoComprobanteActual:', this.tipoComprobanteActual);
      
      // Configurar según tipo de comprobante
      if (this.tipoComprobanteActual === 'factura') {
        // Factura: usar RUC y serie F001
        this.serieBoleta = 'F001';
        this.numeroBoleta = '45678';
      } else {
        // Boleta: usar DNI y serie B001
        this.serieBoleta = 'B001';
        this.numeroBoleta = this.numeroBoleta || '';
      }
      
      // Convertir datos de reserva al formato de cliente de boleta
      if (this.datosReserva) {
        const tipoDoc = this.tipoComprobanteActual === 'factura' ? 'RUC' : 'DNI';
        const numeroDoc = this.tipoComprobanteActual === 'factura' 
          ? (this.datosReserva.rucIngresado || this.datosReserva.cliente.nro_documento)
          : this.datosReserva.cliente.nro_documento;
        this.clienteBoleta = {
          tipoDocumento: tipoDoc,
          numeroDocumento: numeroDoc,
          nombresApellidos: this.datosReserva.cliente.nombres_apellidos,
          telefono: this.datosReserva.cliente.telefono || '',
          email: '',
          direccion: 'Cliente del hotel',
          tipoHabitacion: this.datosReserva.habitacion.tipo,
          numeroHabitacion: this.datosReserva.habitacion.numero,
          fechaIngreso: this.datosReserva.fecha,
          fechaSalida: this.datosReserva.fecha,
          estado: this.datosReserva.reserva.estado
        };

        // Agregar automáticamente el servicio de habitación a los items
        const precioHabitacion = this.datosReserva.habitacion.precio;
        const tiempoEnHoras = Number(this.datosReserva.tiempo) / 60; // Convertir minutos a horas
        const subtotal = precioHabitacion * tiempoEnHoras; // Precio por hora * tiempo en horas
        this.itemsBoleta = [{
          id: Date.now(),
          idBoleta: Date.now(),
          nombre: 'Servicio de hotel - Habitación',
          detalle: `${this.datosReserva.habitacion.tipo} - ${this.datosReserva.habitacion.numero}`,
          precio: precioHabitacion,
          cantidad: 1,
          stock: 1,
          subtotal: this.datosReserva.total,
          estado: 'Activo'
        }];

        // Cargar ventas del cliente y agregarlas al comprobante
        const todasLasVentas = this.ventasService.obtenerVentas();
        const documentoCliente = this.datosReserva.cliente.nro_documento;

        console.log('📊 Buscando ventas del cliente con documento:', documentoCliente);
        console.log('📊 Total ventas en sistema:', todasLasVentas.length);

        // Filtrar ventas por documento del cliente
        const ventasCliente = todasLasVentas.filter(venta =>
          this.datosReserva?.cliente?.nombres_apellidos && venta.cliente.includes(this.datosReserva.cliente.nombres_apellidos) ||
          venta.cliente === documentoCliente
        );

        console.log('📊 Ventas encontradas del cliente:', ventasCliente);

        // Agregar productos de las ventas al comprobante
        ventasCliente.forEach(venta => {
          venta.productos.forEach((productoNombre: string, index: number) => {
            const precioProducto = venta.total / venta.productos.length; // Dividir total entre productos
            this.itemsBoleta.push({
              id: Date.now() + index,
              idBoleta: Date.now(),
              nombre: productoNombre,
              detalle: 'Producto consumido',
              precio: precioProducto,
              cantidad: 1,
              stock: 1,
              subtotal: precioProducto,
              estado: 'Activo'
            });
          });
        });

        // Recalcular total incluyendo productos
        const totalProductos = ventasCliente.reduce((sum, v) => sum + v.total, 0);
        const nuevoTotal = this.datosReserva.total + totalProductos;

        // Actualizar el total
        this.estadoPago.total = nuevoTotal;
        this.estadoPago.pagado = nuevoTotal;
        this.estadoPago.pendiente = 0;

        console.log('📊 Items del comprobante:', this.itemsBoleta);
        console.log('📊 Total actualizado:', nuevoTotal);
      }
    }
  }
  mostrarDetallesCliente: boolean = false;

  // Productos de la boleta (los mismos del registro-consumo)
  productos: Producto[] = [
    { id: 1, nombre: 'Agua Life', detalle: '250 ML', precio: 3.0, cantidad: 0, stock: 30, subtotal: 0, estado: 'Activo', codigoBarras: '7501051234567' },
    { id: 2, nombre: 'Cigarrillos', detalle: '10 UNID', precio: 3.5, cantidad: 0, stock: 40, subtotal: 0, estado: 'Activo', codigoBarras: '7798123456789' },
    { id: 3, nombre: 'Shammpo GH', detalle: '200 ML', precio: 2.5, cantidad: 0, stock: 20, subtotal: 0, estado: 'Activo', codigoBarras: '7702030456789' },
    { id: 4, nombre: 'Refresco Pocmas', detalle: '350 ML', precio: 1.5, cantidad: 0, stock: 18, subtotal: 0, estado: 'Activo', codigoBarras: '7756078901234' }
  ];

  itemsBoleta: any[] = [];
  estadoPago = { pagado: 0, pendiente: 0, total: 0 };

  // Variables para el lector de código de barras
  codigoEscaneado: string = '';
  productoEncontrado: Producto | null = null;

  // Datos de la boleta
  serieBoleta = 'B001';
  numeroBoleta = '';
  fechaEmision = new Date().toISOString().split('T')[0];
  horaEmision = new Date().toTimeString().split(' ')[0].substring(0, 5);
  condicionPago = 'Contado';
  moneda = 'PEN';
  tipoCambio = 3.85;

  // Datos adicionales para factura
  trabajadorNombre = 'Ruth Melissa Cruzado Vasquez';
  metodoPago = 'Efectivo';
  estadoPagoFactura = 'PAGADO';

  generarNumeroBoleta(): void {
    const timestamp = Date.now();
    this.numeroBoleta = timestamp.toString().slice(-8);
  }

  buscarCliente(): void {
    if (this.documentoBusqueda.length >= 8) {
      this.clienteBoleta = {
        tipoDocumento: 'DNI',
        numeroDocumento: this.documentoBusqueda,
        nombresApellidos: 'Juan Pérez García',
        telefono: '987654321',
        email: 'juan.perez@email.com',
        direccion: 'Av. Principal 123',
        tipoHabitacion: 'Suite',
        numeroHabitacion: '201',
        fechaIngreso: '2024-01-15',
        fechaSalida: '2024-01-18',
        estado: 'Activo'
      };
      this.mostrarDetallesCliente = true;
    }
  }

  actualizarCantidad(producto: Producto, event: any): void {
    producto.cantidad = parseInt(event.target.value) || 0;
    producto.subtotal = producto.cantidad * producto.precio;
  }

  agregarABoleta(producto: Producto): void {
    if (producto.cantidad > 0) {
      const itemBoleta = {
        ...producto,
        idBoleta: Date.now()
      };
      this.itemsBoleta.push(itemBoleta);
      this.calcularTotales();
      
      // Resetear producto
      producto.cantidad = 0;
      producto.subtotal = 0;
    }
  }

  eliminarDeBoleta(item: any): void {
    this.itemsBoleta = this.itemsBoleta.filter(i => i.idBoleta !== item.idBoleta);
    this.calcularTotales();
  }

  calcularTotales(): void {
    this.estadoPago.total = this.itemsBoleta.reduce((sum, item) => sum + item.subtotal, 0);
    this.estadoPago.pagado = this.estadoPago.total;
    this.estadoPago.pendiente = 0;
  }

  actualizarPago(tipo: string, event: any): void {
    const monto = parseFloat(event.target.value) || 0;
    if (tipo === 'pagado') {
      this.estadoPago.pagado = monto;
      this.estadoPago.pendiente = this.estadoPago.total - monto;
    }
  }

  get gravada(): number {
    return this.estadoPago.total / 1.18;
  }

  get igv(): number {
    return this.estadoPago.total - this.gravada;
  }

  get totalBoleta(): number {
    return this.estadoPago.total;
  }

  get totalEnLetras(): string {
    // Simulación de conversión a letras
    return `SON ${this.totalBoleta.toFixed(2)} SOLES`;
  }

  imprimirBoleta(): void {
    // Si viene de una reserva, permitir imprimir aunque no haya productos
    if (this.itemsBoleta.length === 0 && !this.datosReserva) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'Debe agregar items a la boleta',
        'Boleta Vacía'
      );
      return;
    }
    
    // Si viene de reserva y no hay productos, agregar el servicio de habitación
    if (this.datosReserva && this.itemsBoleta.length === 0) {
      const itemHabitacion = {
        id: Date.now(),
        idBoleta: Date.now(),
        nombre: `Hospedaje - Habitación ${this.datosReserva.habitacion.tipo}`,
        detalle: `Habitación ${this.datosReserva.habitacion.numero}`,
        precio: this.datosReserva.habitacion.precio,
        cantidad: 1,
        subtotal: this.datosReserva.total,
        stock: 1
      };
      this.itemsBoleta.push(itemHabitacion);
      this.calcularTotales();
    }
    
    // Generar contenido HTML para las 2 copias
    const boletaHTMLCliente = this.generarHTMLBoleta('CLIENTE');
    const boletaHTMLEmpresa = this.generarHTMLBoleta('EMPRESA');
    
    // Primera copia - PARA EL CLIENTE
    const printWindowCliente = window.open('', '_blank');
    if (!printWindowCliente) {
      this.mensajeFlotanteService.mostrarError(
        'No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.',
        'Error de Impresión'
      );
      return;
    }
    
    // Escribir el contenido en la primera ventana
    printWindowCliente.document.write(boletaHTMLCliente);
    printWindowCliente.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir la primera copia
    printWindowCliente.onload = () => {
      setTimeout(() => {
        printWindowCliente.print();
        printWindowCliente.close();
        
        // Segunda copia - PARA LA EMPRESA
        setTimeout(() => {
          const printWindowEmpresa = window.open('', '_blank');
          if (printWindowEmpresa) {
            printWindowEmpresa.document.write(boletaHTMLEmpresa);
            printWindowEmpresa.document.close();
            printWindowEmpresa.onload = () => {
              setTimeout(() => {
                printWindowEmpresa.print();
                printWindowEmpresa.close();
              }, 500);
            };
          }
        }, 1000);
      }, 500);
    };
  }

  generarHTMLBoleta(tipoCopia: string = 'CLIENTE'): string {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
    const codigoHash = this.generarCodigoHash();
    const copiaLabel = tipoCopia === 'CLIENTE' ? 'ORIGINAL - CLIENTE' : 'DUPLICADO - EMPRESA';
    
    // Determinar tipo de documento y serie
    const esFactura = this.tipoComprobanteActual === 'factura';
    const tituloDocumento = esFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    const serieDocumento = esFactura ? 'F001' : 'B001';
    const tipoDocLabel = esFactura ? 'RUC' : 'DNI';
    const representacionTexto = esFactura ? 'Representación impresa de la Factura Electrónica' : 'Representación impresa de la Boleta de Venta Electrónica';
    
    let itemsHTML = '';
    this.itemsBoleta.forEach(item => {
      itemsHTML += `
        <tr>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${item.cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre} ${item.detalle || ''}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">S/. ${item.precio.toFixed(2)}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">0.00</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">S/. ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${tituloDocumento} - HOSPEDAJE LAY</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .boleta-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .nombre-comercial {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #2c3e50;
            text-transform: uppercase;
          }
          .empresa-info p {
            margin: 3px 0;
            font-size: 11px;
          }
          .titulo-documento {
            text-align: center;
            margin: 20px 0;
            border: 2px solid #333;
            padding: 10px;
          }
          .titulo-documento h2 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .info-boleta {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .info-item {
            flex: 1;
          }
          .info-item label {
            font-weight: bold;
          }
          .cliente-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
          }
          .cliente-section h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .detalle-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          .detalle-table th,
          .detalle-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .detalle-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
          }
          .totales-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
          }
          .totales-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .totales-row.total {
            border-top: 2px solid #333;
            padding-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .letras-section {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
          }
          .footer {
            margin-top: 30px;
            border-top: 2px solid #333;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .boleta-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="boleta-container">
          <!-- Header -->
          <div class="header">
            <h1 class="nombre-comercial">HOSPEDAJE LAY</h1>
            <div class="empresa-info">
              <p><strong>Razón Social:</strong> ANDA INTERNACIONAL INDIVIDUAL DE RESPONSABILIDAD LIMITADA</p>
              <p><strong>RUC:</strong> 20609451522</p>
              <p><strong>Dirección:</strong> JIRON FRANCISCO PIZARRO 627, LIMA - LIMA - LIMA</p>
              <p><strong>Teléfono:</strong> 987654321</p>
              <p><strong>Email:</strong> info@hospedajelay.com</p>
            </div>
          </div>

          <!-- Título -->
          <div class="titulo-documento">
            <h2>${tituloDocumento}</h2>
            <div style="color: red; font-weight: bold; margin: 10px 0;">${copiaLabel}</div>
          </div>

          <!-- Información del documento -->
          <div class="info-boleta">
            <div class="info-row">
              <div class="info-item">
                <label>Número de ${esFactura ? 'Factura' : 'Boleta'}:</label>
                <span>${serieDocumento}-${this.numeroBoleta}</span>
              </div>
              <div class="info-item">
                <label>Fecha Emisión:</label>
                <span>${fecha}</span>
              </div>
              <div class="info-item">
                <label>Hora:</label>
                <span>${hora}</span>
              </div>
            </div>
          </div>

          <!-- Datos del cliente -->
          <div class="cliente-section">
            <h3>DATOS DEL CLIENTE</h3>
            <div class="info-row">
              <div class="info-item">
                <label>Nombre/Razón Social:</label>
                <span>${this.clienteBoleta?.nombresApellidos || '-'}</span>
              </div>
              <div class="info-item">
                <label>${tipoDocLabel}:</label>
                <span>${this.clienteBoleta?.numeroDocumento || '-'}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>Teléfono:</label>
                <span>${this.clienteBoleta?.telefono || '-'}</span>
              </div>
              <div class="info-item">
                <label>Dirección:</label>
                <span>${this.clienteBoleta?.direccion || '-'}</span>
              </div>
            </div>
          </div>

          <!-- Detalle de la venta -->
          <h3 style="margin: 20px 0 10px 0; font-size: 14px; font-weight: bold;">DETALLE DE VENTA</h3>
          <table class="detalle-table">
            <thead>
              <tr>
                <th>CANT.</th>
                <th>DESCRIPCIÓN</th>
                <th>P. UNIT.</th>
                <th>DESCUENTO</th>
                <th>IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totales -->
          <div class="totales-section">
            <div class="totales-row">
              <div class="totales-label">OP. GRAVADA:</div>
              <div class="totales-value">S/. ${this.gravada.toFixed(2)}</div>
            </div>
            <div class="totales-row">
              <div class="totales-label">IGV (18%):</div>
              <div class="totales-value">S/. ${this.igv.toFixed(2)}</div>
            </div>
            <div class="totales-row total">
              <div class="totales-label">TOTAL A PAGAR:</div>
              <div class="totales-value">S/. ${this.totalBoleta.toFixed(2)}</div>
            </div>
          </div>

          <!-- Monto en letras -->
          <div class="letras-section">
            <p><strong>SON:</strong> ${this.totalEnLetras}</p>
          </div>

          <!-- Pie de página -->
          <div class="footer">
            <p>${representacionTexto}</p>
            <p>Para consultar el documento electrónico visite: www.sunat.gob.pe</p>
            <p>Autenticado con Código Hash: ${codigoHash}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generarCodigoHash(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = '';
    for (let i = 0; i < 20; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }

  finalizarBoleta(): void {
    if (this.itemsBoleta.length === 0 || !this.clienteBoleta) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'Complete todos los datos requeridos',
        'Datos Incompletos'
      );
      return;
    }
    
    // Crear objeto de boleta
    const boleta = {
      id_boleta: Date.now(),
      serie: this.serieBoleta,
      numero: this.numeroBoleta,
      cliente: this.clienteBoleta,
      items: this.itemsBoleta,
      total: this.totalBoleta,
      pago: this.estadoPago,
      fecha: this.fechaEmision,
      hora: this.horaEmision,
      empresa: this.empresa
    };
    
    // Guardar boleta en localStorage
    this.guardarBoletaEnLocalStorage(boleta);
    
    console.log('Boleta finalizada:', boleta);
    
    this.mensajeFlotanteService.mostrarInfo(
      'Boleta procesada correctamente',
      'Boleta Procesada'
    );
    this.resetearFormulario();
  }

  private guardarBoletaEnLocalStorage(boleta: any): void {
    try {
      const boletas = JSON.parse(localStorage.getItem('hoteleria_boletas') || '[]');
      boletas.push(boleta);
      localStorage.setItem('hoteleria_boletas', JSON.stringify(boletas));
      console.log('✅ Boleta guardada en localStorage:', boleta.id_boleta);
    } catch (error) {
      console.error('❌ Error al guardar boleta en localStorage:', error);
      this.mensajeFlotanteService.mostrarError(
        'No se pudo guardar la boleta en el almacenamiento local',
        'Error de Guardado'
      );
    }
  }

  resetearFormulario(): void {
    this.itemsBoleta = [];
    this.estadoPago = { pagado: 0, pendiente: 0, total: 0 };
    this.clienteBoleta = null;
    this.mostrarDetallesCliente = false;
    this.documentoBusqueda = '';
  }

  // Métodos para el lector de código de barras
  buscarProductoPorCodigo(): void {
    if (!this.codigoEscaneado.trim()) {
      return;
    }

    const producto = this.productos.find(p => p.codigoBarras === this.codigoEscaneado.trim());
    
    if (producto) {
      this.productoEncontrado = producto;
      this.agregarDirectamenteABoleta(producto);
      this.codigoEscaneado = '';
      
      this.mensajeFlotanteService.mostrarInfo(
        `Producto "${producto.nombre}" agregado a la boleta`,
        'Producto Agregado'
      );
    } else {
      this.mensajeFlotanteService.mostrarError(
        'Producto no encontrado. Verifique el código de barras.',
        'Error de Búsqueda'
      );
      this.codigoEscaneado = '';
    }
  }

  agregarDirectamenteABoleta(producto: Producto): void {
    if (producto.stock > 0) {
      const itemBoleta = {
        ...producto,
        cantidad: 1,
        subtotal: producto.precio,
        idBoleta: Date.now()
      };
      this.itemsBoleta.push(itemBoleta);
      this.calcularTotales();
      
      // Reducir stock del producto
      const productoIndex = this.productos.findIndex(p => p.id === producto.id);
      if (productoIndex > -1) {
        this.productos[productoIndex].stock--;
      }
    } else {
      this.mensajeFlotanteService.mostrarAdvertencia(
        `El producto "${producto.nombre}" no tiene stock disponible`,
        'Stock Agotado'
      );
    }
  }

  activarScanner(): void {
    // Por ahora, solo mostramos un mensaje
    // En el futuro, aquí se integraría con la API de cámara del dispositivo
    this.mensajeFlotanteService.mostrarInfo(
      'Función de escáner en desarrollo. Use el teclado para ingresar el código.',
      'Escáner'
    );
  }

  volver(): void {
    this.comprobanteService.limpiarDatos();
    this.router.navigate(['/habitaciones']);
  }
}
