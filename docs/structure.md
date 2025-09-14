## 📌 File & Folder Explanation

---

### 1️⃣ `server.js`

**Entry Point of the App**

**Responsibilities:**
- Start the Express server  
- Connect to MongoDB (`config/db.js`)  
- Load middlewares (e.g., JSON parsing, CORS)  
- Mount routes (`/api/auth`, `/api/dashboard`)  

---

### 2️⃣ `config/`

**Purpose:**  
Stores configuration files like **DB connection**, environment setup, etc.

#### 📂 `db.js`

**Responsibilities:**
- Establish MongoDB connection using **Mongoose**  
- Read MongoDB URI from `.env`  
- Export the connection function for `server.js`  

---

### 3️⃣ `models/`

**Purpose:**  
Contains all **Mongoose schemas/models**.  
Defines the structure of collections in MongoDB.

#### 📂 `User.js`

**Responsibilities:**
- Define the **User schema** with fields:  
  - `firstName`, `lastName`, `email`, `password`, `role` (e.g., rider/driver/admin)  
- Handle **field validation**  
- Interact with MongoDB for CRUD operations  

---

### 4️⃣ `routes/`

**Purpose:**  
Defines **API endpoints** (HTTP methods + paths).  
Routes forward requests to controller functions for business logic.

#### 📂 `auth.js`

**Responsibilities:**
- Authentication routes:  
  - `POST /signup` → register user  
  - `POST /login` → authenticate user and return JWT  

#### 📂 `dashboard.js`

**Responsibilities:**
- Protected routes:  
  - `GET /dashboard` → fetch dashboard data (only for authenticated users)  

---

### 5️⃣ `middleware/`

**Purpose:**  
Functions that run **before reaching the controller**.

#### 📂 `auth.js`

**Responsibilities:**
- Verify **JWT token** from request headers  
- Attach user info to `req.user`  
- Support **role-based access control**  

---

### 6️⃣ `controllers/`

**Purpose:**  
Handles the **business logic** for routes.  
Keeps routes clean and modular.

#### 📂 `authController.js`

**Responsibilities:**
- `signup` → hash password, save user to DB, return JWT  
- `login` → validate credentials, return JWT  

#### 📂 `dashboardController.js`

**Responsibilities:**
- Handle protected dashboard logic  
- Ensure only authenticated users with valid roles can access  

---
