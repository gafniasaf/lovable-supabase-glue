Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 12: Going Live - Your Pre-Flight Checklist

Going live is like moving from a practice stage to opening night. Everything needs to be checked, double-checked, and ready for real people.

Here's your checklist:

1. Get Your Supabase Ready

Think of Supabase as your database home. You need:
• A real Supabase project (not the test one)
• The URL (starts with https://)
• The anon key (a long string of letters and numbers)
• A storage bucket called "public" for files

Go to supabase.com, create your project, and copy these values. They're like the keys to your new house.

2. Set Your Security Settings

These are your locks and alarms:
• CSRF_DOUBLE_SUBMIT=1 (stops fake form submissions)
• Remove TEST_MODE completely (no more test logins)
• Set proper rate limits (how many requests per minute)

Never, ever leave TEST_MODE=1 in production. That's like leaving your door wide open with a sign that says "come on in!"

3. Configure Your Environment

Think of this as setting up your utilities:

Required (your app won't work without these):
• NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
• NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
• NEXT_PUBLIC_BASE_URL=https://yourapp.com

Optional but recommended:
• UPLOAD_MAX_BYTES=20971520 (20MB file limit)
• GLOBAL_MUTATION_RATE_LIMIT=100 (prevent spam)
• STORAGE_QUOTA_ENABLED=1 (track how much space each user uses)

4. Check Your Health Endpoint

Before going live, visit /api/health. You should see:
{
  "ok": true,
  "dbOk": true,
  "storageOk": true
}

If any of these are false, something's not connected right. Fix it before proceeding.

5. Run Your Database Migrations

This sets up all your tables. In Supabase:
• Go to SQL Editor
• Run each migration file in order (0001, 0002, etc.)
• Check that all tables exist

6. Deploy with Docker or Vercel

Docker (if you like containers):
```
docker compose build web
docker compose up -d web
```

Vercel (if you like easy):
• Connect your GitHub repo
• Add your environment variables
• Click deploy

7. Test Everything One More Time

Like a dress rehearsal:
• Can students sign up and log in?
• Can teachers create courses?
• Do file uploads work?
• Are emails sending?

8. Monitor After Launch

Your app is live! Now watch it:
• Check /api/admin/metrics (shows usage)
• Watch for rate limit hits
• Monitor file storage usage
• Check error logs daily

Common "Oh No!" Moments and Fixes:

"Nobody can log in!"
→ Check NEXT_PUBLIC_SUPABASE_URL is https (not http)

"Files won't upload!"
→ Check the "public" bucket exists and has the right permissions

"It's really slow!"
→ Check rate limits aren't too strict

"I'm getting CSRF errors!"
→ Make sure your domain is in NEXT_PUBLIC_BASE_URL

Remember: Going live is exciting but nerve-wracking. Take it step by step. Test each piece. And always have a backup plan.

The beauty of this system? If something goes wrong, you can fix it quickly. No need to call expensive consultants or wait for updates. You built it, you can fix it.
________________________________________
