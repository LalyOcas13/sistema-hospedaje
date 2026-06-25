// Mock API para Hotelería
// Simula un backend real pero usa localStorage para persistencia

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3007;

// Middleware
app.use(cors());
app.use(express.json());

// Helper para simular IDs autoincrementales
let nextId = {
  clientes: 1000,
  habitaciones: 100,
  reservas: 5000
};

// Helper para obtener datos de localStorage simulado
const getLocalStorage = () => {
  const fs = require('fs');
  try {
    return JSON.parse(fs.readFileSync('./mock-storage.json', 'utf8'));
  } catch {
    return {
      clientes: [],
      habitaciones: [],
      reservas: []
    };
  }
};

// Helper para guardar en localStorage simulado
const saveLocalStorage = (data) => {
  const fs = require('fs');
  fs.writeFileSync('./mock-storage.json', JSON.stringify(data, null, 2));
};

// Helper para generar siguiente ID
const getNextId = (type) => {
  const id = nextId[type];
  nextId[type]++;
  return id;
};

// ==================== CLIENTES ====================

// GET todos los clientes
app.get('/clientes', (req, res) => {
  const data = getLocalStorage();
  res.json(data.clientes);
});

// GET cliente por ID
app.get('/clientes/:id', (req, res) => {
  const data = getLocalStorage();
  const cliente = data.clientes.find(c => c.id_cliente == req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
});

// POST crear cliente
app.post('/clientes', (req, res) => {
  const data = getLocalStorage();
  
  // Verificar si ya existe el DNI
  const existeDNI = data.clientes.find(c => c.nro_documento === req.body.nro_documento);
  if (existeDNI) {
    return res.status(400).json({ error: 'Ya existe un cliente con ese DNI' });
  }
  
  const nuevoCliente = {
    id_cliente: getNextId('clientes'),
    tipo_documento: req.body.tipo_documento,
    nro_documento: req.body.nro_documento,
    nombres_apellidos: req.body.nombres_apellidos,
    telefono: req.body.telefono,
    estado: 'Activo',
    fecha_creacion: new Date().toISOString()
  };
  
  data.clientes.push(nuevoCliente);
  saveLocalStorage(data);
  
  console.log('✅ Cliente creado:', nuevoCliente.nombres_apellidos);
  res.status(201).json(nuevoCliente);
});

// GET buscar cliente por documento
app.get('/clientes/buscar/:documento', (req, res) => {
  const data = getLocalStorage();
  const clientes = data.clientes.filter(c => c.nro_documento.includes(req.params.documento));
  res.json(clientes);
});

// PUT actualizar cliente
app.put('/clientes/:id', (req, res) => {
  const data = getLocalStorage();
  const index = data.clientes.findIndex(c => c.id_cliente == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  data.clientes[index] = { ...data.clientes[index], ...req.body };
  saveLocalStorage(data);
  res.json(data.clientes[index]);
});

// DELETE eliminar cliente
app.delete('/clientes/:id', (req, res) => {
  const data = getLocalStorage();
  const index = data.clientes.findIndex(c => c.id_cliente == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  const eliminado = data.clientes.splice(index, 1)[0];
  saveLocalStorage(data);
  res.json({ message: 'Cliente eliminado', eliminado });
});

// PATCH actualizar estado cliente
app.patch('/clientes/:id/estado', (req, res) => {
  const data = getLocalStorage();
  const index = data.clientes.findIndex(c => c.id_cliente == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  data.clientes[index].estado = req.body.estado;
  saveLocalStorage(data);
  res.json(data.clientes[index]);
});

// ==================== HABITACIONES ====================

// GET todas las habitaciones
app.get('/habitaciones', (req, res) => {
  const data = getLocalStorage();
  
  // Si no hay habitaciones, crear datos iniciales
  if (data.habitaciones.length === 0) {
    const habitacionesIniciales = [
      { id_habitacion: 101, numero: '101', tipo_habitacion: 'Individual', precio: 50, estado: 'Disponible', descripcion: 'Habitación individual con vista a la calle' },
      { id_habitacion: 102, numero: '102', tipo_habitacion: 'Doble', precio: 80, estado: 'Disponible', descripcion: 'Habitación doble con cama matrimonial' },
      { id_habitacion: 103, numero: '103', tipo_habitacion: 'Matrimonial', precio: 120, estado: 'Ocupado', descripcion: 'Habitación matrimonional con balcón' },
      { id_habitacion: 201, numero: '201', tipo_habitacion: 'Doble', precio: 90, estado: 'Disponible', descripcion: 'Habitación doble en segundo piso' },
      { id_habitacion: 202, numero: '202', tipo_habitacion: 'Individual', precio: 55, estado: 'Disponible', descripcion: 'Habitación individual tranquila' },
      { id_habitacion: 301, numero: '301', tipo_habitacion: 'Matrimonial', precio: 150, estado: 'Reservada', descripcion: 'Suite presidencial con jacuzzi' }
    ];
    
    data.habitaciones = habitacionesIniciales;
    saveLocalStorage(data);
  }
  
  res.json(data.habitaciones);
});

// GET habitación por ID
app.get('/habitaciones/:id', (req, res) => {
  const data = getLocalStorage();
  const habitacion = data.habitaciones.find(h => h.id_habitacion == req.params.id);
  if (!habitacion) return res.status(404).json({ error: 'Habitación no encontrada' });
  res.json(habitacion);
});

// POST crear habitación
app.post('/habitaciones', (req, res) => {
  const data = getLocalStorage();
  
  const nuevaHabitacion = {
    id_habitacion: getNextId('habitaciones'),
    numero: req.body.numero,
    tipo_habitacion: req.body.tipo_habitacion,
    precio: req.body.precio,
    estado: req.body.estado || 'Disponible',
    descripcion: req.body.descripcion
  };
  
  data.habitaciones.push(nuevaHabitacion);
  saveLocalStorage(data);
  
  console.log('✅ Habitación creada:', nuevaHabitacion.numero);
  res.status(201).json(nuevaHabitacion);
});

// PUT actualizar habitación
app.put('/habitaciones/:id', (req, res) => {
  const data = getLocalStorage();
  const index = data.habitaciones.findIndex(h => h.id_habitacion == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Habitación no encontrada' });
  }
  
  data.habitaciones[index] = { ...data.habitaciones[index], ...req.body };
  saveLocalStorage(data);
  res.json(data.habitaciones[index]);
});

// DELETE eliminar habitación
app.delete('/habitaciones/:id', (req, res) => {
  const data = getLocalStorage();
  const index = data.habitaciones.findIndex(h => h.id_habitacion == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Habitación no encontrada' });
  }
  
  const eliminado = data.habitaciones.splice(index, 1)[0];
  saveLocalStorage(data);
  res.json({ message: 'Habitación eliminada', eliminado });
});

// PATCH actualizar estado habitación
app.patch('/habitaciones/:id/estado', (req, res) => {
  const data = getLocalStorage();
  const index = data.habitaciones.findIndex(h => h.id_habitacion == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Habitación no encontrada' });
  }
  
  data.habitaciones[index].estado = req.body.estado;
  saveLocalStorage(data);
  res.json(data.habitaciones[index]);
});

// GET habitaciones disponibles
app.get('/habitaciones/disponibles', (req, res) => {
  const data = getLocalStorage();
  const disponibles = data.habitaciones.filter(h => h.estado === 'Disponible');
  res.json(disponibles);
});

// ==================== RESERVAS ====================

// GET todas las reservas
app.get('/reservas', (req, res) => {
  const data = getLocalStorage();
  res.json(data.reservas);
});

// POST crear reserva
app.post('/reservas', (req, res) => {
  const data = getLocalStorage();
  
  // Verificar que la habitación esté disponible
  const habitacion = data.habitaciones.find(h => h.id_habitacion === req.body.id_habitacion);
  if (!habitacion || habitacion.estado !== 'Disponible') {
    return res.status(400).json({ error: 'Habitación no disponible' });
  }
  
  const nuevaReserva = {
    id_reserva: getNextId('reservas'),
    id_habitacion: req.body.id_habitacion,
    id_cliente: req.body.id_cliente,
    fecha: req.body.fecha,
    hora_entrada: req.body.hora_entrada,
    hora_salida: req.body.hora_salida,
    tiempo: req.body.tiempo,
    descuento: req.body.descuento || 0,
    total: req.body.total,
    total_descuento: req.body.total_descuento || 0,
    estado: req.body.estado || 'Pendiente',
    fecha_creacion: new Date().toISOString()
  };
  
  data.reservas.push(nuevaReserva);
  
  // Actualizar estado de la habitación a Ocupado
  const habitacionIndex = data.habitaciones.findIndex(h => h.id_habitacion === req.body.id_habitacion);
  if (habitacionIndex !== -1) {
    data.habitaciones[habitacionIndex].estado = 'Ocupado';
  }
  
  saveLocalStorage(data);
  
  console.log('✅ Reserva creada para habitación:', req.body.id_habitacion);
  res.status(201).json(nuevaReserva);
});

// GET reservas por cliente
app.get('/reservas/cliente/:idCliente', (req, res) => {
  const data = getLocalStorage();
  const reservas = data.reservas.filter(r => r.id_cliente == req.params.idCliente);
  res.json(reservas);
});

// GET reservas por habitación
app.get('/reservas/habitacion/:idHabitacion', (req, res) => {
  const data = getLocalStorage();
  const reservas = data.reservas.filter(r => r.id_habitacion == req.params.idHabitacion);
  res.json(reservas);
});

// ==================== INICIAR SERVIDOR ====================

app.listen(port, () => {
  console.log(`🚀 Mock API de Hotelería corriendo en http://localhost:${port}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   GET    /clientes');
  console.log('   POST   /clientes');
  console.log('   GET    /habitaciones');
  console.log('   POST   /habitaciones');
  console.log('   POST   /reservas');
  console.log('');
  console.log('💡 Los datos se guardan en mock-storage.json');
});
