# Firebase Authentication Setup Guide

This guide explains how to set up Firebase Authentication and Firestore for the EduSoul application with role-based access control for mentors and students.

## Prerequisites

- Firebase project created at https://console.firebase.google.com/
- Authentication enabled in Firebase Console
- Firestore Database created

## Firebase Console Setup

### 1. Enable Authentication

1. Go to Firebase Console → Your Project → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. (Optional) Enable "Google" sign-in method if you want Google authentication

### 2. Create Firestore Database

1. Go to Firebase Console → Your Project → Firestore Database
2. Click "Create Database"
3. Choose a location (select one closest to your users)
4. Start in "Test mode" initially, then update to production rules

### 3. Apply Security Rules

1. Go to Firestore Database → Rules tab
2. Copy the contents of `firebase-rules.txt` in this project
3. Paste into the rules editor
4. Click "Publish"

The security rules include:
- **User Collection**: Users can only read/write their own data
- **Role-based Access**: Mentors can create courses, students can enroll
- **Authentication**: All operations require user authentication
- **Data Validation**: Ensures data integrity with role checks

### 4. Enable Email Verification (Optional but Recommended)

1. Go to Firebase Console → Authentication → Templates
2. Edit the email verification template
3. In Authentication → Sign-in method, enable "Email verification"

## Project Structure

```
src/
├── firebase.js                 # Firebase configuration and initialization
├── contexts/
│   └── AuthContext.jsx         # Authentication state management
├── pages/
│   ├── Login.jsx              # Login page with email/password and Google
│   └── Register.jsx           # Registration with role selection
├── components/
│   └── ProtectedRoute.jsx     # Route protection with role checks
└── App.jsx                     # Main app with routing
```

## Features Implemented

### Authentication
- Email/Password sign-in
- Google OAuth (optional)
- Password validation (8+ chars, uppercase, lowercase, number)
- Email validation
- Session persistence

### Role-Based Access Control
- Two roles: `student` and `mentor`
- Role stored in Firestore `users` collection
- Protected routes based on user role
- Dashboard customization per role

### Registration Fields
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone Number (required, validated)
- Password (required, strong password validation)
- Confirm Password (required, must match)
- Role Selection (student/mentor, required)
- Bio (optional)

### Security Features
- Protected routes
- Role-based access control
- Firestore security rules
- Input validation
- Error handling

## How to Use

### For Students

1. Click "Sign up" on the login page
2. Select "Student" as the role
3. Fill in all required fields
4. Submit the form
5. After registration, you'll be redirected to the Student Dashboard

### For Mentors

1. Click "Sign up" on the login page
2. Select "Mentor" as the role
3. Fill in all required fields
4. Submit the form
5. After registration, you'll be redirected to the Mentor Dashboard

### Login

1. Enter your email and password
2. Click "Sign In" or use Google sign-in
3. You'll be redirected to the appropriate dashboard based on your role

### Logout

Click the "Logout" button in the navigation bar of any dashboard.

## Firestore Data Structure

### Users Collection
```
users/{userId}
{
  uid: string,
  email: string,
  role: 'student' | 'mentor',
  firstName: string,
  lastName: string,
  phone: string,
  bio: string (optional),
  createdAt: timestamp
}
```

## Security Rules Summary

The `firebase-rules.txt` file includes comprehensive security rules for:

1. **Users Collection**: Users can only read/write their own data
2. **Courses Collection**: Only mentors can create/update their own courses
3. **Enrollments**: Students can enroll in courses, mentors can view their course enrollments
4. **Chats/Messages**: Participants can only access their own conversations
5. **Reviews**: Students can create reviews for courses they're enrolled in

## Testing the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to the local URL (usually http://localhost:5173)

3. Test registration:
   - Try registering as a student
   - Try registering as a mentor
   - Test validation errors (invalid email, weak password, etc.)

4. Test login:
   - Login with registered credentials
   - Test invalid credentials
   - Test logout

5. Verify Firestore:
   - Check the Firebase Console → Firestore Database
   - Verify user documents are created with correct roles

## Troubleshooting

### Authentication Errors
- **"auth/email-already-in-use"**: Email is already registered
- **"auth/weak-password"**: Password doesn't meet requirements
- **"auth/invalid-email"**: Email format is invalid

### Firestore Errors
- **"Permission denied"**: Check security rules in Firebase Console
- **"Document not found"**: User document may not have been created during registration

### Navigation Issues
- If navigation doesn't work after login, check the browser console for errors
- Ensure AuthContext is properly wrapping the app components

## Next Steps

1. Add more fields to registration based on your needs
2. Implement email verification
3. Add password reset functionality
4. Create mentor profile pages
5. Implement course creation and enrollment features
6. Add real-time features with Firestore listeners

## Support

For Firebase-related issues, check:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/rules-structure
