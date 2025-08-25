# Page snapshot

```yaml
- link "Skip to main content":
  - /url: "#main"
  - text: Skip to main
- main "Main content":
  - region "Sign in":
    - text: EC
    - heading "Sign in" [level=1]
    - paragraph: Welcome back. Please enter your credentials.
    - text: Email
    - textbox "Email"
    - text: Password
    - textbox "Password"
    - button "Sign in"
    - paragraph:
      - text: No account?
      - link "Ask admin":
        - /url: "#"
    - paragraph:
      - text: Want to sign out? Use the header "Sign out" button, or
      - button "logout now"
      - text: .
- region "Notifications"
- alert
```