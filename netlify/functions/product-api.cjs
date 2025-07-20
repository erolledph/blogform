const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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
}

const db = admin.firestore();

// Helper function to get public app settings (including currency)
async function getPublicAppSettings() {
  try {
    const docRef = db.collection('appSettings').doc('public');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return docSnap.data();
    }
    
    // Return default settings if no public settings exist
    return {
      currency: '$', // Default currency
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error fetching public app settings:', error);
    return {
      currency: '$', // Default currency on error
      updatedAt: new Date()
    };
  }
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(price, percentOff) {
  if (!price || !percentOff || percentOff <= 0) return price;
  return price - (price * (percentOff / 100));
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests for public API
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get public app settings (including currency)
    const appSettings = await getPublicAppSettings();
    const currency = appSettings.currency || '$';

    // Query Firestore for published products (without ordering to avoid index requirement)
    const productsRef = db.collection('products');
    const snapshot = await productsRef
      .where('status', '==', 'published')
      .get();


    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Calculate discounted price
      const originalPrice = data.price || 0;
      const percentOff = data.percentOff || 0;
      const discountedPrice = calculateDiscountedPrice(originalPrice, percentOff);
      
      // Ensure imageUrls is always an array for consistency
      let imageUrls = data.imageUrls || [];
      
      // If imageUrls is empty but imageUrl exists, use imageUrl as the first item
      if (imageUrls.length === 0 && data.imageUrl) {
        imageUrls = [data.imageUrl];
      }
      
      // Convert Firestore timestamps to ISO strings
      const processedData = {
        id: doc.id,
        ...data,
        // Add currency from public app settings
        currency,
        // Ensure imageUrls is always present as an array
        imageUrls,
        // Add calculated fields
        originalPrice,
        discountedPrice,
        savings: originalPrice - discountedPrice,
        // Use the actual productUrl from Firestore data
        productUrl: data.productUrl || '',
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
      };
      
      products.push(processedData);
    });

    // Sort by creation date (newest first) manually to ensure consistent ordering
    // Use document ID as secondary sort to ensure deterministic results
    products.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      
      // Primary sort: by creation date (newest first)
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Secondary sort: by document ID for deterministic ordering when dates are equal
      return b.id.localeCompare(a.id);
    });


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
      })
    };
  }
};