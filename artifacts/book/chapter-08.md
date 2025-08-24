Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 8: Testing - Your Safety Net

Testing is like having a really diligent assistant who checks your work before anyone else sees it.

You know how before you send an important email, you read it over to make sure it makes sense and doesn't have typos? Testing does that automatically for your app, except it checks hundreds of things in a few minutes.

Jest - Checking the Small Pieces

Jest tests the individual pieces of your app, like "when a student clicks 'Mark Complete,' does it actually save to the database?"

Think of Jest like checking that each Lego piece clicks together properly before you try to build the whole castle.

Real example:
We have a Jest test that says "when Jennifer submits her EPA video, the system should save her student ID, the EPA ID, the video file, and today's date." If any of those pieces break, Jest catches it immediately.

Playwright - Testing Like a Real Person

Playwright acts like a real person using your app. It opens a web browser, clicks buttons, fills out forms, and checks that the right things happen.

Real Playwright test for our system:
1. Go to the login page
2. Type in Jennifer's username and password
3. Click "Log In"
4. Check that the dashboard loads with Jennifer's courses
5. Click "Nursing Fundamentals"
6. Click "Mark Complete" on lesson 5
7. Check that the progress bar updates to show 5 out of 12 lessons complete

If any step fails, Playwright tells us exactly where it broke.

Why this saves your sanity:

Catch problems before users do:
Instead of getting a call at 7 PM saying "students can't submit their assignments," we find out at 2 PM when we run the tests.

Confidence when making changes:
When we want to add a new feature, we run all the tests first. If everything passes, we know we didn't accidentally break existing features.

Clear proof that things work:
When someone asks "are you sure the grade calculation is working correctly?" we can show them the test that checks it automatically every day.

Real story:
We wanted to add a feature where students could upload multiple files for one assignment. We built it and it worked great in our testing.

But then we ran the full test suite and discovered we accidentally broke the "single file upload" feature that was already working. The Playwright test caught it immediately:

"Test failed: Expected 1 file upload button, found 0 file upload buttons."

We fixed the bug in 10 minutes instead of finding out about it when students started complaining.

The tests that matter most:

Happy path tests:
"When everything goes right, does it work?" Login → dashboard → complete lesson → see progress update.

Sad path tests:
"When things go wrong, do we handle it gracefully?" Upload a file that's too big → show helpful error message instead of crashing.

Permission tests:
"Can students see other students' grades?" Try to access Jennifer's grades while logged in as Marcus → should be blocked.

Test artifacts:
When tests fail, they automatically capture:
• Screenshots showing exactly what went wrong
• Videos of the entire test run
• Request IDs for tracking down the exact error
• Test reports saved in the artifacts folder

What you don't need to test:
You don't need to test every possible combination of everything. Just test the main paths people will take and the most common ways things go wrong.

Think of it like checking that your car starts, the brakes work, and the lights turn on. You don't need to test every possible radio station.
________________________________________
