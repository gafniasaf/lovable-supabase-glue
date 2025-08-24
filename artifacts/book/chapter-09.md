Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 9: Files and Uploads - Handling Attachments Safely

Files are everywhere in education. Students submit assignments, teachers share materials, supervisors review videos. But files can also be dangerous - they can carry viruses, overwhelm your storage, or expose private information.

Here's how we handle files safely and smoothly.

Upload Security That Actually Works

When someone uploads a file, we check it multiple times before accepting it:

File type checking:
We look at the actual file content, not just the filename. A virus renamed "homework.pdf" won't fool us - we can tell it's not really a PDF.

Allowed types in our system:
• Images: PNG, JPEG, GIF, WebP
• Documents: PDF, plain text
• Videos: MP4 (for EPA demonstrations)
• General: application/octet-stream

Size limits:
No uploading 10GB videos that crash the system. Default limit is 10MB for most files, but this can be adjusted based on needs.

Ownership rules:
• Students can only upload to their own submissions
• Teachers can only upload to courses they teach
• Files are tagged with who owns them

Real-time feedback:
• "File type not allowed" - immediately, not after waiting
• "File too large" - with the actual size limit
• "Quota exceeded" - if you've used your storage allowance

Progress Tracking and User Feedback

Large file uploads show progress:
• Percentage complete
• Upload speed
• Time remaining
• Pause/resume for flaky connections

You can keep working while files upload. A small indicator shows progress without blocking other work.

File Storage and Organization

Files are organized logically:
• Assignment submissions grouped by course and assignment
• Reference materials organized by course
• EPA videos linked to specific assessments

Every file gets:
• A unique ID that can't be guessed
• Metadata (size, type, upload date)
• Version tracking when files are replaced

Download Security

Download links are time-limited and secure:
• Links expire after 5 minutes
• Only authorized users can generate links
• Teachers can download student submissions in their courses
• Students can only download their own files

Export Formats That Work Everywhere

CSV exports for spreadsheets:
• UTF-8 encoding (handles any language)
• Proper quoting (commas in text don't break things)
• Headers that explain each column
• Works in Excel, Google Sheets, everywhere

Example CSV export:
```
student_name,course,lessons_completed,grade
"Martinez, Jennifer",Nursing Fundamentals,8,85
"Smith, John",Nursing Fundamentals,12,92
```

JSON exports for developers:
• Structured data with proper validation
• Includes all fields with correct types
• Request IDs for tracking

PDF exports (when needed):
• Fixed layout for official documents
• Consistent formatting across devices
• Ready for printing

Real protection in action:

When a student uploads an assignment:
1. Check file type against allowed list
2. Verify size is under limit
3. Check user's storage quota
4. Scan for malicious content (in test mode)
5. Generate unique storage key
6. Create time-limited upload URL
7. Record in attachments table
8. Update storage quota

When someone downloads a file:
1. Verify they're logged in
2. Check ownership permissions
3. Generate time-limited download URL
4. Track the download
5. URL expires after use

Why this matters:
You don't want student work lost because someone uploaded a virus. You don't want private files exposed because of bad security. Our system handles all this automatically - you just specify who should upload what, and we handle the rest safely.
________________________________________
