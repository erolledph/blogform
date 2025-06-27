import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentationTab() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const apiEndpoint = `${window.location.origin}/api/content.json`;

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

    curl: `# Fetch all published content
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json"

# Pretty print JSON response
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json" | jq '.'

# Filter specific content by slug using jq
curl -X GET "${apiEndpoint}" \\
  -H "Accept: application/json" | jq '.[] | select(.slug == "your-slug-here")'`,

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
        print("Content with specified slug not found")`
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Learn how to fetch and use your content via the public API
        </p>
      </div>

      {/* API Endpoint */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint</h2>
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <code className="text-sm font-mono text-gray-800">{apiEndpoint}</code>
          <div className="flex space-x-2">
            <button
              onClick={() => copyToClipboard(apiEndpoint)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded"
              title="Copy URL"
            >
              <Copy className="h-4 w-4" />
            </button>
            <a
              href={apiEndpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900 rounded"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          This endpoint returns all published content in JSON format. Only content with status "published" is included.
        </p>
      </div>

      {/* Response Format */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Format</h2>
        <p className="text-sm text-gray-600 mb-4">
          The API returns an array of content objects with the following structure:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800">
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
    "publishDate": "2025-06-27T10:00:00Z",
    "createdAt": "2025-06-27T09:30:00Z",
    "updatedAt": "2025-06-27T10:15:00Z"
  }
]`}
          </pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Code Examples</h2>

        {/* JavaScript */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">JavaScript (Browser)</h3>
            <button
              onClick={() => copyToClipboard(codeExamples.javascript)}
              className="btn-secondary flex items-center text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>{codeExamples.javascript}</code>
            </pre>
          </div>
        </div>

        {/* Node.js */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">Node.js</h3>
            <button
              onClick={() => copyToClipboard(codeExamples.nodejs)}
              className="btn-secondary flex items-center text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>{codeExamples.nodejs}</code>
            </pre>
          </div>
        </div>

        {/* cURL */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">cURL</h3>
            <button
              onClick={() => copyToClipboard(codeExamples.curl)}
              className="btn-secondary flex items-center text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>{codeExamples.curl}</code>
            </pre>
          </div>
        </div>

        {/* Python */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-900">Python</h3>
            <button
              onClick={() => copyToClipboard(codeExamples.python)}
              className="btn-secondary flex items-center text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800">
              <code>{codeExamples.python}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Usage Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Notes</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>The API only returns content with status "published". Draft content is not included.</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Content is returned in descending order by creation date (newest first).</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>The content field contains Markdown formatted text that you can render in your application.</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>Dates are returned in ISO 8601 format (UTC timezone).</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p>The API supports CORS, so you can call it directly from browser applications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}