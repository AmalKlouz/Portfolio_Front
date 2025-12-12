import { Component, OnInit, HostListener } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ProfileListComponent implements OnInit {
  profiles: any[] = [];
  selectedProfile: any = null;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getAll().subscribe((data: any[]) => {
      this.profiles = data;
    });
  }

  getProfilePhoto(filename: string): string {
    return this.profileService.getPhotoUrl(filename);
  }

  // Ouvrir le popup avec la bio complète
  openProfileDialog(profile: any): void {
    this.selectedProfile = profile;
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  // Fermer le popup
  closeProfileDialog(): void {
    this.selectedProfile = null;
    // Restaurer le scroll du body
    document.body.style.overflow = 'auto';
  }

  // Correction : Utiliser le bon type KeyboardEvent
  
  
  // OU Version alternative sans paramètre d'événement :
  @HostListener('document:keydown.escape')
  handleEscapeKey2(): void {
    if (this.selectedProfile) {
      this.closeProfileDialog();
    }
  }
}