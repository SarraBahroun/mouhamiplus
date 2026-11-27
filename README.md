# Mouhami+ ⚖️

**Application web de gestion de cabinet pour les avocats tunisiens.**

Mouhami+ réunit en une seule plateforme tout ce dont un cabinet a besoin au quotidien : dossiers, audiences, clients, documents, facturation et équipe, avec un espace dédié pour les clients et des outils d'intelligence artificielle.

Projet conçu et réalisé par **Sarah Bahroun** (cheffe de projet) dans le cadre de l'incubateur **iLab Sfax** (2026), à partir d'une étude terrain menée auprès d'avocats tunisiens.

---

## ✨ Fonctionnalités

### Espace cabinet (avocat et équipe)
- **Tableau de bord** : vue d'ensemble de l'activité du cabinet.
- **Dossiers** : création, suivi par étapes procédurales, documents associés.
- **Audiences et agenda** : calendrier des audiences et des rendez-vous, juridictions tunisiennes intégrées.
- **Délais légaux** : règles de délais configurables avec rappels.
- **Clients** : fiches clients, historique et dossiers liés.
- **Documents, contrats et correspondance** : stockage et organisation des pièces.
- **Facturation et paiements** : factures, suivi des paiements, rapports financiers.
- **Messagerie** interne et **recherche** globale.

### Gestion d'équipe
- Ajout de membres par rôle : associé, collaborateur, stagiaire, secrétaire.
- **Permissions détaillées** par membre et **journal d'audit** des actions.

### Espace client
- Portail sécurisé où le client consulte ses dossiers, documents et factures, et demande un rendez-vous.

### Intelligence artificielle
- **Assistant juridique**, **génération** de documents et **résumé** de pièces (Google Gemini).
- **OCR** : extraction du texte des PDF et images scannés (Tesseract.js).
- **Export PDF** compatible avec l'arabe.

### Sécurité et accessibilité
- Authentification avec **double authentification (2FA)**.
- Contrôle d'accès au niveau de la base de données (**Row Level Security** Supabase).
- Interface **trilingue : français, arabe (RTL) et anglais**.

---

## 🛠️ Stack technique

| Domaine | Technologies |
|---|---|
| Front-end | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Back-end et base de données | Supabase (PostgreSQL, Auth, Storage, RLS), migrations SQL |
| IA et documents | Google Gemini, Tesseract.js, pdf.js, jsPDF |
| E-mails | Nodemailer (Gmail) ou Resend |

---

## 🚀 Lancer le projet en local

```bash
git clone https://github.com/SarraBahroun/mouhamiplus.git
cd mouhamiplus
npm install
cp .env.example .env.local   # puis remplir les clés Supabase et e-mail
npm run dev
```

L'application est ensuite disponible sur http://localhost:3000.

Les migrations de la base se trouvent dans `supabase/migrations/`.

---

## 👩‍💻 Autrice

**Sarah Bahroun**, développeuse web junior et cheffe de projet
[LinkedIn](https://www.linkedin.com/in/sarah-bahroun-7369aa339) · [GitHub](https://github.com/SarraBahroun)
