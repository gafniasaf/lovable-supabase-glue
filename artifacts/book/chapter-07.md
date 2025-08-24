Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 7: Security Made Simple - Keeping the Bad Guys Out

Security sounds complicated, but it's really just a few simple ideas applied consistently.

Think of your app like a school building. You want students and teachers to get in easily, but you want to keep out people who don't belong. And even inside the building, some rooms are for everyone (cafeteria) while others are restricted (principal's office).

JWTs - Your Digital ID Badge

A JWT is like a visitor badge that says who you are and when it expires.

When students log in, they get a JWT that says "I'm Jennifer Martinez, I'm a student, this badge expires in 2 hours." Every time Jennifer clicks something, she shows her badge, and the system checks "is this badge real?" and "is Jennifer allowed to do this?"

The beautiful part: badges can't be faked. They're digitally signed like a tamper-evident seal.

JWKS - The Badge Verification System

JWKS is like the security office's master list of valid badge signatures. When someone presents a badge, we check the signature against the master list.

If the security office changes their badge printer (which happens for security reasons), they publish a new master list, and our system automatically updates. No manual work needed.

CSRF - Stopping Fake Requests

CSRF protection stops bad websites from tricking your browser into doing things you didn't mean to do.

Imagine you're logged into your school portal, and then you visit a malicious site. Without CSRF protection, that malicious site could secretly tell your browser "submit this grade change" and your browser would do it because it thinks the request came from you.

We prevent this by checking "did this request really come from our app?" If someone tries to submit a grade change from outside our system, we block it.

CSP - The Approved Scripts List

CSP (Content Security Policy) is like having a strict guest list for code that's allowed to run on our pages.

Every page has a special "nonce" - like a password that changes every time. Only scripts with the correct nonce are allowed to run. This blocks a huge category of attacks where bad guys try to inject malicious code into our pages.

Real protection in action:

When students upload files:
• Only certain file types allowed (PDFs, images, videos)
• Size limits enforced (no 10GB files crashing the system)
• Files scanned for malicious content
• Time-limited download links that expire

When someone tries to access data:
• JWTs verify they're logged in
• RLS ensures they can only see their own data
• CSRF blocks fake form submissions
• CSP prevents malicious scripts

Request IDs - Your Tracking Numbers

Every action gets a unique tracking number (Request ID). When something goes wrong, you can give us the request ID and we can trace exactly what happened.

"Jennifer's assignment didn't submit properly" becomes "Request ID abc-123-def shows the file was too large and got rejected at 2:47 PM."

Test mode protection:
In production, if someone tries to use test-mode tricks (like fake authentication headers), they get blocked immediately. The system knows when it's in production and enforces real security.

Why this matters for you:
You don't need to understand cryptography or become a security expert. You just need to make sure these protections are turned on consistently. Cursor helps by building them into every screen automatically - you just need to specify who should see what.

Security isn't something you add at the end. It's built into the foundation so you can sleep well at night.
________________________________________
