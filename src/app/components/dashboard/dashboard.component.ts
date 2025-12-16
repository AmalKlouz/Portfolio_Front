import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { ContactMessageService } from '../../services/contact-message.service';

// Modèles
import { Project, ProjectImage } from '../../models/project.model';
import { Profile } from '../../models/profile.model';
import { ContactMessage } from '../../models/contact-message.model';
import { CvFile } from '../../models/cv-file.model';
import { CvFileService } from '../../services/cv-file.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ]
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats = {
    totalProjects: 0,
    totalImages: 0,
    unreadMessages: 0,
    profileViews: 0
  };
  apiUrl: string = 'http://localhost:9000/api';
  recentProjects: Project[] = [];
  projects: Project[] = [];
  recentMessages: ContactMessage[] = [];
  allMessages: ContactMessage[] = [];
  profileData?: Profile;
  cvFiles: CvFile[] = [];
  currentCv?: CvFile;
  hasCv = false;

  // Variables pour le popup projet
  showProjectPopup = false;
  selectedProject: Project | null = null;
  currentImageIndex = 0;
  
  // Variables pour le popup messages
  showMessagesPopup = false;
  selectedMessage: ContactMessage | null = null;
  
  dashboardCards = [
    {
      title: 'Gérer les Projets',
      description: 'Créez, modifiez et supprimez vos projets',
      icon: 'rocket_launch',
      link: '/projects',
      color: 'primary',
      count: 0,
      badge: false
    },
    {
      title: 'Profil Public',
      description: 'Mettez à jour vos informations personnelles',
      icon: 'person',
      link: '/profile',
      color: 'accent',
      count: 0,
      badge: false
    },
    {
      title: 'Gestion des CV',
      description: 'Téléchargez et gérez vos fichiers CV',
      icon: 'description',
      link: '/cv',
      color: 'warn',
      count: 0,
      badge: false
    },
  ];

  quickActions = [
    { icon: 'add', label: 'Nouveau projet', action: 'createProject', color: 'primary' },
    { icon: 'upload', label: 'Uploader CV', action: 'uploadCV', color: 'accent' },
    { icon: 'edit', label: 'Éditer profil', action: 'editProfile', color: 'warn' },
    { icon: 'refresh', label: 'Rafraîchir', action: 'refresh', color: 'primary' }
  ];

  constructor(
    private projectService: ProjectService,
    private profileService: ProfileService,
    private cvFileService: CvFileService,
    private messageService: ContactMessageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showProjectPopup) {
      switch (event.key) {
        case 'Escape':
          this.closeProjectPopup();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    }
    
    if (this.showMessagesPopup && event.key === 'Escape') {
      this.closeMessagesPopup();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects: Project[]) => {
        if (projects && Array.isArray(projects)) {
          this.projects = projects;
          this.stats.totalProjects = projects.length;
          
          this.stats.totalImages = projects.reduce((total, project) => {
            if (project.images && Array.isArray(project.images)) {
              return total + project.images.length;
            }
            return total;
          }, 0);
          
          this.recentProjects = projects.slice(0, 3);
          this.dashboardCards[0].count = this.stats.totalProjects;
        } else {
          this.projects = [];
          this.stats.totalProjects = 0;
          this.stats.totalImages = 0;
          this.recentProjects = [];
        }
        
        this.loadMessages();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.projects = [];
        this.stats.totalProjects = 0;
        this.stats.totalImages = 0;
        this.recentProjects = [];
        this.loadMessages();
      }
    });
  }

  loadMessages(): void {
    this.messageService.getAll().subscribe({
      next: (messages: ContactMessage[]) => {
        if (messages && Array.isArray(messages)) {
          this.allMessages = messages;
          this.recentMessages = messages.slice(0, 3);
          this.stats.unreadMessages = messages.length;
        } else {
          this.allMessages = [];
          this.recentMessages = [];
          this.stats.unreadMessages = 0;
        }
        
        this.loadProfile();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.allMessages = [];
        this.recentMessages = [];
        this.stats.unreadMessages = 0;
        this.loadProfile();
      }
    });
  }

  loadProfile(): void {
    this.profileService.getAll().subscribe({
      next: (profiles: Profile[]) => {
        if (profiles && Array.isArray(profiles) && profiles.length > 0) {
          this.profileData = profiles[0];
          this.dashboardCards[1].count = 1;
        } else {
          this.profileData = undefined;
          this.dashboardCards[1].count = 0;
        }
        
        this.loadCvFiles();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profileData = undefined;
        this.dashboardCards[1].count = 0;
        this.loadCvFiles();
      }
    });
  }

  loadCvFiles(): void {
    this.cvFileService.getCurrentCv().subscribe({
      next: (cv: CvFile) => {
        this.currentCv = cv;
        this.hasCv = true;
        this.cvFiles = [cv];
        if (this.dashboardCards && this.dashboardCards[2]) {
          this.dashboardCards[2].count = 1;
        }
        this.loadProfileStats();
      },
      error: (error) => {
        this.currentCv = undefined;
        this.hasCv = false;
        this.cvFiles = [];
        if (this.dashboardCards && this.dashboardCards[2]) {
          this.dashboardCards[2].count = 0;
        }
        this.loadProfileStats();
      }
    });
  }

  loadProfileStats(): void {
    this.stats.profileViews = 0;
    this.loading = false;
  }

  executeAction(action: string): void {
    switch(action) {
      case 'createProject':
        this.router.navigate(['/projects/new']);
        break;
      case 'uploadCV':
        this.openCvUpload();
        break;
      case 'editProfile':
        this.router.navigate(['/profile']);
        break;
      case 'refresh':
        this.loadDashboardData();
        break;
    }
  }

  openCvUpload(): void {
    // Si un CV existe déjà, demander confirmation
    if (this.hasCv && this.currentCv) {
      const confirmSnackBar = this.snackBar.open(
        'Un CV existe déjà. Le nouveau CV le remplacera. Continuer?',
        'Continuer',
        {
          duration: 7000,
          panelClass: ['warning-snackbar']
        }
      );
      
      confirmSnackBar.onAction().subscribe(() => {
        this.triggerFileInput();
      });
    } else {
      this.triggerFileInput();
    }
  }

  private triggerFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.png,.jpeg';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadCvFile(file);
      }
    };
    
    input.click();
  }

  private uploadCvFile(file: File): void {
    // Validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
      allowed: allowedTypes.includes(file.type)
    });
    
    if (!allowedTypes.includes(file.type)) {
      console.error('File type rejected:', file.type);
      this.showNotification('Format non supporté. Formats acceptés: PDF, DOC, DOCX, JPG, PNG', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      this.showNotification('Le fichier ne doit pas dépasser 10MB', 'error');
      return;
    }
    
    this.loading = true;
    
    // Le service uploadCv fait automatiquement un POST qui remplace le CV existant
    this.cvFileService.uploadCv(file).subscribe({
      next: (cv: CvFile) => {
        const message = this.hasCv ? 'CV remplacé avec succès' : 'CV téléchargé avec succès';
        this.showNotification(message, 'success');
        
        // Mettre à jour l'état local
        this.currentCv = cv;
        this.hasCv = true;
        this.cvFiles = [cv];
        
        if (this.dashboardCards && this.dashboardCards[2]) {
          this.dashboardCards[2].count = 1;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur complète lors du téléchargement du CV:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          headers: error.headers,
          url: error.url
        });
        this.showNotification(error.error || 'Erreur lors du téléchargement du CV', 'error');
        this.loading = false;
      }
    });
  }

  downloadCv(): void {
    if (!this.hasCv || !this.currentCv) {
      this.showNotification('Aucun CV disponible', 'error');
      return;
    }
    
    this.cvFileService.downloadCv().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentCv?.filename || 'cv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.showNotification('CV téléchargé avec succès', 'success');
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.showNotification('Erreur lors du téléchargement du CV', 'error');
      }
    });
  }

  deleteCv(): void {
    if (!this.hasCv) {
      this.showNotification('Aucun CV à supprimer', 'error');
      return;
    }
    
    const confirmDialog = this.snackBar.open(
      'Voulez-vous vraiment supprimer le CV?',
      'Confirmer',
      {
        duration: 5000,
        panelClass: ['warning-snackbar']
      }
    );
    
    confirmDialog.onAction().subscribe(() => {
      this.cvFileService.deleteCv().subscribe({
        next: () => {
          this.showNotification('CV supprimé avec succès', 'success');
          this.currentCv = undefined;
          this.hasCv = false;
          this.cvFiles = [];
          
          if (this.dashboardCards && this.dashboardCards[2]) {
            this.dashboardCards[2].count = 0;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showNotification('Erreur lors de la suppression du CV', 'error');
        }
      });
    });
  }

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

  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // ============================================
  // GESTION DU POPUP PROJET
  // ============================================
  
  openProjectPopup(project: Project): void {
    this.selectedProject = project;
    this.currentImageIndex = 0;
    this.showProjectPopup = true;
    document.body.classList.add('popup-open');
  }

  closeProjectPopup(): void {
    this.showProjectPopup = false;
    this.selectedProject = null;
    this.currentImageIndex = 0;
    document.body.classList.remove('popup-open');
  }

  get currentPopupImage(): string {
    if (!this.selectedProject || !this.selectedProject.images || this.selectedProject.images.length === 0) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZXQ8L3RleHQ+PC9zdmc+';
    }
    
    const image = this.selectedProject.images[this.currentImageIndex];
    const imageUrl = typeof image === 'string' ? image : image.imageUrl;
    
    if (!imageUrl) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZXQ8L3RleHQ+PC9zdmc+';
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `http://localhost:9000/api/projects/images/${imageUrl}`;
  }

  nextImage(): void {
    if (!this.selectedProject?.images) return;
    
    this.currentImageIndex++;
    if (this.currentImageIndex >= this.selectedProject.images.length) {
      this.currentImageIndex = 0;
    }
  }

  prevImage(): void {
    if (!this.selectedProject?.images) return;
    
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.selectedProject.images.length - 1;
    }
  }

  // ============================================
  // GESTION DU POPUP MESSAGES
  // ============================================
  
  openMessagesPopup(): void {
    this.showMessagesPopup = true;
    document.body.classList.add('popup-open');
  }

  closeMessagesPopup(): void {
    this.showMessagesPopup = false;
    this.selectedMessage = null;
    document.body.classList.remove('popup-open');
  }

  selectMessage(message: ContactMessage): void {
    this.selectedMessage = message;
  }

  deleteMessage(message: ContactMessage): void {
    if (!message.id) return;
    
    this.messageService.delete(message.id).subscribe({
      next: () => {
        this.snackBar.open('Message supprimé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.allMessages = this.allMessages.filter(m => m.id !== message.id);
        this.recentMessages = this.allMessages.slice(0, 3);
        this.stats.unreadMessages = this.allMessages.length;
        
        if (this.selectedMessage?.id === message.id) {
          this.selectedMessage = null;
        }
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        this.snackBar.open('Erreur lors de la suppression du message', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getMessageDate(message: ContactMessage): string {
    return 'Date non disponible';
  }

  // ============================================
  // MÉTHODES POUR LES PROJETS
  // ============================================
  
  getProjectTechnologiesArray(project: Project): string[] {
    if (!project.technologies) return [];
    
    if (Array.isArray(project.technologies)) {
      return project.technologies;
    }
    
    try {
      const parsed = JSON.parse(project.technologies);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      return project.technologies.split(',').map(tech => tech.trim()).filter(t => t.length > 0);
    }
    
    return [];
  }

  getProjectImagesCount(project: Project): number {
    if (!project.images || !Array.isArray(project.images)) return 0;
    return project.images.length;
  }

  getFirstProjectImage(project: Project): string {
    if (!this.hasProjectImages(project)) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZXQ8L3RleHQ+PC9zdmc+';
    }
    
    const imageUrl = project.images[0].imageUrl;
    
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    }
    
    return `http://localhost:9000/api/projects/images/${imageUrl}`;
  }

  hasProjectImages(project: Project): boolean {
    return !!(project.images && Array.isArray(project.images) && project.images.length > 0);
  }

  getAllTechnologies(): string[] {
    const allTechs: string[] = [];
    
    this.recentProjects.forEach(project => {
      const techs = this.getProjectTechnologiesArray(project);
      techs.forEach(tech => {
        if (tech && !allTechs.includes(tech)) {
          allTechs.push(tech);
        }
      });
    });
    
    return allTechs;
  }

  editProject(projectId?: number): void {
    if (projectId) {
      this.router.navigate(['/projects/edit', projectId]);
    }
  }

  deleteProject(project: Project): void {
    if (!project.id) return;
    
    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.snackBar.open('Projet supprimé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeProjectPopup();
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.snackBar.open('Erreur lors de la suppression du projet', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ============================================
  // MÉTHODES POUR LES MESSAGES
  // ============================================
  
  getMessagePreview(message: ContactMessage): string {
    return this.truncateText(message.message, 60);
  }

  // ============================================
  // MÉTHODES POUR LE PROFIL
  // ============================================
  
  getProfilePhoto(): string {
    if (!this.profileData?.photoUrl) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzNmNTFiNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QPC90ZXh0Pjwvc3ZnPg==';
    }
    
    const photoUrl = this.profileData.photoUrl;
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    return `${this.apiUrl}/profiles/photo/${encodeURIComponent(photoUrl)}`;
  }

  getProfileName(): string {
    return this.profileData?.fullName || 'Non défini';
  }

  getProfileTitle(): string {
    return this.profileData?.title || 'Non défini';
  }

  getProfileBioShort(): string {
    const bio = this.profileData?.bio || '';
    return this.truncateText(bio, 80);
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================
  
  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getShortTitle(project: Project): string {
    return this.truncateText(project.title, 30);
  }

  getShortDescription(project: Project): string {
    return this.truncateText(project.description, 80);
  }

  getColorByName(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': '#3f51b5',
      'accent': '#ff4081',
      'warn': '#f44336',
      'success': '#4caf50',
      'info': '#2196f3',
      'warning': '#ff9800'
    };
    return colorMap[colorName] || '#3f51b5';
  }

  getIconBgColor(colorName: string): string {
    const baseColor = this.getColorByName(colorName);
    return this.hexToRgba(baseColor, 0.1);
  }

  private hexToRgba(hex: string, alpha: number): string {
    if (hex.startsWith('rgba')) return hex;
    
    let cleanHex = hex.replace('#', '');
    
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  onImageError(event: any, project?: Project): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
    event.target.onerror = null;
  }
}