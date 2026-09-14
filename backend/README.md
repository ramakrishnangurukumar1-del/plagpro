# Backend (Spring Boot)

## Run locally

1. Make sure MySQL is running locally (the app auto-creates the `plagiarism_db` schema).
2. Set your DB credentials as environment variables (don't commit them):
   ```
   export DB_USERNAME=root
   export DB_PASSWORD=your-password
   ```
3. Start the ML service first (see `../ml-service/README.md`) — it must be reachable at `http://localhost:5000`.
4. Run the backend:
   ```
   ./mvnw spring-boot:run
   ```
   The API listens on `http://localhost:8080`.

## Key endpoints

- `POST /api/auth/register` / `POST /api/auth/login` — returns a JWT
- `POST /api/documents/upload` (multipart, field `files`, up to 10) — student/faculty, requires `Authorization: Bearer <token>`
- `GET /api/documents/mine` — current user's documents
- `GET /api/documents/{id}/result` — full analysis breakdown
- `GET /api/faculty/documents` / `GET /api/faculty/stats` — faculty/admin only

## Architecture notes

- `service/fileprocessor/` — `FileProcessor` abstract class with `PdfFileProcessor` (PDFBox), `ImageFileProcessor` (Tess4J OCR), `DocxFileProcessor` (Apache POI), selected at runtime by `FileProcessorFactory`.
- `service/AIAnalyzer` — interface implemented by `MlServiceClient`, which delegates to the Flask ML service. Swappable without touching `DocumentService`.
- `service/PlagiarismService` — queries Wikipedia, CrossRef, OpenAlex, arXiv, and Semantic Scholar directly and scores word-overlap per source.
- Document analysis runs asynchronously (`@Async`) after upload; poll `GET /api/documents/{id}/result` for status.
