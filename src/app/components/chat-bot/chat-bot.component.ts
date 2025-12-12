import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatbotComponent {
  messages: Array<{role: 'user' | 'assistant', content: string}> = [
    {
      role: 'assistant',
      content: "👋 Bonjour ! Je suis l'assistant IA du portfolio d'Amal Klouz. Posez-moi des questions sur ses compétences, projets, expériences ou formations !"
    }
  ];
  
  input: string = '';
  isLoading: boolean = false;
  isOpen: boolean = false;
  
  suggestedQuestions = [
    "Quelle est votre expertise en microservices ?",
    "Parlez-moi de votre expérience DevOps",
    "Quelles technologies backend maîtrisez-vous ?",
    "Avez-vous de l'expérience avec Kafka et OAuth2 ?",
    "Quels projets full-stack avez-vous réalisés ?",
    "Quelle est votre approche de l'architecture logicielle ?"
  ];

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('messagesContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      } else {
        const containerByClass = document.querySelector('.messages-container');
        if (containerByClass) {
          containerByClass.scrollTop = containerByClass.scrollHeight;
        }
      }
    }, 100);
  }

  getResponseForQuestion(question: string): string {
    const q = question.toLowerCase().trim();
    
    // 1. SALUTATIONS
    if (q.includes('bonjour') || q.includes('salut') || q.includes('hello') || 
        q.includes('hi') || q.includes('coucou')) {
      return "Bonjour ! 👋 Je suis ravi de vous aider. Posez-moi n'importe quelle question sur Amal Klouz, son parcours, ses compétences ou ses projets !";
    }
    
    // 2. MERCI
    if (q.includes('merci') || q.includes('thanks')) {
      return "Je vous en prie ! 😊 N'hésitez pas si vous avez d'autres questions sur le parcours d'Amal.";
    }
    
    // 3. COMPÉTENCES TECHNIQUES
    if (q.includes('compétence') || q.includes('skill') || q.includes('expertise') || 
        q.includes('technologie') || q.includes('tech') || q.includes('stack')) {
      return `**Compétences Techniques d'Amal Klouz** :\n\n💻 **Backend** :
• **Spring Boot** : Développement d'APIs REST, microservices
• **NestJS** : Backend Node.js structuré
• **Java** : Applications d'entreprise
• **PHP** : Développement web dynamique

🎨 **Frontend** :
• **Angular** : Applications web modernes (SPA)
• **Next.js** : Applications React avec SSR
• **HTML5/CSS3** : Interfaces web responsives

🗄️ **Bases de données** :
• **PostgreSQL** : Base de données relationnelle
• **MongoDB** : Base de données NoSQL
• **MySQL** : Gestion de bases relationnelles

🛠️ **DevOps & Outils** :
• **Jenkins** : Intégration continue (CI/CD)
• **SonarQube** : Qualité du code
• **Git** : Versionnement et collaboration
• **Docker** : Conteneurisation
• **Kafka** : Messagerie asynchrone

🔐 **Sécurité** :
• **OAuth2** : Authentification sécurisée
• Sécurisation des endpoints et APIs`;
    }
    
    // 4. EXPÉRIENCES PROFESSIONNELLES
    if (q.includes('expérience') || q.includes('professionnel') || q.includes('wevioo') || 
        q.includes('stage') || q.includes('entreprise')) {
      return `**Expériences Professionnelles chez Wevioo** :\n\n🏢 **1. Stage Low Code** (1er juillet - 31 juillet 2023)
• Développement low-code avec la plateforme **Joget**
• Conception et configuration de workflows applicatifs
• Découverte des méthodologies de développement rapide
• Programmation visuelle et analyse des besoins

💼 **2. Gestion Collaborative de Tâches** (1er juillet - 15 août 2024)
• Application de gestion de tâches avec **NestJS** (backend) et **Next.js** (frontend)
• Gestion des données avec **MongoDB**
• Fonctionnalités de suivi et collaboration entre utilisateurs
• Travail en méthodologie **Agile**

🎓 **3. Projet de Fin d'Études (PFE) - Microservices** (2 février - 31 juillet 2025)
• Architecture **microservices** avec **Spring Boot** et **Angular**
• Authentification sécurisée **OAuth2**
• Messagerie **Kafka** pour la communication entre services
• Base de données **PostgreSQL**
• Pratiques **DevOps** pour CI/CD et déploiement
• Application scalable et modulaire`;
    }
    
    // 5. PROJETS ACADÉMIQUES
    if (q.includes('projet') || q.includes('académique') || q.includes('université') || 
        q.includes('esprit') || q.includes('réalisé')) {
      return `**Projets Académiques à ESPRIT** :\n\n🖥️ **Projet C++**
• Application desktop C++
• Méthodologie **Scrum**
• Développement orienté objet

🌐 **Projet Web (HTML, PHP, CSS)**
• Site web dynamique avec formulaires interactifs
• Communication avec base de données **MySQL**
• Compétences front-end et back-end

☕ **Projet Java - Symfony**
• Application web avec framework **MVC**
• Gestion des routes, contrôleurs et vues
• Pattern MVC et bonnes pratiques Java

🔄 **Projet DevOps**
• Processus **CI/CD** avec **Jenkins** et **Git**
• Déploiement automatisé et monitoring
• Intégration continue et pratiques DevOps

🚀 **Projet Spring - Angular**
• Application **full-stack** complète
• APIs **REST** sécurisées
• Intégration frontend/backend

📱 **Projet Mobile Android**
• Application Android native
• UI/UX et gestion du cycle de vie
• Stockage local

⚙️ **Projet Microservices**
• Architecture distribuée avec **Spring Boot**, **Angular**, **PostgreSQL**
• Scalabilité et sécurité des APIs`;
    }
    
    // 6. FORMATION / ÉTUDES
    if (q.includes('formation') || q.includes('étude') || q.includes('diplôme') || 
        q.includes('école') || q.includes('education')) {
      return `**Formation Académique** :\n\n🎓 **ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies**
• **Diplôme** : Ingénieure en Informatique - Génie Logiciel
• **Période** : 2020 - 2025
• **Spécialisation** : Développement Web et Architecture Logicielle

📚 **Domaines d'expertise** :
• Architecture microservices
• Développement full-stack (Spring Boot, Angular, NestJS, Next.js)
• DevOps et intégration continue
• Bases de données relationnelles et NoSQL
• Développement mobile Android
• Sécurité des applications web`;
    }
    
    // 7. COMPÉTENCES SOFT SKILLS
    if (q.includes('soft') || q.includes('personnel') || q.includes('qualité') || 
        q.includes('savoir-être')) {
      return `**Compétences Transversales** :\n\n🎯 **Compétences Professionnelles** :
• Planification stratégique
• Travail en équipe
• Résolution de problèmes
• Gestion de crise
• Pensée créative
• Analyse de données
• Brand Development
• Négociation
• Adaptabilité au changement

🗣️ **Langues** :
• **Arabe** : Langue maternelle
• **Français** : Niveau B2
• **Anglais** : Niveau B2`;
    }
    
    // 8. CONTACT
    if (q.includes('contact') || q.includes('email') || q.includes('téléphone') || 
        q.includes('joindre') || q.includes('linkedin') || q.includes('coordonnée')) {
      return `**Informations de Contact** :\n\n📧 **Email** : amal.klouz@esprit.tn
📞 **Téléphone** : +216 27 555 303
📍 **Localisation** : Bizerte, Tunisie

🔗 **Réseaux professionnels** :
• **LinkedIn** : linkedin.com/in/amal-klouz
• **GitHub** : github.com/amalklouz

💬 **Disponibilité** :
Amal est actuellement jeune diplômée et recherche des opportunités en tant que **développeuse junior** pour contribuer à des projets innovants.`;
    }
    
    // 9. PROFIL / PRÉSENTATION
    if (q.includes('qui') || q.includes('présente') || q.includes('profil') || 
        q.includes('à propos') || q.includes('parcours')) {
      return `**À propos d'Amal Klouz** :\n\n👩‍💻 **Ingénieure Informatique en Génie Logiciel**
Jeune diplômée de l'école **ESPRIT**, passionnée par le **développement web**.

🎯 **Objectif professionnel** :
Débuter sa carrière en tant que **développeuse junior** et contribuer à des projets innovants tout en développant ses compétences techniques.

💡 **Technologies favorites** :
• **Spring Boot**, **Angular**
• **NestJS**, **Next.js**
• Outils **DevOps** : **Jenkins**, **SonarQube**

🌟 **Points forts** :
• Enthousiaste et motivée
• Solides compétences en architecture microservices
• Expérience pratique en développement full-stack
• Maîtrise des pratiques DevOps et CI/CD
• Capacité d'apprentissage rapide et d'adaptation`;
    }
    
    // 10. TECHNOLOGIES SPÉCIFIQUES
    if (q.includes('spring') || q.includes('angular') || q.includes('nest') || 
        q.includes('next') || q.includes('kafka') || q.includes('oauth')) {
      return `**Maîtrise des Technologies Modernes** :\n\n⚙️ **Frameworks Backend** :
• **Spring Boot** : APIs REST, microservices, Spring Security
• **NestJS** : Architecture modulaire, TypeScript

🎨 **Frameworks Frontend** :
• **Angular** : Applications SPA, TypeScript
• **Next.js** : React avec SSR, optimisation SEO

🔄 **Messaging & Communication** :
• **Kafka** : Communication asynchrone entre microservices
• APIs REST sécurisées

🔐 **Sécurité** :
• **OAuth2** : Authentification et autorisation
• Sécurisation des endpoints

🛠️ **DevOps** :
• **Jenkins** : CI/CD et automatisation
• **SonarQube** : Qualité et analyse de code
• **Git** : Versionnement et collaboration`;
    }
    
    // 11. MICROSERVICES
    if (q.includes('microservice') || q.includes('architecture') || q.includes('scalable')) {
      return `**Expertise en Architecture Microservices** :\n\n🏗️ **Projet de Fin d'Études (PFE)** :
Application complète basée sur une architecture microservices :

**Technologies utilisées** :
• **Backend** : Spring Boot
• **Frontend** : Angular
• **Base de données** : PostgreSQL
• **Authentification** : OAuth2
• **Messaging** : Kafka
• **DevOps** : Jenkins, Git, CI/CD

**Compétences acquises** :
✅ Architecture distribuée et scalabilité
✅ Communication asynchrone entre services
✅ Sécurité des APIs
✅ Déploiement automatisé
✅ Suivi complet du cycle de vie des services
✅ Développement full-stack avancé`;
    }

    // 12. DEVOPS ET CI/CD
    if (q.includes('devops') || q.includes('ci/cd') || q.includes('jenkins') || 
        q.includes('sonarqube') || q.includes('déploiement')) {
      return `**Expertise DevOps et CI/CD** :\n\n🔄 **Pratiques DevOps maîtrisées** :
• **Jenkins** : Configuration de pipelines CI/CD
• **SonarQube** : Analyse de qualité de code et détection de bugs
• **Git** : Versionnement, branching strategies (GitFlow)
• **Docker** : Conteneurisation d'applications
• Déploiement automatisé et monitoring

**Expérience concrète** :
📌 **Projet DevOps académique** :
• Mise en place de processus CI/CD complets
• Automatisation des tests et déploiements
• Intégration continue avec Jenkins
• Monitoring et logs centralisés

📌 **PFE Microservices** :
• Déploiement automatisé de services multiples
• Pipeline CI/CD pour architecture distribuée
• Versionnement et gestion des releases

**Compétences** :
✅ Intégration continue et livraison continue
✅ Infrastructure as Code
✅ Automatisation des tests
✅ Gestion de la qualité du code`;
    }

    // 13. BACKEND SPÉCIFIQUE
    if (q.includes('backend') || q.includes('api') || q.includes('rest') || 
        q.includes('serveur')) {
      return `**Expertise Backend & APIs** :\n\n⚙️ **Technologies Backend** :

**Spring Boot** :
• Développement d'APIs REST robustes
• Spring Security pour l'authentification
• Spring Data JPA pour la persistance
• Architecture microservices
• Gestion des transactions

**NestJS** :
• Framework Node.js structuré avec TypeScript
• Architecture modulaire et scalable
• Intégration avec MongoDB
• APIs RESTful et GraphQL

**Expérience pratique** :
📌 **PFE Microservices** :
• APIs REST sécurisées avec OAuth2
• Communication inter-services avec Kafka
• Gestion de bases PostgreSQL

📌 **Application de gestion de tâches** :
• Backend NestJS avec MongoDB
• APIs pour collaboration en temps réel
• Gestion d'authentification et autorisations

**Compétences clés** :
✅ Design d'APIs REST (RESTful principles)
✅ Sécurisation des endpoints
✅ Gestion des bases de données
✅ Architecture scalable et maintenable`;
    }

    // 14. FRONTEND & UI/UX
    if (q.includes('frontend') || q.includes('angular') || q.includes('next') || 
        q.includes('interface') || q.includes('ui')) {
      return `**Expertise Frontend & Développement UI** :\n\n🎨 **Technologies Frontend** :

**Angular** :
• Applications Single Page (SPA)
• TypeScript pour un code robuste
• Reactive Forms et RxJS
• Angular Material pour l'UI
• Routing et lazy loading

**Next.js** :
• Framework React avec SSR
• Optimisation SEO et performances
• API Routes intégrées
• Static Site Generation (SSG)

**HTML5/CSS3** :
• Design responsive
• Animations CSS modernes
• Flexbox et Grid Layout
• Accessibilité web (WCAG)

**Projets réalisés** :
📌 **PFE Angular** :
• Interface utilisateur complète pour microservices
• Gestion d'état avec RxJS
• Intégration avec APIs REST sécurisées

📌 **Application Next.js** :
• Interface moderne pour gestion de tâches
• Collaboration temps réel
• UX optimisée

**Compétences** :
✅ Développement de composants réutilisables
✅ Gestion d'état complexe
✅ Optimisation des performances
✅ Design responsive et moderne`;
    }

    // 15. BASES DE DONNÉES
    if (q.includes('base') || q.includes('données') || q.includes('database') || 
        q.includes('postgresql') || q.includes('mongodb') || q.includes('mysql')) {
      return `**Expertise Bases de Données** :\n\n🗄️ **Bases Relationnelles** :

**PostgreSQL** :
• Modélisation de schémas complexes
• Optimisation de requêtes SQL
• Transactions ACID
• Indexation et performances
• Utilisé dans le PFE microservices

**MySQL** :
• Gestion de bases relationnelles
• Requêtes SQL avancées
• Intégration PHP et Java
• Projets web dynamiques

**Bases NoSQL** :

**MongoDB** :
• Documents JSON flexibles
• Modélisation orientée documents
• Agrégation et indexation
• Utilisé avec NestJS pour gestion de tâches

**Compétences** :
✅ Conception de schémas de données optimisés
✅ Requêtes SQL et NoSQL avancées
✅ Gestion des migrations et versions
✅ Optimisation des performances
✅ Sécurisation des accès données
✅ ORM : JPA/Hibernate, Mongoose`;
    }

    // 16. MÉTHODOLOGIES AGILES
    if (q.includes('agile') || q.includes('scrum') || q.includes('méthodologie') || 
        q.includes('gestion') || q.includes('projet')) {
      return `**Méthodologies Agiles & Gestion de Projet** :\n\n📊 **Expérience Agile** :

**Scrum** :
• Travail en sprints
• Daily stand-ups et rétrospectives
• Planification et estimation
• Découvert lors du projet C++

**Pratiques appliquées chez Wevioo** :
• Gestion collaborative en équipe
• Communication efficace
• Itérations courtes et feedback continu
• Adaptation rapide aux changements

**Compétences transversales** :
✅ Planification stratégique
✅ Travail en équipe cross-fonctionnelle
✅ Résolution de problèmes
✅ Adaptabilité au changement
✅ Communication technique et non-technique
✅ Gestion de crise et priorisation

**Outils de gestion** :
• Git pour le versionnement collaboratif
• Jenkins pour l'intégration continue
• Outils de tracking et collaboration

**Approche professionnelle** :
📌 Code review et pair programming
📌 Documentation technique
📌 Tests automatisés
📌 Amélioration continue`;
    }

    // 17. SÉCURITÉ
    if (q.includes('sécurité') || q.includes('oauth') || q.includes('authentification') || 
        q.includes('security') || q.includes('protection')) {
      return `**Expertise en Sécurité des Applications** :\n\n🔐 **Authentification & Autorisation** :

**OAuth2** :
• Implémentation complète dans le PFE
• Gestion des tokens JWT
• Authorization flows
• Sécurisation des microservices

**Spring Security** :
• Configuration de la sécurité backend
• Gestion des rôles et permissions
• Protection des endpoints REST
• Session management

**Bonnes pratiques** :
✅ Hashage sécurisé des mots de passe
✅ Validation et sanitization des inputs
✅ Protection contre CSRF et XSS
✅ HTTPS et communications sécurisées
✅ Gestion sécurisée des secrets
✅ Audit et logging de sécurité

**Expérience pratique** :
📌 **PFE Microservices** :
• OAuth2 pour authentification distribuée
• Sécurisation des APIs REST
• Gestion des tokens entre services

📌 **Projets Spring-Angular** :
• Authentification frontend/backend
• Guards et interceptors Angular
• Sécurisation des routes`;
    }

    // 18. KAFKA ET MESSAGING
    if (q.includes('kafka') || q.includes('messaging') || q.includes('asynchrone') || 
        q.includes('message') || q.includes('event')) {
      return `**Expertise Kafka & Communication Asynchrone** :\n\n📨 **Apache Kafka** :

**Implémentation dans le PFE** :
• Communication entre microservices
• Architecture event-driven
• Topics et partitions
• Producers et consumers
• Garantie de livraison des messages

**Use cases** :
✅ Découplage des services
✅ Communication asynchrone
✅ Scalabilité horizontale
✅ Traitement de flux de données
✅ Event sourcing

**Architecture mise en place** :
📌 Microservices Spring Boot
📌 Kafka comme message broker
📌 Gestion des événements métier
📌 Résilience et fault tolerance

**Compétences** :
• Configuration de clusters Kafka
• Design de topics et schémas
• Gestion des erreurs et retry
• Monitoring et debugging
• Intégration avec Spring Cloud Stream`;
    }

    // 19. DISPONIBILITÉ ET OPPORTUNITÉS
    if (q.includes('disponible') || q.includes('recrut') || q.includes('opportunité') || 
        q.includes('cherche') || q.includes('embauche') || q.includes('poste')) {
      return `**Disponibilité & Opportunités Professionnelles** :\n\n✨ **Statut actuel** :
Jeune diplômée ESPRIT (2025) - Ingénieure en Génie Logiciel

🎯 **Recherche active** :
Poste de **Développeuse Junior Full-Stack**

**Domaines d'intérêt** :
• Développement web moderne (Spring Boot, Angular, NestJS, Next.js)
• Architecture microservices et systèmes distribués
• DevOps et automatisation
• Projets innovants et technologies de pointe

**Type de contrat recherché** :
• CDI / CDD
• Stage de fin d'études longue durée
• Missions freelance
• Projets collaboratifs

**Atouts** :
✅ Solide formation technique (ESPRIT)
✅ Expérience concrète chez Wevioo
✅ Maîtrise des technologies modernes
✅ Compétences DevOps et CI/CD
✅ Adaptabilité et apprentissage rapide
✅ Travail en équipe agile

**Mobilité** :
📍 Basée à Bizerte, Tunisie
🌍 Ouverte aux opportunités en Tunisie et à l'international
💻 Télétravail possible

📧 **Contact** : amal.klouz@esprit.tn
📞 **Tél** : +216 27 555 303`;
    }

    // 20. POINTS FORTS / VALEUR AJOUTÉE
    if (q.includes('point fort') || q.includes('atout') || q.includes('valeur') || 
        q.includes('différence') || q.includes('pourquoi') || q.includes('choisir')) {
      return `**Points Forts & Valeur Ajoutée** :\n\n💎 **Expertise Technique Solide** :
• Maîtrise complète du stack moderne (Spring Boot, Angular, NestJS, Next.js)
• Architecture microservices avec expérience concrète
• Compétences DevOps rares pour un profil junior

🚀 **Expérience Pratique** :
• 3 stages progressifs chez Wevioo (du low-code aux microservices)
• Multiples projets académiques full-stack
• PFE complet avec technologies professionnelles

🔧 **Compétences Transversales** :
• **Adaptabilité** : Du C++ au web, du low-code aux microservices
• **Apprentissage rapide** : Technologies modernes maîtrisées rapidement
• **Travail d'équipe** : Expérience agile et collaboration
• **Résolution de problèmes** : Approche analytique et créative

📚 **Formation Complète** :
• Ingénieure ESPRIT (école reconnue)
• Projets variés : desktop, web, mobile, DevOps
• Connaissance de toute la stack de développement

🌟 **Qualités Personnelles** :
• Passionnée par le développement web
• Enthousiaste et motivée
• Planification stratégique
• Pensée créative et analytique
• Excellente communication (3 langues)

💼 **Prête à** :
✅ Contribuer immédiatement sur des projets Spring/Angular
✅ Apprendre de nouvelles technologies rapidement
✅ Travailler en équipe agile
✅ Participer à toutes les phases du développement`;
    }
    
    // 21. RÉPONSE PAR DÉFAUT
    return `Je comprends que vous demandez : "${question}"\n\n🤖 Je suis l'assistant IA d'Amal Klouz. Je peux vous parler de :\n\n• **Compétences techniques** (Spring Boot, Angular, NestJS, Next.js, DevOps)
• **Expériences professionnelles** chez Wevioo (stages et PFE)
• **Projets académiques** à ESPRIT
• **Formation** (Ingénieure en Génie Logiciel)
• **Compétences transversales** et langues
• **Informations de contact**\n\nPosez-moi une question plus spécifique ! 😊`;
  }

  sendMessage(): void {
    if (!this.input.trim() || this.isLoading) return;

    const userMessage = { 
      role: 'user' as const, 
      content: this.input 
    };
    this.messages = [...this.messages, userMessage];
    
    const question = this.input;
    this.input = '';
    this.isLoading = true;

    this.scrollToBottom();

    setTimeout(() => {
      const aiMessage = {
        role: 'assistant' as const,
        content: this.getResponseForQuestion(question)
      };
      
      this.messages = [...this.messages, aiMessage];
      this.isLoading = false;
      this.scrollToBottom();
      
    }, 800);
  }

  onSuggestedQuestionClick(question: string): void {
    this.input = question;
  }
}