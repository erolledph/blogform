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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Fetching content from Firestore with ordered query...');
    
    // Query Firestore for published content with proper ordering
    // This ensures consistent results by using Firestore's indexing capabilities
    const contentRef = db.collection('content');
    const snapshot = await contentRef
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();

    console.log(`Found ${snapshot.size} published documents (ordered by createdAt desc)`);

    const content = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Processing document: ${doc.id}, created: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'N/A'}`);
      
      // Convert Firestore timestamps to ISO strings
      const processedData = {
        id: doc.id,
        ...data,
        publishDate: data.publishDate ? data.publishDate.toDate().toISOString() : null,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
      };
      
      content.push(processedData);
    });

    // No need for manual sorting since Firestore query already returns ordered results
    console.log(`Returning ${content.length} content items in consistent order`);
    console.log(`Latest content titles: [${content.slice(0, 3).map(item => `'${item.title}'`).join(', ')}]`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(content)
    };

  } catch (error) {
    console.error('Error fetching content:', error);
    
    // Check if this is a Firestore index error
    if (error.code === 9 || error.message.includes('index')) {
      console.error('FIRESTORE INDEX REQUIRED: You need to create a composite index for this query.');
      console.error('Please check your Firebase console for the index creation link, or create an index for:');
      console.error('Collection: content');
      console.error('Fields: status (Ascending), createdAt (Descending)');
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database index required',
          message: 'A Firestore composite index is required for this query. Please check the function logs and Firebase console.',
          details: 'Query requires index for: status (==) + createdAt (desc)'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      })
    };
  }
};
