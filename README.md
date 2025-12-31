# Learning AI Assistant App - Complete Project Workflow

## 📋 Project Overview

This is a **Full-Stack Learning AI Assistant Application** that helps users learn from PDF documents using AI-powered features. The application allows users to upload PDFs, extract text, generate flashcards, quizzes, summaries, and chat with documents using Google's Gemini AI.

---

## 🏗️ Architecture Overview

### Tech Stack

**Backend:**

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.2.1
- **Database:** MongoDB with Mongoose 9.0.0
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **File Upload:** Multer 2.0.2
- **PDF Processing:** pdf-parse 2.4.5
- **AI Integration:** @google/genai 1.30.0 (Gemini AI)
- **Development:** nodemon for hot reload

**Frontend:**

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.9.6
- **Styling:** Tailwind CSS 4.1.17
- **HTTP Client:** Axios 1.13.2
- **UI Components:** Lucide React (icons)
- **Markdown:** react-markdown 10.1.0
- **Notifications:** react-hot-toast 2.6.0

---

## 📁 Project Structure

```
Learning-AI-Assistant-App/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── multer.js          # File upload configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── documentController.js  # Document CRUD operations
│   │   ├── aiController.js        # AI features (flashcards, quiz, chat)
│   │   ├── flashcardController.js # Flashcard management
│   │   ├── quizController.js      # Quiz management
│   │   └── progressController.js  # Progress tracking
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Document.js        # Document schema
│   │   ├── Flascard.js        # Flashcard schema
│   │   ├── Quiz.js            # Quiz schema
│   │   └── ChatHistory.js     # Chat history schema
│   ├── routes/
│   │   ├── authRoute.js       # Auth endpoints
│   │   ├── documentRoute.js   # Document endpoints
│   │   ├── aiRoute.js         # AI endpoints
│   │   ├── flashcardRoute.js  # Flashcard endpoints
│   │   ├── quizRoute.js       # Quiz endpoints
│   │   └── progressRoute.js   # Progress endpoints
│   ├── utils/
│   │   ├── geminiService.js   # Gemini AI service wrapper
│   │   ├── pdfParser.js       # PDF text extraction
│   │   └── textChunker.js     # Text chunking for RAG
│   ├── uploads/
│   │   └── documents/         # Uploaded PDF files
│   ├── server.js              # Express server entry point
│   └── package.json
│
└── frontend/
    └── ai-learning-assitant-app/
        ├── src/
        │   ├── components/
        │   │   ├── auth/          # Auth components (ProtectedRoute, PublicRoute)
        │   │   ├── ai/            # AI action components
        │   │   ├── chat/          # Chat interface
        │   │   ├── common/        # Reusable UI components
        │   │   ├── documents/     # Document components
        │   │   ├── flashCards/    # Flashcard components
        │   │   ├── layout/        # Layout components (Header, Sidebar)
        │   │   └── quizzes/       # Quiz components
        │   ├── context/
        │   │   └── AuthContext.jsx # Global auth state management
        │   ├── pages/
        │   │   ├── Auth/          # Login, Register pages
        │   │   ├── Dashboard/     # Dashboard page
        │   │   ├── Documents/     # Document pages
        │   │   ├── FlashCards/    # Flashcard pages
        │   │   ├── Quizzes/       # Quiz pages
        │   │   └── Profile/       # Profile page
        │   ├── services/
        │   │   ├── authService.js      # Auth API calls
        │   │   ├── documentService.js  # Document API calls
        │   │   ├── aiService.js        # AI API calls
        │   │   ├── flashcardService.js # Flashcard API calls
        │   │   ├── quizService.js      # Quiz API calls
        │   │   └── progressService.js  # Progress API calls
        │   ├── utils/
        │   │   ├── axiosInstance.js    # Axios configuration with interceptors
        │   │   └── apiPath.js          # API endpoint constants
        │   ├── App.jsx           # Main app component with routes
        │   ├── main.jsx          # React entry point
        │   └── index.css         # Global styles
        └── package.json
```

---

## 🔄 Complete Application Workflow

### 1. **Initialization & Server Setup**

**Backend (`server.js`):**

```
1. Load environment variables (dotenv)
2. Import Express and middleware
3. Connect to MongoDB (connectDB)
4. Configure CORS (allows all origins)
5. Setup JSON body parser
6. Serve static files from /uploads
7. Mount route handlers:
   - /api/auth
   - /api/documents
   - /api/flashcards
   - /api/ai
   - /api/quizzes
   - /api/progress
8. Add error handler middleware
9. Add 404 handler
10. Start server on PORT (default: 8000)
```

**Frontend (`main.jsx`):**

```
1. Wrap app with AuthProvider (context)
2. Setup React Router (BrowserRouter)
3. Setup Toast notifications
4. Render App component
```

---

### 2. **Authentication Flow**

#### **Registration:**

```
User → Frontend (RegisterPage)
    → POST /api/auth/register
    → Backend (authController.register)
    → Check if email/username exists
    → Hash password (bcryptjs, pre-save hook)
    → Create User document
    → Generate JWT token
    → Return user data + token
    → Frontend stores token in localStorage
    → Redirect to dashboard
```

#### **Login:**

```
User → Frontend (LoginPage)
    → POST /api/auth/login
    → Backend (authController.login)
    → Find user by email
    → Compare password (bcrypt compare)
    → Generate JWT token
    → Return user data + token
    → Frontend stores in localStorage
    → AuthContext updates state
    → Redirect to dashboard
```

#### **Protected Routes:**

```
All protected routes use auth middleware (protect):
1. Extract Bearer token from Authorization header
2. Verify JWT token
3. Find user from token payload
4. Attach user to req.user
5. Continue to route handler
```

---

### 3. **Document Upload & Processing Flow**

#### **Upload Document:**

```
User → Frontend (DocumentListPage)
    → Select PDF file + title
    → POST /api/documents/upload (multipart/form-data)
    → Multer middleware saves file to uploads/documents/
    → Backend (documentController.uploadDocument)
    → Create Document document with status: 'processing'
    → Return immediately (async processing)
    → Background: processPDF() function:
      1. Extract text from PDF (pdfParser.extractTextFromPDF)
      2. Chunk text into segments (textChunker.chunkText)
      3. Update Document with:
         - extractedText
         - chunks array
         - status: 'ready'
```

#### **Text Extraction (`pdfParser.js`):**

```
1. Read PDF file buffer
2. Use pdf-parse library to extract text
3. Return: {text, numPages, info}
```

#### **Text Chunking (`textChunker.js`):**

```
1. Clean text (remove extra whitespace)
2. Split into paragraphs
3. Create chunks of ~500 words with 50-word overlap
4. Return array: [{content, chunkIndex, pageNumber}]
```

---

### 4. **AI-Powered Features Flow**

#### **Generate Flashcards:**

```
User → Frontend (DocumentDetailsPage)
    → Click "Generate Flashcards"
    → POST /api/ai/generate-flashcards
      Body: {documentId, count}
    → Backend (aiController.generateFlashcards)
    → Find document (must be status: 'ready')
    → Call geminiService.generateFlashcards()
      - Prepare prompt with document text
      - Call Gemini API (gemini-2.5-flash-lite model)
      - Parse response (Q: question, A: answer, D: difficulty)
      - Return array of flashcard objects
    → Create Flashcard document with cards array
    → Return flashcard set
    → Frontend displays flashcards
```

#### **Generate Quiz:**

```
User → Frontend
    → POST /api/ai/generate-quiz
      Body: {documentId, numQuestions, title}
    → Backend (aiController.generateQuiz)
    → Call geminiService.generateQuiz()
      - Prepare prompt for MCQ format
      - Call Gemini API
      - Parse response (Q, O1-O4, C, E, D)
      - Return questions array
    → Create Quiz document
    → Return quiz
    → Frontend navigates to quiz page
```

#### **Generate Summary:**

```
User → Frontend
    → POST /api/ai/generate-summary
      Body: {documentId}
    → Backend (aiController.generateSummary)
    → Call geminiService.generateSummary()
      - Prepare summary prompt
      - Call Gemini API
      - Return summary text
    → Return summary
    → Frontend displays summary
```

#### **Chat with Document:**

```
User → Frontend (ChatInterface)
    → Type question
    → POST /api/ai/chat
      Body: {documentId, question}
    → Backend (aiController.chat)
    → Find relevant chunks (textChunker.findRelevantChunks)
      - Score chunks based on keyword matching
      - Return top 3 most relevant chunks
    → Get or create ChatHistory
    → Call geminiService.chatWithContext()
      - Combine relevant chunks as context
      - Prepare prompt with context + question
      - Call Gemini API
      - Return answer
    → Save user question + AI answer to ChatHistory
    → Return answer + relevant chunk indices
    → Frontend displays answer
```

#### **Explain Concept:**

```
User → Frontend
    → POST /api/ai/explain-concept
      Body: {documentId, concept}
    → Backend (aiController.explainConcept)
    → Find relevant chunks
    → Call geminiService.explainConcept()
    → Return explanation
```

**Relevant Chunk Finding (`textChunker.findRelevantChunks`):**

```
1. Extract keywords from query (remove stop words)
2. Score each chunk based on:
   - Exact word matches (3 points each)
   - Partial matches (1.5 points)
   - Number of unique matched words (bonus)
   - Position in document (early chunks get bonus)
3. Normalize scores by chunk length
4. Sort by score
5. Return top N chunks (default: 3)
```

---

### 5. **Flashcard Management Flow**

#### **Review Flashcards:**

```
User → Frontend (FlashcardPage)
    → Review flashcard (flip, mark difficulty)
    → POST /api/flashcards/:cardId/review
      Body: {difficulty}
    → Backend (flashcardController.reviewFlashcard)
    → Update card:
      - reviewCount++
      - lastReviewed = now
      - difficulty updated
    → Return updated card
```

#### **Toggle Star:**

```
User → Frontend
    → Click star icon
    → PUT /api/flashcards/:cardId/star
    → Backend (flashcardController.toggleStarFlashCard)
    → Toggle isStarred field
    → Return updated card
```

---

### 6. **Quiz Management Flow**

#### **Take Quiz:**

```
User → Frontend (QuizTakePage)
    → GET /api/quizzes/quiz/:id
    → Backend (quizController.getQuizById)
    → Return quiz (without correct answers)
    → User answers questions
    → POST /api/quizzes/:id/submit
      Body: {answers: [{questionIndex, selectedAnswer}]}
    → Backend (quizController.submitQuiz)
    → Grade answers:
      - Compare selectedAnswer with correctAnswer
      - Calculate score
      - Save userAnswers array
      - Set completedAt timestamp
    → Return quiz results
    → Frontend navigates to results page
```

#### **View Results:**

```
User → Frontend (QuizResultPage)
    → GET /api/quizzes/:id/results
    → Backend (quizController.getQuizResults)
    → Return quiz with answers and explanations
    → Frontend displays results
```

---

### 7. **Progress Tracking Flow**

#### **Dashboard:**

```
User → Frontend (DashboardPage)
    → GET /api/progress/dashboard
    → Backend (progressController.getDashboardData)
    → Aggregate data:
      - Total documents count
      - Total flashcards count
      - Total quizzes count
      - Recent documents (last accessed)
      - Recent quizzes (completed)
    → Return dashboard data
    → Frontend displays stats and activity
```

---

### 8. **Data Models & Relationships**

```
User
  ├── _id
  ├── username (unique)
  ├── email (unique)
  ├── password (hashed)
  └── profileImage

Document
  ├── _id
  ├── userId → User
  ├── title
  ├── fileName
  ├── filePath
  ├── fileSize
  ├── extractedText
  ├── chunks: [{content, pageNumber, chunkIndex}]
  ├── status: 'processing' | 'ready' | 'failed'
  ├── uploadDate
  └── lastAccessed

Flashcard
  ├── _id
  ├── userId → User
  ├── documentId → Document
  └── cards: [{
        question,
        answer,
        difficulty,
        lastReviewed,
        reviewCount,
        isStarred
      }]

Quiz
  ├── _id
  ├── userId → User
  ├── documentId → Document
  ├── title
  ├── questions: [{
        question,
        options: [4 options],
        correctAnswer,
        explanation,
        difficulty
      }]
  ├── userAnswers: [{
        questionIndex,
        selectedAnswer,
        isCorrect,
        answeredAt
      }]
  ├── score
  ├── totalQuestion
  └── completedAt

ChatHistory
  ├── _id
  ├── userId → User
  ├── documentId → Document
  └── messages: [{
        role: 'user' | 'assistant',
        content,
        timestamp,
        relevanChunks: [chunk indices]
      }]
```

---

## 🔐 Security Features

1. **Authentication:**

   - JWT tokens with expiration (7 days default)
   - Password hashing with bcryptjs (salt rounds: 10)
   - Protected routes via middleware

2. **Authorization:**

   - Users can only access their own documents/resources
   - All protected routes verify user ownership

3. **Input Validation:**
   - Email validation (regex)
   - Password minimum length (8 characters)
   - Username minimum length (3 characters)
   - File type validation (PDF only)

---

## 🚀 API Endpoints Summary

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `POST /change-password` - Change password (protected)

### Documents (`/api/documents`)

- `POST /upload` - Upload PDF (protected, multipart/form-data)
- `GET /` - Get all user documents (protected)
- `GET /:id` - Get document by ID (protected)
- `DELETE /:id` - Delete document (protected)

### AI Features (`/api/ai`)

- `POST /generate-flashcards` - Generate flashcards (protected)
- `POST /generate-quiz` - Generate quiz (protected)
- `POST /generate-summary` - Generate summary (protected)
- `POST /chat` - Chat with document (protected)
- `POST /explain-concept` - Explain concept (protected)
- `GET /chat-history/:documentId` - Get chat history (protected)

### Flashcards (`/api/flashcards`)

- `GET /` - Get all flashcard sets (protected)
- `GET /:documentId` - Get flashcards for document (protected)
- `POST /:cardId/review` - Review flashcard (protected)
- `PUT /:cardId/star` - Toggle star (protected)
- `DELETE /:id` - Delete flashcard set (protected)

### Quizzes (`/api/quizzes`)

- `GET /:documentId` - Get quizzes for document (protected)
- `GET /quiz/:id` - Get quiz by ID (protected)
- `POST /:id/submit` - Submit quiz answers (protected)
- `GET /:id/results` - Get quiz results (protected)
- `DELETE /:id` - Delete quiz (protected)

### Progress (`/api/progress`)

- `GET /dashboard` - Get dashboard data (protected)

---

## 🔄 Frontend Routing

```
/ → Redirect to /dashboard or /login
/login → LoginPage (PublicRoute)
/register → RegisterPage (PublicRoute)
/dashboard → DashboardPage (ProtectedRoute)
/documents → DocumentListPage (ProtectedRoute)
/documents/:id → DocumentDetailsPage (ProtectedRoute)
/flashcards → FlashcardListPage (ProtectedRoute)
/documents/:id/flashcards → FlashcardPage (ProtectedRoute)
/quizzes/:quizId → QuizTakePage (ProtectedRoute)
/quizzes/:quizId/results → QuizResultPage (ProtectedRoute)
/profile → ProfilePage (ProtectedRoute)
* → NotFoundPage
```

---

## 🎨 Frontend Architecture Patterns

1. **State Management:**

   - React Context API for global auth state
   - Local useState for component-specific state
   - Services layer for API calls

2. **Component Structure:**

   - Pages: Top-level route components
   - Components: Reusable UI components
   - Services: API communication layer
   - Utils: Helper functions and configurations

3. **API Communication:**
   - Axios instance with interceptors
   - Automatic JWT token attachment
   - Centralized error handling
   - API paths defined in constants

---

## 📊 Key Workflows Summary

### Complete User Journey:

1. **Register/Login** → Get JWT token
2. **Upload PDF** → Document processed in background
3. **View Document** → See document details
4. **Generate Flashcards** → AI creates flashcards from document
5. **Review Flashcards** → Study with spaced repetition tracking
6. **Generate Quiz** → AI creates quiz questions
7. **Take Quiz** → Submit answers, get graded
8. **Chat with Document** → Ask questions, get AI-powered answers
9. **View Dashboard** → Track learning progress
10. **Manage Profile** → Update user information

---

## 🛠️ Development Workflow

### Backend:

```bash
cd backend
npm install
npm run dev  # Starts with nodemon (hot reload)
```

### Frontend:

```bash
cd frontend/ai-learning-assitant-app
npm install
npm run dev  # Starts Vite dev server
```

### Environment Variables Required:

**Backend (.env):**

```
MONGODB_URI=mongodb://localhost:27017/learning-ai-assistant
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=8000
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
```

**Frontend (.env or update apiPath.js):**

```
VITE_API_URL=http://localhost:8000
```

---

## 🔍 Key Technologies & Concepts

1. **RAG (Retrieval-Augmented Generation):**

   - Documents are chunked and stored
   - Relevant chunks are retrieved for context
   - AI generates responses using retrieved context

2. **JWT Authentication:**

   - Stateless authentication
   - Token stored in localStorage
   - Automatic token attachment via Axios interceptors

3. **File Processing:**

   - Async PDF processing
   - Background text extraction and chunking
   - Status tracking (processing → ready)

4. **AI Integration:**
   - Google Gemini API
   - Structured prompt engineering
   - Response parsing and formatting
