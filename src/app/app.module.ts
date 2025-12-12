import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { 
  LucideAngularModule,
  MessageCircle,
  Bot,
  User,
  Send,
  Sparkles,
  X,
  Loader2 
} from 'lucide-angular';
// Routing
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { CvListComponent } from './components/cv-list/cv-list.component';
import { ContactCreateComponent } from './components/contact-create/contact-create.component';
import { MatDividerModule } from '@angular/material/divider'; // ✅ IMPORTANT

// Services
import { ProjectService } from './services/project.service';
import { ProfileService } from './services/profile.service';
import { CvFileService } from './services/cv-file.service';
import { ContactMessageService } from './services/contact-message.service';
import { ChatbotComponent } from './components/chat-bot/chat-bot.component';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
ProjectListComponent,
ProfileListComponent,
CvListComponent,
ContactCreateComponent,MatChipsModule,


    // Angular Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,     LucideAngularModule.pick({
      MessageCircle,
      Bot,
      User,
      Send,
      Sparkles,
      X,
      Loader2
    })


  ],
  providers: [
    ProjectService,
    ProfileService,
    CvFileService,
    ContactMessageService
  ],
})
export class AppModule { }
