import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}/${path}`, { params: httpParams })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((r) => r.data));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((r) => r.data));
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}/${path}`, body)
      .pipe(map((r) => r.data));
  }

  /** Descarga un archivo con el token de sesión (window.open no enviaría el header). */
  download(path: string, filename: string): void {
    this.http.get(`${this.baseUrl}/${path}`, { responseType: 'blob' }).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // En modo demo el reporte se genera como CSV en lugar de Excel.
      a.download = blob.type.startsWith('text/csv') ? filename.replace(/\.\w+$/, '.csv') : filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}/${path}`)
      .pipe(map((r) => r.data));
  }
}
