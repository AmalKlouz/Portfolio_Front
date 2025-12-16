import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:9000/api/profiles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.baseUrl);
  }

  getById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  create(profile: Profile, photoFile: File): Observable<Profile> {
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('bio', profile.bio);
    formData.append('title', profile.title);
    formData.append('photo', photoFile);
    return this.http.post<Profile>(this.baseUrl, formData);
  }

  update(id: number, profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.baseUrl}/${id}`, profile);
  }

  // Nouvelle méthode pour mettre à jour avec une photo
  updateWithPhoto(id: number, profile: Profile, photoFile: File): Observable<Profile> {
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('bio', profile.bio);
    formData.append('title', profile.title);
    formData.append('photo', photoFile);
    return this.http.put<Profile>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPhotoUrl(filename: string): string {
    if (!filename) return '';
    return `http://localhost:9000/api/profiles/photo/${encodeURIComponent(filename)}`;
  }

  getImage(filename: string): string {
    return `http://localhost:9000/api/projects/images/${filename}`;
  }
}