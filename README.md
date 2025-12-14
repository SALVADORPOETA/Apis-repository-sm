# APIs Repository

A lightweight, headless content management system built with Next.js and Firebase Firestore, designed to manage structured content by projects, sections, and items.

The system supports both local JSON persistence and cloud persistence, making it suitable for development, migration, and production environments.

<img width="779" height="551" alt="apisrepo" src="https://github.com/user-attachments/assets/ee4ed350-940e-47dc-b109-e1b3700f974b" />

## Features

- Headless CMS architecture
- Project-based content organization
- Section and item-level CRUD operations
- Firebase Firestore integration
- Local filesystem (JSON) persistence for development
- Admin authentication via secure request headers
- URL-safe project and section keys
- Designed for scalability and migration

## Project Structure

```
src/
├── lib/
│   ├── project-utils.ts               # Local JSON project persistence
│   ├── projects-utils-firebase.ts     # Firestore project CRUD
│   ├── data-utils.ts                  # Local JSON section/item CRUD
│   ├── firebase-utils.ts              # Firestore section/item CRUD
│   ├── firebase.ts                    # Firebase initialization
│   └── auth-utils.ts                  # Admin authentication logic
│
├── middleware.ts                      # Admin route protection
│
data/
├── projects.json                      # Local project registry
├── <project>/
│   ├── home.json
│   ├── history.json
│   └── ...
```

## Data Model

### Project

```typescript
interface IProject {
  key: string // URL-safe unique identifier
  name: string // Human-readable project name
  sections: string[] // List of section keys
}
```

### Firestore Structure

```
projects (collection)
 └── {projectKey} (document)
      ├── key
      ├── name
      ├── sections
      └── sections (subcollection)
           └── {sectionKey}
                └── items (subcollection)
                     └── {itemId}
```

## Authentication

Admin access is protected using a custom request header:

```
X-Admin-Key: <your-admin-key>
```

The key is validated against an environment variable:

```
ADMIN_KEY=your_secure_admin_key
```

This approach is intentionally simple and server-only, suitable for internal admin panels, scripts, and controlled environments.

## Environment Variables

Create a `.env.local` file with the following values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

ADMIN_KEY=your_admin_key
```

## Persistence Strategies

### Local JSON (Filesystem)

- Used for development or fallback scenarios
- Data stored under `/data`
- Simple and predictable structure
- No external dependencies

### Firebase Firestore

- Cloud-based persistence
- Scalable and production-ready
- Document IDs aligned with project keys
- Subcollections for sections and items

Both strategies share the same domain model, enabling easy migration.

## CRUD Capabilities

- **Projects**: Create, read, update, delete
- **Sections**: Defined per project
- **Items**: Full CRUD within sections, Firestore document-based IDs

## Middleware Protection

All `/admin/*` routes are protected via Next.js middleware.

Unauthorized access is automatically redirected to the base admin route.

## Design Principles

- Explicit domain modeling
- Separation of concerns
- No over-engineering
- Migration-friendly architecture
- Predictable and readable codebase

## Use Cases

- Cultural or historical content management
- Educational platforms
- Internal admin panels
- Structured documentation systems
- Headless CMS for static or dynamic frontends

## License

This project is open-source and intended for educational and portfolio purposes.

You are free to adapt it for your own use cases.
