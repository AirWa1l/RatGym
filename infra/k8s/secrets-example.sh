# Create secrets with kubectl:

# JWT Secret
kubectl create secret generic ratgym-secrets \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Firebase Secrets
kubectl create secret generic firebase-secrets \
  --from-literal=FIREBASE_PROJECT_ID=your-project-id \
  --from-literal=FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n" \
  --from-literal=FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Firebase Web App Config (for frontend)
kubectl create secret generic firebase-web-config \
  --from-literal=REACT_APP_FIREBASE_API_KEY=your-api-key \
  --from-literal=REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com \
  --from-literal=REACT_APP_FIREBASE_PROJECT_ID=your-project-id \
  --from-literal=REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com \
  --from-literal=REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id \
  --from-literal=REACT_APP_FIREBASE_APP_ID=your-app-id
