import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { Project, ProjectImage } from "../models/project.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://localhost:9000/api/projects';

  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getAll(): Observable<Project[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((response: any[]) => {
        console.log('Réponse API complète:', response);
        
        if (Array.isArray(response)) {
          return response.map((item: any) => this.mapToProject(item));
        } 
        else if (response && typeof response === 'object') {
          return [this.mapToProject(response)];
        }
        else {
          console.warn('Réponse inattendue:', response);
          return [];
        }
      }),
      catchError(this.handleError)
    );
  }

  // Mapper un objet brut vers l'interface Project
  private mapToProject(data: any): Project {
    console.log('Mapping projet:', data);
    
    return {
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      technologies: data.technologies || '',
      images: this.mapImages(data.images || [])
    };
  }

  // Mapper les images
  private mapImages(imagesData: any[]): ProjectImage[] {
    if (!Array.isArray(imagesData)) {
      console.warn('imagesData n\'est pas un tableau:', imagesData);
      return [];
    }
    
    return imagesData.map((img: any) => ({
      id: img.id || 0,
      imageUrl: img.imageUrl || ''
    }));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
      console.error('Détails erreur:', error.error);
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Récupérer un projet par ID
  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  // Créer un projet avec images
  create(project: Project, images: File[]): Observable<Project> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('title', project.title);
    formData.append('description', project.description);
    
    // Convertir le tableau technologies en chaîne si nécessaire
    if (Array.isArray(project.technologies)) {
      formData.append('technologies', project.technologies.join(', '));
    } else {
      formData.append('technologies', project.technologies || '');
    }
    
    // Ajouter les images
    images.forEach(file => formData.append('images', file));
    
    return this.http.post<Project>(this.baseUrl, formData);
  }

  // Mettre à jour un projet
  update(id: number, project: Project, images: File[]): Observable<Project> {
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('title', project.title);
    formData.append('description', project.description);
    
    // Gérer les technologies
    if (Array.isArray(project.technologies)) {
      formData.append('technologies', project.technologies.join(', '));
    } else {
      formData.append('technologies', project.technologies || '');
    }
    
    // Ajouter les images existantes à conserver (en JSON)
    if (project.images && project.images.length > 0) {
      formData.append('existingImages', JSON.stringify(project.images));
    }
    
    // Ajouter les nouvelles images
    if (images && images.length > 0) {
      images.forEach(image => formData.append('images', image, image.name));
    }
    
    console.log('Envoi de la mise à jour pour le projet ID:', id);
    console.log('Nombre d\'images existantes:', project.images?.length || 0);
    console.log('Nombre de nouvelles images:', images?.length || 0);
    
    return this.http.put<Project>(`${this.baseUrl}/${id}`, formData);
  }

  // Supprimer un projet
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Construire l'URL complète de l'image
  getImageUrl(filename: string): string {
    if (!filename) return '';
    // Si c'est déjà une URL complète, la retourner
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    // Sinon, construire l'URL
    return `http://localhost:9000/api/projects/images/${encodeURIComponent(filename)}`;
  }
}