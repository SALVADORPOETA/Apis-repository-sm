# APIs Repository

This is an **ORIGINAL** project built with **Next.js** and **Firebase Firestore**. It is specifically designed to manage structured content organized by projects, sections, and items, and it serves as the central data layer for my original frontend applications, providing the dynamic content consumed by their sections and pages. By leveraging Firestore, the architecture is centered on scalability and production readiness. Its design prioritizes simplicity and clear domain modeling, making it an excellent backend solution for educational platforms, structured documentation, internal administrative systems, and multi-project content-driven applications that require an agile content hub.

The data structure in Firestore directly mirrors the CMS domain, organizing content with a main projects collection and nested subcollections for sections and items, enabling efficient CRUD operations and seamless integration across multiple frontend projects. Admin access is secured using a Next.js Middleware that verifies a secret key (X-Admin-Key) via request header, protecting all administrative routes (/admin/*). This straightforward, key-based security ensures appropriate access control for controlled environments, facilitating its use in internal administration tools and private content management workflows.

<img width="779" height="551" alt="apisrepo" src="https://github.com/user-attachments/assets/ee4ed350-940e-47dc-b109-e1b3700f974b" />

---

## 🌐 Live Projects Using This API

This headless CMS currently powers the following **original** applications:

<table>
  <thead>
    <tr>
      <th>Project</th>
      <th>Description</th>
      <th>Live Demo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Mayapan</strong></td>
      <td>Interactive Mayan civilization knowledge platform</td>
      <td><a href="https://mayapan-sm.vercel.app/">View →</a></td>
    </tr>
    <tr>
      <td><strong>Bharat</strong></td>
      <td>Cultural and historical exploration of India</td>
      <td><a href="https://bharat-sm.vercel.app/">View →</a></td>
    </tr>
    <tr>
      <td><strong>Kemet</strong></td>
      <td>Ancient Egyptian civilization educational resource</td>
      <td><a href="https://kemet-sm.vercel.app/">View →</a></td>
    </tr>
    <tr>
      <td><strong>Empire</strong></td>
      <td>Historical empire documentation system</td>
      <td><a href="https://empire-sm.vercel.app/">View →</a></td>
    </tr>
  </tbody>
</table>

> Each project dynamically fetches structured content (sections, items, media) from this centralized API, demonstrating real-world scalability and multi-tenant architecture.

---

## 🚀 Features

- Headless CMS architecture
- Project-based content organization
- Section and item-level CRUD operations
- Firebase Firestore integration
- Admin authentication via secure request headers
- URL-safe project and section keys
- Designed for scalability and migration

---

## 📂 Project Structure
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

---

## 📊 Data Model

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

---

## 🔧 Installation & Local Development

Follow these steps to set up the project in your local environment:

### 1. Clone the repository
```bash
git clone https://github.com/SALVADORPOETA/Apis-repository-sm.git
cd Apis-repository-sm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your Firebase credentials and admin key:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

ADMIN_KEY=your_secure_admin_key
```

### 4. Run the development server
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### 5. Verify the Setup

You can verify the API is working by accessing the projects endpoint. To test administrative actions (POST/PUT/DELETE) or protected routes, include the security header in your requests:

**Using cURL:**
```bash
curl -H "X-Admin-Key: your_admin_key_here" http://localhost:3000/api/admin/projects
```

**Using Postman/Insomnia:**

Add the following header to your requests:
```
X-Admin-Key: your_admin_key_here
```

---

## 🔐 Authentication

Admin access is protected using a custom request header:
```
X-Admin-Key: <your-admin-key>
```

The key is validated against an environment variable:
```
ADMIN_KEY=your_secure_admin_key
```

This approach is intentionally simple and server-only, suitable for internal admin panels, scripts, and controlled environments.

---

## 💾 Persistence Strategies

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

---

## ✅ CRUD Capabilities

- **Projects**: Create, read, update, delete
- **Sections**: Defined per project
- **Items**: Full CRUD within sections, Firestore document-based IDs

---

## 🛡️ Middleware Protection

All `/admin/*` routes are protected via Next.js middleware.

Unauthorized access is automatically redirected to the base admin route.

---

## 🎯 Design Principles

- Explicit domain modeling
- Separation of concerns
- No over-engineering
- Migration-friendly architecture
- Predictable and readable codebase

---

## 💡 Use Cases

- Cultural or historical content management
- Educational platforms
- Internal admin panels
- Structured documentation systems
- Headless CMS for static or dynamic frontends

---

## 👨🏽‍💻 Author

**Salvador Martínez** Full-Stack Developer

* [GitHub](https://github.com/SALVADORPOETA)
* [LinkedIn](https://www.linkedin.com/in/salvador-martinez-sm/)

---

## 📄 License

This project is open-source and intended for educational and portfolio purposes.

You are free to adapt it for your own use cases.
