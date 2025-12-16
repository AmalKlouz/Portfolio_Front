import { Component, OnInit, OnDestroy } from '@angular/core';
import { CvFileService } from '../../services/cv-file.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import { CvFile } from '../../models/cv-file.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cv-list',
  templateUrl: './cv-list.component.html',
  styleUrls: ['./cv-list.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    CommonModule,
    MatIcon
  ]
})
export class CvListComponent implements OnInit, OnDestroy {
  cvs: CvFile[] = [];
  selectedPdf: SafeResourceUrl | null = null;
  loading = false;

  constructor(
    private cvFileService: CvFileService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadAllCvs();
  }

  ngOnDestroy(): void {
    this.closeViewer();
  }

  /**
   * Charge tous les CVs disponibles
   */
  loadAllCvs(): void {
    this.loading = true;
    
    // Essayer de charger tous les CVs
    this.cvFileService.getAllCvs().subscribe({
      next: (data: CvFile[]) => {
        console.log('CVs chargés:', data);
        this.cvs = data;
        this.loading = false;
      },
      error: (error) => {
        console.log('Erreur lors du chargement de tous les CVs, essai du CV actuel:', error);
        // Si l'endpoint /all n'existe pas, charger seulement le CV actuel
        this.loadCurrentCv();
      }
    });
  }

  /**
   * Charge uniquement le CV actuel (fallback)
   */
  private loadCurrentCv(): void {
    this.cvFileService.getCurrentCv().subscribe({
      next: (cv: CvFile) => {
        console.log('CV actuel chargé:', cv);
        this.cvs = [cv];
        this.loading = false;
      },
      error: (error) => {
        console.log('Aucun CV trouvé:', error);
        this.cvs = [];
        this.loading = false;
      }
    });
  }

  /**
   * Visualise le PDF dans un modal
   * CORRIGÉ: Télécharge le blob au lieu d'utiliser une URL directe
   */
  viewPdf(cv: CvFile): void {
    this.loading = true;
    
    // Télécharger le CV en tant que Blob
    this.cvFileService.downloadCv().subscribe({
      next: (blob: Blob) => {
        // Créer une URL blob sécurisée
        const url = window.URL.createObjectURL(blob);
        this.selectedPdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du PDF:', error);
        this.showNotification('Impossible de charger le PDF', 'error');
        this.loading = false;
      }
    });
  }

  /**
   * Ferme le viewer PDF et nettoie les ressources
   */
  closeViewer(): void {
    if (this.selectedPdf) {
      // Récupérer l'URL blob pour la libérer
      const url = (this.selectedPdf as any).changingThisBreaksApplicationSecurity;
      if (url && url.startsWith('blob:')) {
        window.URL.revokeObjectURL(url);
      }
    }
    this.selectedPdf = null;
  }

  /**
   * Télécharge un fichier CV
   * CORRIGÉ: Utilise le service pour télécharger le Blob
   */
  downloadCvFile(cv: CvFile): void {
    this.loading = true;
    
    this.cvFileService.downloadCv().subscribe({
      next: (blob: Blob) => {
        // Créer un lien temporaire pour télécharger
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cv.filename || 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.showNotification('CV téléchargé avec succès', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.showNotification('Erreur lors du téléchargement du CV', 'error');
        this.loading = false;
      }
    });
  }

  /**
   * Alternative: Télécharger par nom de fichier
   * À utiliser si votre backend supporte l'endpoint /download/{filename}
   */
  downloadCvByFilename(cv: CvFile): void {
    if (!cv.filename) {
      this.showNotification('Nom de fichier invalide', 'error');
      return;
    }
    
    this.loading = true;
    
    this.cvFileService.downloadCvByFilename(cv.filename).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cv.filename;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.showNotification('CV téléchargé avec succès', 'success');
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement par filename:', error);
        this.showNotification('Erreur lors du téléchargement du CV', 'error');
        this.loading = false;
      }
    });
  }

  /**
   * Obtient une URL d'aperçu (icône SVG, pas le fichier réel)
   */
  getCvPreviewUrl(cv?: CvFile): string {
    // Retourner une icône SVG au lieu d'essayer de charger le fichier
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0NDMzNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DVjwvdGV4dD48L3N2Zz4=';
  }

  /**
   * Obtient l'icône appropriée selon le type de fichier
   */
  getCvIconForDisplay(contentType?: string): string {
    if (!contentType) return 'description';
    
    if (contentType.includes('pdf')) return 'picture_as_pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'description';
    if (contentType.includes('image')) return 'image';
    
    return 'description';
  }

  /**
   * Obtient la couleur de l'icône selon le type
   */
  getCvIconColor(contentType?: string): string {
    if (!contentType) return '#666';
    
    if (contentType.includes('pdf')) return '#f44336'; // Rouge pour PDF
    if (contentType.includes('word') || contentType.includes('document')) return '#2196f3'; // Bleu pour Word
    if (contentType.includes('image')) return '#4caf50'; // Vert pour images
    
    return '#666';
  }

  /**
   * Obtient le type de CV en texte lisible
   */
  getCvType(contentType?: string): string {
    if (!contentType) return 'Document';
    
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG'
    };
    
    return typeMap[contentType] || contentType.split('/')[1]?.toUpperCase() || 'Document';
  }

  /**
   * Formate la taille du fichier
   */
  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Affiche une notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: [
        type === 'success' ? 'success-snackbar' : 
        type === 'error' ? 'error-snackbar' : 
        type === 'warning' ? 'warning-snackbar' :
        'info-snackbar'
      ]
    });
  }
}