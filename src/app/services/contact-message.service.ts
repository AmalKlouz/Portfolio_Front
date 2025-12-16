import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactMessage } from '../models/contact-message.model';
@Injectable({
  providedIn: 'root'
})
export class ContactMessageService {
  private baseUrl = 'http://localhost:9000/api/contact';

  constructor(private http: HttpClient) {}

  create(message: ContactMessage): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.baseUrl, message);
  }

  getAll(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.baseUrl);
  }

  getById(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.baseUrl}/${id}`);
  }

delete(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`, {
    responseType: 'text' as 'json'  // Indique qu'on attend du texte, pas du JSON
  });
}
}