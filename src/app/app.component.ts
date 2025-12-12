import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { CvListComponent } from './components/cv-list/cv-list.component';
import { ContactCreateComponent } from './components/contact-create/contact-create.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectListComponent } from "./components/project-list/project-list.component";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatbotComponent } from "./components/chat-bot/chat-bot.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ProfileListComponent,
    CvListComponent,
    ContactCreateComponent,
    HttpClientModule,
    ProjectListComponent,
    MatDivider,
    MatIcon, MatTooltipModule // ← Ajoutez cette ligne
    ,    ChatbotComponent

]
})
export class AppComponent implements OnInit {
  isScrolled = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkScroll();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.checkScroll();
    }
  }

  private checkScroll() {
    if (this.isBrowser) {
      this.isScrolled = window.pageYOffset > 100;
    }
  }

  scrollToSection(sectionId: string) {
    if (!this.isBrowser) return;

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Hauteur de la navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Fonction pour vérifier si une section est visible
  isSectionActive(sectionId: string): boolean {
    if (!this.isBrowser) return false;

    const element = document.getElementById(sectionId);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top <= window.innerHeight / 2 &&
      rect.bottom >= window.innerHeight / 2
    );
  }
    scrollToSections(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}