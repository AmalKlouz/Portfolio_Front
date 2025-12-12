import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CvFile } from '../models/cv-file.model';

@Injectable({
  providedIn: 'root'
})
export class CvFileService {
  private baseUrl = 'http://localhost:9000/api/cvfiles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CvFile[]> {
    return this.http.get<CvFile[]>(this.baseUrl);
  }

  getById(id: number): Observable<CvFile> {
    return this.http.get<CvFile>(`${this.baseUrl}/${id}`);
  }

  upload(file: File): Observable<CvFile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CvFile>(this.baseUrl, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
