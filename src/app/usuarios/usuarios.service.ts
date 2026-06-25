import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor() { }

  getUsuarios(): Observable<Usuario[]> {
    const usuarios = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');
    return of(usuarios).pipe(delay(300));
  }

  crearUsuario(usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');
    const nuevoUsuario: Usuario = {
      id: usuarios.length > 0 ? Math.max(...usuarios.map((u: Usuario) => u.id)) + 1 : 1,
      ...usuario
    };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('hoteleria_usuarios', JSON.stringify(usuarios));
    return of(nuevoUsuario).pipe(delay(500));
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');
    const index = usuarios.findIndex((u: Usuario) => u.id === id);
    if (index !== -1) {
      usuarios[index] = { ...usuarios[index], ...usuario };
      localStorage.setItem('hoteleria_usuarios', JSON.stringify(usuarios));
      return of(usuarios[index]).pipe(delay(400));
    }
    throw new Error('Usuario no encontrado');
  }

  eliminarUsuario(id: number): Observable<void> {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');
    const usuariosFiltrados = usuarios.filter((u: Usuario) => u.id !== id);
    localStorage.setItem('hoteleria_usuarios', JSON.stringify(usuariosFiltrados));
    return of(void 0).pipe(delay(300));
  }
}
