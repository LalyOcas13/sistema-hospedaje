# 🏨 Mock API para Sistema de Hotelería

Una API falsa pero realista que simula un backend completo para tu aplicación de hotelería.

## 🚀 **Instalación y Uso**

### **1. Instalar dependencias**
```bash
cd "c:/Users/LENOVO/Desktop/PROYECTO(PRAC/hoteleria"
npm install --package-lock-lockfile package-mock-api.json
```

### **2. Iniciar la API**
```bash
npm start
```

La API correrá en: **http://localhost:3007**

## 📋 **Endpoints Disponibles**

### **👥 Clientes**
- `GET /clientes` - Listar todos los clientes
- `POST /clientes` - Crear nuevo cliente
- `GET /clientes/:id` - Obtener cliente por ID
- `PUT /clientes/:id` - Actualizar cliente
- `DELETE /clientes/:id` - Eliminar cliente
- `GET /clientes/buscar/:documento` - Buscar por DNI
- `PATCH /clientes/:id/estado` - Cambiar estado

### **🏨 Habitaciones**
- `GET /habitaciones` - Listar todas las habitaciones
- `POST /habitaciones` - Crear nueva habitación
- `GET /habitaciones/:id` - Obtener habitación por ID
- `PUT /habitaciones/:id` - Actualizar habitación
- `DELETE /habitaciones/:id` - Eliminar habitación
- `PATCH /habitaciones/:id/estado` - Cambiar estado
- `GET /habitaciones/disponibles` - Habitaciones disponibles

### **📅 Reservas**
- `GET /reservas` - Listar todas las reservas
- `POST /reservas` - Crear nueva reserva
- `GET /reservas/cliente/:idCliente` - Reservas de un cliente
- `GET /reservas/habitacion/:idHabitacion` - Reservas de una habitación

## 💾 **Persistencia de Datos**

- Los datos se guardan en **`mock-storage.json`**
- **No necesitas base de datos**
- Los datos persisten aunque apagues el servidor
- Puedes editar el archivo manualmente si quieres

## 🔧 **Ejemplos de Uso**

### **Crear un cliente**
```bash
curl -X POST http://localhost:3007/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento": "DNI",
    "nro_documento": "76333939",
    "nombres_apellidos": "Melissa Velez",
    "telefono": "987654321"
  }'
```

### **Listar habitaciones**
```bash
curl http://localhost:3007/habitaciones
```

### **Crear una reserva**
```bash
curl -X POST http://localhost:3007/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "id_habitacion": 101,
    "id_cliente": 1000,
    "fecha": "2026-03-27",
    "hora_entrada": "14:00",
    "hora_salida": "15:00",
    "tiempo": "30",
    "total": 50,
    "total_descuento": 0
  }'
```

## ✅ **Ventajas**

1. **Fácil instalación** - Solo Node.js
2. **Datos persistentes** - No se pierden al reiniciar
3. **Comportamiento real** - Simula un backend verdadero
4. **Sin complicaciones** - No necesitas base de datos
5. **Lista para producción** - Funciona con tu app Angular

## 🎯 **Qué hace esta API**

- ✅ **Valida datos** (DNI duplicados, habitaciones disponibles)
- ✅ **Genera IDs automáticos**
- ✅ **Maneja errores** (404, 400, etc.)
- ✅ **Actualiza estados** (habitaciones se marcan como ocupadas)
- ✅ **Registra logs** en consola
- ✅ **CORS habilitado** para tu app Angular

## 🔄 **Integración con tu App Angular**

Tu app ya está configurada para usar `http://localhost:3007`, así que:

1. **Inicia esta Mock API**
2. **Tu app funcionará automáticamente**
3. **Los datos se guardarán permanentemente**

¡Listo! Ya tienes un backend funcional sin complicaciones.
