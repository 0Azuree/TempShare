const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

// Simple storage simulation (use database in production)
let fileStorage = new Map();

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const result = await multipart.parse(event);
    const file = result.files[0];
    const duration = result.duration;
    
    if (!file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'No file uploaded' })
      };
    }

    const code = generateCode();
    
    // Calculate expiry time
    const now = new Date();
    const expiryTime = new Date(now);
    
    switch (duration) {
      case '1hr':
        expiryTime.setHours(now.getHours() + 1);
        break;
      case '5hr':
        expiryTime.setHours(now.getHours() + 5);
        break;
      case '1d':
        expiryTime.setDate(now.getDate() + 1);
        break;
      default:
        expiryTime.setHours(now.getHours() + 1);
    }

    // Store file info (in production, save to cloud storage)
    fileStorage.set(code, {
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
      size: file.content.length,
      expiryTime: expiryTime,
      uploadTime: now
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        code: code,
        expiryTime: expiryTime.toISOString()
      })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Server error' })
    };
  }
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
