# Deploy Firestore Rules

To fix the "Missing or insufficient permissions" error, you need to deploy the Firestore security rules.

## Steps:

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Deploy the Firestore rules**:
```bash
firebase deploy --only firestore:rules
```

## Alternative: Manual Setup

If the CLI doesn't work, you can manually set the rules in the Firebase Console:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `edusoul-baeb2`
3. Go to Firestore Database
4. Click on "Rules" tab
5. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to students collection
    match /students/{documentId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to any collection (for development)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click "Publish"

## After Deployment

Once the rules are deployed, the app should be able to save student data to Firestore successfully.

## Current Status

✅ Syntax errors fixed
✅ Firestore integration implemented
✅ Error handling improved
⏳ Waiting for Firestore rules deployment
