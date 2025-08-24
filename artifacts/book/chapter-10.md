Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 10: Analytics - Numbers That Actually Help

Analytics is only useful if it helps you make decisions. We track what matters and show it in ways that make sense.

You know how your car dashboard shows just the important stuff - speed, fuel, engine warnings? You don't need to know the oil pressure in PSI unless something's wrong. Same idea here.

Different dashboards for different people:

Student Dashboard shows:
• How many courses they're enrolled in
• Total lessons completed across all courses
• Which course to continue next
• Progress percentage for each course

When a student completes a lesson, all these numbers update instantly. No waiting for overnight reports.

Teacher Dashboard shows:
• Active courses count
• Total unique students enrolled
• Assignments needing grading (the most important!)
• Interactive attempts in last 24 hours
• Pass rate for interactive content

Real example:
A teacher logs in Monday morning and sees "Needs grading: 23" - that's 23 assignments waiting across all their courses. Click the number, go straight to the grading queue.

Admin Dashboard shows:
• Total users in the system
• Total courses created
• Daily active users
• Recent system activity

Progress tracking that's honest:

For each course, we track:
• Total lessons vs completed lessons
• Next lesson to work on (not just a percentage)
• Actual completion, not just "clicked on it once"

The progress bar shows true completion. If a course has 12 lessons and you've done 6, it shows 50%. Simple, honest, useful.

Engagement reports:

Teachers can see engagement data for their courses:
• How many lessons in the course
• How many assignments created
• Total submissions received

Export as CSV:
```
metric,value
lessons,24
assignments,8
submissions,156
```

Early warning signs:

The system watches for patterns that might indicate problems:
• Students who haven't logged in recently
• Courses with low completion rates
• Assignments with unusually low submission rates

But we don't cry wolf. Only real issues trigger alerts.

Privacy built in:

• Students only see their own data
• Teachers only see their courses and enrolled students
• Parents see their linked children's progress
• Admins see aggregated numbers, not individual details

Real-time updates:

When something changes, dashboards update immediately:
• Student completes lesson → progress updates
• Teacher grades assignment → needs grading count drops
• New enrollment → student count increases

No "refresh to see changes" or "data updated nightly" disclaimers.

What we don't track:

We don't track everything just because we can. No:
• Time spent staring at the screen
• Mouse movement heatmaps
• Detailed click tracking
• Invasive behavior monitoring

We track outcomes, not surveillance.

Export what you need:

Every report can be exported:
• CSV for spreadsheets (UTF-8, works everywhere)
• JSON for developers
• Filtered by date ranges
• Only data you're authorized to see

The x-total-count header:

When you request a list (like assignments), the response includes an x-total-count header with the real total, even if you're only viewing page 1. This lets us show accurate counts without loading everything.

Why this matters:
Good analytics helps you help your students. When you can see who's struggling before they fail, you can intervene. When you know which content works, you can make more of it. When grading queues are visible, nothing gets lost.

Analytics should illuminate, not overwhelm. Our dashboards show what you need to know, when you need to know it, in a format you can actually use.
________________________________________
