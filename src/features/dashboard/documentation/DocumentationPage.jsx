import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentationPage() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const apiEndpoint = `${window.location.origin}/api/content.json`;
  const productsApiEndpoint = `${window.location.origin}/api/products.json`;

  const codeExamples = {
    javascript: `// Fetch all published content
fetch('${apiEndpoint}')
  .then(response => response.json())
  .then(data => {
    console.log('All content:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Fetch specific content by slug
fetch('${apiEndpoint}')
  .then(response => response.json())
  .then(data => {
    const specificContent = data.find(item => item.slug === 'your-slug-here');
    console.log('Specific content:', specificContent);
  });`,

    productsJavascript: `// Fetch all published products
fetch('${productsApiEndpoint}')
  .then(response => response.json())
  .then(data => {
    console.log('All products:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Fetch specific product by slug
fetch('${productsApiEndpoint}')
  .then(response => response.json())
  .then(data => {
    const specificProduct = data.find(item => item.slug === 'your-product-slug');
    console.log('Specific product:', specificProduct);
  });`,
    nodejs: `const https = require('https');

// Fetch all published content
const fetchContent = () => {
  return new Promise((resolve, reject) => {
    https.get('${apiEndpoint}', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const content = JSON.parse(data);
          resolve(content);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// Usage
fetchContent()
  .then(content => {
    console.log('All content:', content);
    
    // Find specific content by slug
    const specificContent = content.find(item => item.slug === 'your-slug-here');
    console.log('Specific content:', specificContent);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,

    productsNodejs: `const https = require('https');

// Fetch all published products
const fetchProducts = () => {
  return new Promise((resolve, reject) => {
    https.get('${productsApiEndpoint}', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// Usage
fetchProducts()
  .then(products => {
    console.log('All products:', products);
    
    // Find specific product by slug
    const specificProduct = products.find(item => item.slug === 'your-product-slug');
    console.log('Specific product:', specificProduct);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,
    curl: `# Fetch all published content
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json"

# Pretty print JSON response
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json" | jq '.'

# Filter specific content by slug using jq
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json" | jq '.[] | select(.slug == "your-slug-here")'`,

    productsCurl: `# Fetch all published products
curl -X GET "${productsApiEndpoint}" \\
  -H "Accept: application/json"

# Pretty print JSON response
curl -X GET "${productsApiEndpoint}" \\
  -H "Accept: application/json" | jq '.'

# Filter specific product by slug using jq
curl -X GET "${productsApiEndpoint}" \\
  -H "Accept: application/json" | jq '.[] | select(.slug == "your-product-slug")'`,
    python: `import requests
import json

# Fetch all published content
def fetch_content():
    try:
        response = requests.get('${apiEndpoint}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching content: {e}")
        return None

# Usage
content = fetch_content()
if content:
    print("All content:", json.dumps(content, indent=2))
    
    # Find specific content by slug
    specific_content = next((item for item in content if item['slug'] == 'your-slug-here'), None)
    if specific_content:
        print("Specific content:", json.dumps(specific_content, indent=2))
    else:
        print("Content with specified slug not found")`,

    productsPython: `import requests
import json

# Fetch all published products
def fetch_products():
    try:
        response = requests.get('${productsApiEndpoint}')
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching products: {e}")
        return None

# Usage
products = fetch_products()
if products:
    print("All products:", json.dumps(products, indent=2))
    
    # Find specific product by slug
    specific_product = next((item for item in products if item['slug'] == 'your-product-slug'), None)
    if specific_product:
        print("Specific product:", json.dumps(specific_product, indent=2))
    else:
        print("Product with specified slug not found")`
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to fetch and use your content and products via the public APIs
        </p>
      </div>

      {/* Content API Endpoint */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Content API Endpoint</h2>
        </div>
        <div className="card-content">
          <div className="bg-muted rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <code className="text-base font-mono text-foreground break-all">{apiEndpoint}</code>
            <div className="flex space-x-3 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(apiEndpoint)}
                className="btn-ghost btn-sm"
                title="Copy URL"
              >
                <Copy className="h-5 w-5" />
              </button>
              <a
                href={apiEndpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost btn-sm"
                title="Open in new tab"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
          <p className="mt-6 text-base text-muted-foreground">
            This endpoint returns all published blog content in JSON format. Only content with status "published" is included.
          </p>
        </div>
      </div>

      {/* Products API Endpoint */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Products API Endpoint</h2>
        </div>
        <div className="card-content">
          <div className="bg-muted rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <code className="text-base font-mono text-foreground break-all">{productsApiEndpoint}</code>
            <div className="flex space-x-3 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(productsApiEndpoint)}
                className="btn-ghost btn-sm"
                title="Copy URL"
              >
                <Copy className="h-5 w-5" />
              </button>
              <a
                href={productsApiEndpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost btn-sm"
                title="Open in new tab"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
          <p className="mt-6 text-base text-muted-foreground">
            This endpoint returns all published products in JSON format. Only products with status "published" are included.
          </p>
        </div>
      </div>

      {/* Content Response Format */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Content API Response Format</h2>
          <p className="card-description">
            The content API returns an array of blog post objects with the following structure:
          </p>
        </div>
        <div className="card-content">
          <div className="bg-muted rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap">
{`[
  {
    "id": "firestore-generated-id-123",
    "title": "The Clever Idea: Next.js, Firebase & Cloudflare",
    "slug": "the-clever-idea-nextjs-firebase-cloudflare",
    "content": "# The Clever Idea\\n\\nThis is the **body** of my post in Markdown...",
    "featuredImageUrl": "https://firebasestorage.googleapis.com/v0/b/...",
    "metaDescription": "Explore a clever architecture for your Next.js blog...",
    "seoTitle": "Clever Next.js Blog Architecture | MySite",
    "keywords": ["nextjs", "firebase", "cloudflare", "blog"],
    "author": "Your Name",
    "categories": ["Web Development", "Cloud"],
    "tags": ["nextjs", "firebase", "cloudflare", "blogging", "seo"],
    "status": "published",
    "contentUrl": "https://your-custom-domain.com/post/the-clever-idea-nextjs-firebase-cloudflare",
    "publishDate": "2025-06-27T10:00:00Z",
    "createdAt": "2025-06-27T09:30:00Z",
    "updatedAt": "2025-06-27T10:15:00Z"
  }
]`}
            </pre>
          </div>
        </div>
      </div>

      {/* Products Response Format */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Products API Response Format</h2>
          <p className="card-description">
            The products API returns an array of product objects with the following structure:
          </p>
        </div>
        <div className="card-content">
          <div className="bg-muted rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap">
{`[
  {
    "id": "firestore-generated-id-456",
    "name": "Premium Wireless Headphones",
    "slug": "premium-wireless-headphones",
    "description": "# Premium Audio Experience\\n\\nHigh-quality wireless headphones...",
    "price": 199.99,
    "percentOff": 15,
    "originalPrice": 199.99,
    "discountedPrice": 169.99,
    "savings": 30.00,
    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/...",
    "category": "Electronics",
    "tags": ["audio", "wireless", "premium", "headphones"],
    "status": "published",
    "productUrl": "https://your-custom-domain.com/product/premium-wireless-headphones",
    "createdAt": "2025-06-27T09:30:00Z",
    "updatedAt": "2025-06-27T10:15:00Z"
  }
]`}
            </pre>
          </div>
        </div>
      </div>
      {/* Code Examples */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground mb-8">Code Examples</h2>

        {/* Content API Examples */}
        <h3 className="text-2xl font-bold text-foreground mb-6">Content API Examples</h3>
        
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">JavaScript (Browser)</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.javascript)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.javascript}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">Node.js</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.nodejs)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.nodejs}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">cURL</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.curl)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.curl}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">Python</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.python)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.python}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Products API Examples */}
        <h3 className="text-2xl font-bold text-foreground mb-6 mt-12">Products API Examples</h3>
        
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">JavaScript (Browser)</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.productsJavascript)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.productsJavascript}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">Node.js</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.productsNodejs)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.productsNodejs}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">cURL</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.productsCurl)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.productsCurl}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="card-title">Python</h4>
              <button
                onClick={() => copyToClipboard(codeExamples.productsPython)}
                className="btn-secondary btn-sm"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="bg-muted rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                <code>{codeExamples.productsPython}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Notes */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Usage Notes</h2>
        </div>
        <div className="card-content">
          <div className="space-y-6 text-base text-muted-foreground">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Both APIs only return items with status "published". Draft content and products are not included.</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Content and products are returned in descending order by creation date (newest first).</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>The content and description fields contain Markdown formatted text that you can render in your application.</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Dates are returned in ISO 8601 format (UTC timezone).</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Both APIs support CORS, so you can call them directly from browser applications.</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Each item includes a URL field (`contentUrl` or `productUrl`) with the full URL using your configured custom domain.</p>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <p>Products include calculated pricing fields: `originalPrice`, `discountedPrice`, and `savings` based on the `price` and `percentOff` values.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}