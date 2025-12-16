import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CvFile } from '../models/cv-file.model';

@Injectable({
  providedIn: 'root'
})
export class CvFileService {
  private apiUrl = 'http://localhost:9000/api/cvfiles';

  constructor(private http: HttpClient) {}

  /**
   * Récupère le CV actuel
   */
  getCurrentCv(): Observable<CvFile> {
    return this.http.get<CvFile>(`${this.apiUrl}/current`);
  }

  /**
   * Récupère tous les CVs (pour l'historique si nécessaire)
   */
  getAllCvs(): Observable<CvFile[]> {
    return this.http.get<CvFile[]>(`${this.apiUrl}/all`);
  }

  /**
   * Récupère un CV par son ID
   */
  getCvById(id: number): Observable<CvFile> {
    return this.http.get<CvFile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload ou met à jour le CV actuel
   * Note: Cette méthode remplace automatiquement le CV existant
   */
  uploadCv(file: File): Observable<CvFile> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Upload CV - File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // POST /api/cvfiles - remplace automatiquement le CV existant côté backend
    return this.http.post<CvFile>(this.apiUrl, formData);
  }

  /**
   * Télécharge le CV actuel
   */
  downloadCv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Télécharge un CV par son nom de fichier
   */
  downloadCvByFilename(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${filename}`, {
      responseType: 'blob'
    });
  }

  /**
   * Supprime le CV actuel
   */
  deleteCv(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }

  /**
   * Supprime un CV par son ID
   */
  deleteCvById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  /**
   * Met à jour un CV par son ID
   */
  updateCv(id: number, cvFile: CvFile): Observable<CvFile> {
    return this.http.put<CvFile>(`${this.apiUrl}/${id}`, cvFile);
  }

  /**
   * Vérifie si un CV existe
   */
  cvExists(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists`);
  }
}