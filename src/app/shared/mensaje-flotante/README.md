# Sistema de Mensajes Flotantes

Este sistema proporciona una forma elegante y consistente de mostrar mensajes modales en toda la aplicación de hotel.

## Componentes

### 1. MensajeFlotanteComponent
Componente base que renderiza el modal flotante.

**Propiedades:**
- `visible`: boolean - Controla si el modal está visible
- `data`: MensajeFlotanteData - Datos del mensaje
- `aceptar`: EventEmitter - Se emite al hacer clic en Aceptar
- `cancelar`: EventEmitter - Se emite al hacer clic en Cancelar
- `cerrar`: EventEmitter - Se emite al cerrar el modal

### 2. MensajeFlotanteService
Servicio global para gestionar mensajes flotantes.

**Métodos disponibles:**

#### `mostrarConfirmacion(mensaje: string, titulo?: string): Promise<boolean>`
Muestra un mensaje de confirmación con botones Aceptar/Cancelar.
```typescript
const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
  '¿Estás seguro de eliminar este producto?',
  'Confirmar Eliminación'
);
if (confirmado) {
  // El usuario aceptó
}
```

#### `mostrarInfo(mensaje: string, titulo?: string): Promise<void>`
Muestra un mensaje informativo con botón Aceptar.
```typescript
await this.mensajeFlotanteService.mostrarInfo(
  'Operación completada exitosamente',
  'Información'
);
```

#### `mostrarAdvertencia(mensaje: string, titulo?: string): Promise<void>`
Muestra un mensaje de advertencia.
```typescript
await this.mensajeFlotanteService.mostrarAdvertencia(
  'Este campo es requerido',
  'Advertencia'
);
```

#### `mostrarError(mensaje: string, titulo?: string): Promise<void>`
Muestra un mensaje de error.
```typescript
await this.mensajeFlotanteService.mostrarError(
  'No se pudo conectar al servidor',
  'Error de Conexión'
);
```

#### `mostrarMensajePersonalizado(data: MensajeFlotanteRequest): Promise<'aceptar' | 'cancelar'>`
Permite personalizar completamente el mensaje.
```typescript
const resultado = await this.mensajeFlotanteService.mostrarMensajePersonalizado({
  titulo: 'Título Personalizado',
  mensaje: 'Mensaje personalizado',
  tipo: 'confirmacion',
  textoAceptar: 'Sí, proceder',
  textoCancelar: 'No, cancelar'
});
```

## Tipos de Mensajes

- `confirmacion`: ❓ Muestra pregunta con botones Aceptar/Cancelar
- `info`: ℹ️ Muestra información con botón Aceptar
- `advertencia`: ⚠️ Muestra advertencia con botón Entendido
- `error`: ❌ Muestra error con botón Cerrar

## Uso en Componentes

1. **Importar el servicio:**
```typescript
import { MensajeFlotanteService } from '../../../shared/mensaje-flotante/mensaje-flotante.service';
```

2. **Inyectar en el constructor:**
```typescript
constructor(
  private mensajeFlotanteService: MensajeFlotanteService
) { }
```

3. **Usar los métodos:**
```typescript
async eliminarItem(): Promise<void> {
  const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
    '¿Estás seguro de que deseas eliminar este elemento?',
    'Confirmar Eliminación'
  );
  
  if (confirmado) {
    // Proceder con la eliminación
    this.mensajeFlotanteService.mostrarInfo(
      'Elemento eliminado exitosamente',
      'Éxito'
    );
  }
}
```

## Características

- ✅ Diseño moderno y responsive
- ✅ Animaciones suaves de entrada/salida
- ✅ Soporte para diferentes tipos de mensajes
- ✅ Fácil de usar en toda la aplicación
- ✅ Manejo asíncrono con Promises
- ✅ Personalización de textos de botones
- ✅ Gestión centralizada a través de servicio
- ✅ Compatible con Angular 19+

## Instalación

El sistema ya está configurado en la aplicación:
1. Componentes declarados en `app.module.ts`
2. Componente global agregado a `app.component.html`
3. Servicio disponible globalmente

## Ejemplos de Uso

### Eliminación con confirmación
```typescript
async eliminarProducto(producto: Producto): Promise<void> {
  const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
    `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`,
    'Eliminar Producto'
  );
  
  if (confirmado) {
    try {
      await this.productoService.eliminar(producto.id);
      this.mensajeFlotanteService.mostrarInfo(
        'Producto eliminado exitosamente',
        'Éxito'
      );
    } catch (error) {
      this.mensajeFlotanteService.mostrarError(
        'No se pudo eliminar el producto',
        'Error'
      );
    }
  }
}
```

### Validación de formulario
```typescript
async guardarFormulario(): Promise<void> {
  if (!this.formulario.valid) {
    await this.mensajeFlotanteService.mostrarAdvertencia(
      'Por favor, completa todos los campos requeridos',
      'Formulario Incompleto'
    );
    return;
  }
  
  // Proceder con el guardado
}
```

### Mensaje de error personalizado
```typescript
const resultado = await this.mensajeFlotanteService.mostrarMensajePersonalizado({
  titulo: 'Acción Requerida',
  mensaje: 'El documento necesita ser aprobado antes de continuar. ¿Deseas aprobarlo ahora?',
  tipo: 'confirmacion',
  textoAceptar: 'Aprobar Documento',
  textoCancelar: 'Más Tarde'
});

if (resultado === 'aceptar') {
  // Aprobar documento
}
```
