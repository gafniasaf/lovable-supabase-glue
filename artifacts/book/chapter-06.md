Build Fast with Confidence
A Plain-English Guide to Modern Web Apps (for Non-Coders using Cursor)
________________________________________
Chapter 6: DTOs and JSON - Speaking the Same Language

DTOs and JSON are like having a standard form that everyone agrees to use.

You know how when you go to the doctor, they always ask for the same information in the same order? Name, date of birth, insurance info, reason for visit. They don't just let you tell your story however you want - they need specific information in a specific format so they can help you efficiently.

That's exactly what DTOs and JSON do for our apps.

JSON is the format:
JSON is just a simple way to write down information that computers can easily read. Instead of a messy paragraph, it looks like a neat list:

Student: Jennifer Martinez
Course: Nursing Fundamentals  
Lessons Completed: 8 out of 12
Last Activity: Yesterday

That's basically JSON - just names and values written in a consistent way.

DTOs are the rules:
A DTO (Data Transfer Object) is like the official form template. It says exactly what information we expect and in what format.

When a student tries to submit an assignment, our DTO says the form must have:
• Assignment ID (required)
• Text content (up to 10,000 characters)
• File URLs (optional)
• Submission date (filled in automatically)

If someone tries to submit a form that's missing the assignment ID, or has text that's too long, we reject it immediately with a helpful error message.

Why this prevents headaches:

No surprise failures:
Instead of accepting messy data that breaks things later, we catch problems immediately. "Sorry, you forgot to include which assignment this is for."

Consistent everywhere:
Every screen that shows student progress shows exactly the same information in exactly the same format. No confusion about whether "submitted_at" means the same thing in different places.

Easy to test:
You can look at the DTO and immediately see "this screen should show student name, progress percentage, and completion date." If it shows something different, there's a bug.

Real example:
Students were uploading EPA videos in all different formats - some used .mov files, others used .mp4, others used weird formats that wouldn't play on school computers. Plus some students weren't including which EPA the video was for.

We created a DTO that says:
• Video must be .mp4 format only
• File size must be under 100MB
• Must include which EPA this demonstrates

Now when students try to upload a video:
• Wrong format? "Please convert to MP4 first"
• Too big? "Please compress your video to under 100MB"
• Missing EPA info? "Please select which EPA this video demonstrates"

Clear errors, no guessing, no wasted time.

The magic of checking both ways:
We don't just check the information coming in - we also check the information going out. If our system is supposed to send back "student name, progress percentage, completion date" but accidentally sends back something different, we catch that too.

Every response includes a Request ID. When something goes wrong, this ID lets us trace exactly what happened.

This means when you're reviewing screens in Cursor, you can trust that if the data looks right, it actually is right. No hidden surprises.
________________________________________
