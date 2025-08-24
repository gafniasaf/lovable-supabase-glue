Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 11: Runtime v2 - Playing Nice with Other Tools

Runtime v2 is how your app talks to other educational tools without them needing to log in separately.

You know how some websites let you "Sign in with Google"? Runtime v2 is similar, but instead of signing in, it lets educational tools send data directly to your app.

Here's the problem it solves:

Jennifer is using an interactive anatomy app that her school bought. When she completes a module, that app needs to tell our system "Jennifer finished the heart anatomy section with 85%." Without Runtime v2, Jennifer would have to manually enter her progress in two different systems.

With Runtime v2, the anatomy app talks directly to our system.

How it works:

Step 1: Get permission
The anatomy app gets a special Bearer token (like a temporary ID card) that says "I'm allowed to send progress for Jennifer in this course."

Step 2: Check who they are
When they connect, we check their token and ask "What can you do?" The /context endpoint tells them:
• You can send progress for Jennifer Martinez
• In course: Anatomy 101
• With these permissions: progress.write, events.write

Step 3: Send the data
The anatomy app sends Jennifer's progress:
{
  "pct": 85,
  "topic": "Cardiovascular System"
}

Step 4: We handle the rest
We save the progress, update Jennifer's dashboard, and send back "Got it!"

The cool security parts:

Rate limiting: Each app can only send 60 updates per minute per student. This stops broken apps from flooding us with data.

Audience binding: If the anatomy app says it's from "anatomy.school.edu," we check that it really is. No imposters allowed.

Scopes control what each app can do:
• progress.write - Send student progress
• events.write - Log learning events
• attempts.write - Submit quiz scores
• Nothing else - they can't see other students or change grades

Idempotency (fancy word for "no duplicates"):
If the anatomy app's internet hiccups and sends the same progress twice, we ignore the duplicate. Jennifer doesn't get 170% progress.

Real example:
A student uses three different tools:
1. Virtual microscope app → sends progress to our system
2. Quiz tool → sends test scores to our system  
3. Video platform → sends completion status to our system

The student sees everything in one dashboard. The teacher sees all progress in one place. Nobody has to copy-paste between systems.

The simple version: Runtime v2 is like having a universal translator between educational apps. They all speak different languages, but Runtime v2 translates everything into the language our system understands.
________________________________________
