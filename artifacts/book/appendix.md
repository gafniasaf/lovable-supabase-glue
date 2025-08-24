Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Appendix: Quick Reference and Checklists

Quick Command Reference

Start your app locally:
• docker compose build web
• docker compose up -d web
• Visit http://localhost:3022

Stop your app:
• docker compose down

Check if it's working:
• http://localhost:3022/api/health

Run tests:
• docker compose --profile tests up tests

Common Cursor Prompts

Creating a new screen:
"Create a dashboard for teachers that shows all their active courses with student count and last activity date"

Adding a feature:
"Add a button to export this table as CSV with UTF-8 encoding and proper headers"

Fixing an error:
"This component is showing [error message]. Fix it and add proper error handling"

Environment Variables Checklist

□ NEXT_PUBLIC_SUPABASE_URL (required)
□ NEXT_PUBLIC_SUPABASE_ANON_KEY (required)
□ NEXT_PUBLIC_BASE_URL (required)
□ Remove TEST_MODE completely
□ CSRF_DOUBLE_SUBMIT=1
□ UPLOAD_MAX_BYTES=20971520
□ STORAGE_QUOTA_ENABLED=1
□ RUNTIME_API_V2=1 (if using external tools)

File Type Reference

Allowed uploads:
• Images: PNG, JPEG, GIF, WebP
• Documents: PDF, plain text
• Video: MP4
• General: application/octet-stream

Size limits:
• Default: 20MB
• Configurable via UPLOAD_MAX_BYTES

Security Checklist

Before going live:
□ TEST_MODE is completely removed
□ CSRF protection is enabled
□ Rate limits are configured
□ File types are restricted
□ RLS policies are active
□ JWT keys are production keys

User Roles Reference

student:
• See own courses and grades
• Submit assignments
• Take quizzes
• View feedback

teacher:
• Create courses
• Grade assignments
• View all students in their courses
• Generate reports

parent:
• View linked children
• See children's progress
• No edit permissions

admin:
• Everything
• System metrics
• User management

Common DTOs (Data Shapes)

Assignment submission:
{
  "assignment_id": "uuid",
  "text": "string (max 10,000 chars)",
  "file_urls": ["array of strings"]
}

Progress update:
{
  "pct": 85,
  "topic": "Chapter 3"
}

Grade submission:
{
  "score": 92,
  "feedback": "Great work!",
  "attempt_id": "uuid"
}

Error Response Reference

All errors follow this format:
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  },
  "requestId": "uuid-for-tracking"
}

Common codes:
• BAD_REQUEST - Invalid data
• UNAUTHENTICATED - Not logged in
• FORBIDDEN - No permission
• NOT_FOUND - Doesn't exist
• TOO_MANY_REQUESTS - Rate limited
• INTERNAL - Server error

Troubleshooting Checklist

"Can't upload files"
□ Check bucket exists
□ Check file type is allowed
□ Check file size < limit
□ Check user has permission

"Can't see data"
□ Check RLS policies
□ Check user role
□ Check enrollment status
□ Check data exists

"Getting CSRF errors"
□ CSRF_DOUBLE_SUBMIT=1 is set
□ Cookie domain matches
□ Using HTTPS in production

"Rate limited"
□ Check rate limit settings
□ Look for loops in code
□ Add request debouncing

Quick Architecture Reference

Browser → Next.js → API Routes → Services → Supabase
         ↓
      Middleware (security, headers, request IDs)
         ↓
      Gateways (data fetching with contracts)
         ↓
      DTOs (validated data shapes)

This flow ensures:
• Security at every level
• Consistent data shapes
• Easy debugging with request IDs
• Clean separation of concerns

Remember: When in doubt, check the health endpoint first. It tells you what's connected and what's not.
________________________________________
