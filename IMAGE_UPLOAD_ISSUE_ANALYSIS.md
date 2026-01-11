# Image Upload Issue - Root Cause & Solutions

## 🔴 Problem Identified

Product images are not displaying live in production even though uploads complete successfully.

---

## 🔍 Root Causes

### **1. Hardcoded Localhost URL in Upload Response**
**File:** [backend/src/routes/upload.js](backend/src/routes/upload.js#L60-L65)

```javascript
// Lines 60-65 - PRODUCTION ISSUE
const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
```

**Issue:** The upload endpoint returns hardcoded `localhost:5001` URLs, which:
- Only work on local development
- Break completely in production (domain.cloud instead of localhost)
- Are inaccessible from the frontend when deployed

### **2. Inconsistent Static File Serving Path**
**File:** [backend/src/index.js](backend/src/index.js#L220)

```javascript
app.use('/uploads', express.static('./uploads'));
```

**Issues:**
- Uses relative path `./uploads` (works in dev, fails in production)
- No CORS headers explicitly set for static files
- Path may differ between development and production environments

### **3. Frontend URL Reconstruction Logic**
**Files:** 
- [frontend/src/pages/ProductDetailPage.tsx](frontend/src/pages/ProductDetailPage.tsx#L54-L63)
- [frontend/src/pages/dashboard/ProductsPage.tsx](frontend/src/pages/dashboard/ProductsPage.tsx#L62-L70)

The frontend tries to fix URLs by reconstructing them:
```typescript
if (imageUrl && imageUrl.startsWith('/uploads/')) {
  const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '');
  imageUrl = `${apiRoot}${imageUrl}`;
}
```

**Issue:** This is a workaround that shouldn't be necessary if the backend returns correct URLs.

---

## ✅ Solutions

### **Solution 1: Fix Upload Route to Return Environment-Aware URLs (CRITICAL)**

Replace hardcoded localhost with dynamic API base URL in [backend/src/routes/upload.js](backend/src/routes/upload.js):

```javascript
// Get API base URL from environment or request
const getApiBaseUrl = (req) => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const host = process.env.API_HOST || req.get('host');
  const baseUrl = `${protocol}://${host}`;
  return baseUrl;
};

// Upload image
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const apiBase = getApiBaseUrl(req);
    const imageUrl = `${apiBase}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

// Generic file upload (for CV, documents, etc.)
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const apiBase = getApiBaseUrl(req);
    const fileUrl = `${apiBase}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});
```

### **Solution 2: Fix Static File Serving with Absolute Path**

Update [backend/src/index.js](backend/src/index.js#L220) to use absolute path:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

// At top of file with other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Then in middleware section, replace:
// app.use('/uploads', express.static('./uploads'));
// With:
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1h', // Cache for 1 hour
  etag: false
}));
```

### **Solution 3: Simplify Frontend URL Handling**

Since the backend will now return correct absolute URLs, simplify [frontend/src/pages/ProductDetailPage.tsx](frontend/src/pages/ProductDetailPage.tsx#L54-L63) and [frontend/src/pages/dashboard/ProductsPage.tsx](frontend/src/pages/dashboard/ProductsPage.tsx#L62-L70):

```typescript
// Simply use the URL directly from database
const imageUrl = productData.image_url;
// Remove the manual URL reconstruction
```

### **Solution 4: Environment Configuration**

Add to your production `.env`:
```
# For production, if API is on separate domain
API_HOST=api.bitmineroboticscw.cloud

# Or keep it empty to auto-detect from request headers
# API_HOST=
```

---

## 📋 Implementation Checklist

- [ ] Update [backend/src/routes/upload.js](backend/src/routes/upload.js) - Add `getApiBaseUrl()` function and use it in both endpoints
- [ ] Update [backend/src/index.js](backend/src/index.js) - Use absolute path for static file serving
- [ ] Simplify image URL handling in [frontend/src/pages/ProductDetailPage.tsx](frontend/src/pages/ProductDetailPage.tsx)
- [ ] Simplify image URL handling in [frontend/src/pages/dashboard/ProductsPage.tsx](frontend/src/pages/dashboard/ProductsPage.tsx)
- [ ] Test with new product upload in production
- [ ] Verify images display correctly on all pages (ShopPage, CartPage, etc.)

---

## 🧪 Testing Steps

1. **Development:** Upload a product image locally, verify it displays
2. **Staging:** Upload image, check browser network tab for correct URLs
3. **Production:** Upload image, check:
   - Database stores correct URL
   - Image loads in browser (check network tab)
   - Displays in shop, detail, and cart pages
   - Displays in dashboard product list

---

## 🚀 Expected Result

After implementing these fixes:
- Backend returns absolute URLs like `https://bitmineroboticscw.cloud/uploads/12345-abc.png`
- Frontend displays images immediately without URL reconstruction
- Works across all environments (local, staging, production)
- Consistent image serving across all product pages
