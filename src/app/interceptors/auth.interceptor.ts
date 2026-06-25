import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo agregar token a requests a nuestra API
    if (req.url.startsWith('http://localhost:3007')) {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        // Clonar el request y agregar el header de autorización
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next.handle(authReq);
      }
    }
    // Si no es a nuestra API o no hay token, enviar el request original
    return next.handle(req);
  }
}
