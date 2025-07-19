const admin = require('firebase-admin');

// Global variable to track Firebase Admin SDK initialization status
let isFirebaseAdminInitialized = false;
let initializationError = null;

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "erolledph",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-m8wjz@erolledph.iam.gserviceaccount.com",
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "erolledph"
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    isFirebaseAdminInitialized = true;
  } else {
    console.log('Firebase Admin SDK already initialized');
    isFirebaseAdminInitialized = true;
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  initializationError = error;
  isFirebaseAdminInitialized = false;
}

const db = admin.firestore();
const auth = admin.auth();

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Check if Firebase Admin SDK is properly initialized
    if (!isFirebaseAdminInitialized) {
      console.error('Firebase Admin SDK not initialized. Error:', initializationError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Internal server error - Firebase Admin SDK initialization failed',
          details: initializationError ? initializationError.message : 'Unknown initialization error'
        })
      };
    }

    // Verify authentication
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const { httpMethod } = event;
    const productsRef = db.collection('products');

    switch (httpMethod) {
      case 'POST': {
        // Create new product
        const data = JSON.parse(event.body);
        const now = admin.firestore.FieldValue.serverTimestamp();
        
        // Validate required fields
        if (!data.name || !data.slug) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name and slug are required' })
          };
        }

        // Ensure price and percentOff are numbers
        const productData = {
          ...data,
          price: parseFloat(data.price) || 0,
          percentOff: parseFloat(data.percentOff) || 0,
          createdAt: now,
          updatedAt: now
        };

        const docRef = await productsRef.add(productData);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            id: docRef.id,
            message: 'Product created successfully' 
          })
        };
      }

      case 'PUT': {
        // Update existing product
        const data = JSON.parse(event.body);
        const { id, ...updateData } = data;
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Product ID is required' })
          };
        }

        const docRef = productsRef.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Product not found' })
          };
        }

        const now = admin.firestore.FieldValue.serverTimestamp();
        
        // Ensure price and percentOff are numbers
        const productData = {
          ...updateData,
          price: parseFloat(updateData.price) || 0,
          percentOff: parseFloat(updateData.percentOff) || 0,
          updatedAt: now
        };

        await docRef.update(productData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Product updated successfully' })
        };
      }

      case 'DELETE': {
        // Delete product
        const data = JSON.parse(event.body);
        const { id } = data;
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Product ID is required' })
          };
        }

        const docRef = productsRef.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Product not found' })
          };
        }

        await docRef.delete();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Product deleted successfully' })
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Error in admin-product function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};