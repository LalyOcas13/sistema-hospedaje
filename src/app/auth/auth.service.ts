import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Interface para el usuario
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'empleado';
}

// Interface para la respuesta de login
export interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    // Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
    // Inicializar usuarios por defecto si no existen
    this.inicializarUsuariosPorDefecto();
  }

  /**
   * Inicializar usuarios admin y empleado por defecto si no existen
   * Usa colección separada 'hoteleria_usuarios' para admin y empleado
   * Limpia admin y empleado de la colección de clientes
   */
  private inicializarUsuariosPorDefecto(): void {
    const usuarios = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');

    // Verificar si existe admin
    const adminExiste = usuarios.some((u: any) => u.rol === 'admin');
    if (!adminExiste) {
      const admin = {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@gmail.com',
        password: '123456',
        rol: 'admin'
      };
      usuarios.push(admin);
      console.log('✅ Usuario admin creado por defecto');
    }

    // Verificar si existe empleado
    const empleadoExiste = usuarios.some((u: any) => u.rol === 'empleado');
    if (!empleadoExiste) {
      const empleado = {
        id: 2,
        nombre: 'Empleado Recepción',
        email: 'empleado@gmail.com',
        password: '123456',
        rol: 'empleado'
      };
      usuarios.push(empleado);
      console.log('✅ Usuario empleado creado por defecto');
    }

    // Guardar en localStorage
    localStorage.setItem('hoteleria_usuarios', JSON.stringify(usuarios));

    // Limpiar admin y empleado de la colección de clientes
    const clientes = JSON.parse(localStorage.getItem('hoteleria_clientes') || '[]');
    const clientesLimpios = clientes.filter((c: any) =>
      c.nombres_apellidos !== 'Administrador' &&
      c.nombres_apellidos !== 'Empleado Recepción'
    );
    localStorage.setItem('hoteleria_clientes', JSON.stringify(clientesLimpios));
    console.log('✅ Admin y empleado limpiados de la colección de clientes');
  }

  /**
   * Método de login - Usa colección separada de usuarios
   * Solo admin y empleado pueden hacer login
   */
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('Intentando login con:', email, password);

    // Obtener usuarios del localStorage
    const usuarios = JSON.parse(localStorage.getItem('hoteleria_usuarios') || '[]');

    // Buscar usuario con email y password correctos
    const usuario = usuarios.find((u: any) =>
      u.email === email &&
      u.password === password
    );

    if (usuario) {
      const response: LoginResponse = {
        user: {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          role: usuario.rol
        },
        token: 'fake-jwt-token-' + new Date().getTime()
      };

      console.log('Login exitoso:', response);

      // Guardar en memoria y localStorage
      this.currentUser = response.user;
      this.token = response.token;
      this.saveUserToStorage(response);

      // Simular delay de red y retornar respuesta
      return of(response).pipe(
        delay(800),
        map(res => {
          console.log('Respuesta retornada:', res);
          return res;
        })
      );
    } else {
      console.log('Credenciales inválidas');
      // Error de autenticación
      return throwError(() => new Error('Credenciales inválidas')).pipe(delay(800));
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.token !== null && this.currentUser !== null;
  }

  /**
   * Guardar datos en localStorage
   */
  private saveUserToStorage(response: LoginResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
  }

  /**
   * Cargar datos desde localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (userJson && token) {
      this.currentUser = JSON.parse(userJson);
      this.token = token;
    }
  }

  /**
   * Método para integración futura con API real
   * Descomentar cuando tengas el backend listo
   */
  /*
  loginWithAPI(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://tu-api/auth/login', {
      email,
      password
    }).pipe(
      tap(response => {
        this.currentUser = response.user;
        this.token = response.token;
        this.saveUserToStorage(response);
      })
    );
  }
  */
}