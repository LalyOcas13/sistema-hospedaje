import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DatosDNI {
  dni: string;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaDniService {
  // Token de APIsPERU
  private token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im9jYXN2YXNxdWV6bGFseUBnbWFpbC5jb20ifQ.QoncmlGoiyc27B3lQrkPEWBKeEWAop1b69so1YnAWDI';
  
  // Endpoint de APIsPERU para consulta DNI
  private apiUrl = 'https://api.apisperu.com/api/dni';

  constructor(private http: HttpClient) {}

  consultarDNI(dni: string): Observable<DatosDNI> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });

    const body = { dni };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => {
        if (response.success || response.data) {
          const data = response.data || response;
          return {
            dni: dni,
            nombre_completo: data.nombre_completo || `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`.trim(),
            nombres: data.nombres || '',
            apellido_paterno: data.apellido_paterno || '',
            apellido_materno: data.apellido_materno || ''
          };
        } else {
          return {
            dni: dni,
            nombre_completo: '',
            nombres: '',
            apellido_paterno: '',
            apellido_materno: '',
            error: response.message || 'No se encontraron datos para este DNI'
          };
        }
      })
    );
  }
}
