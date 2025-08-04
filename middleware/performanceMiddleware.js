import compression from 'compression';

// Compression middleware for better performance over long distances
export const compressionMiddleware = compression({
  level: 6, // Good balance between compression and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
});

// Cache control middleware for static assets
export const cacheControlMiddleware = (req, res, next) => {
  // Set cache headers for API responses
  if (req.path.startsWith('/api/')) {
    // Cache static data for 5 minutes
    if (req.path.includes('/services') || req.path.includes('/packages')) {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else {
      // Don't cache dynamic data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  next();
};

// Request timeout middleware for better UX
export const timeoutMiddleware = (timeout = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    });
    next();
  };
};

// Regional optimization headers
export const regionalOptimizationMiddleware = (req, res, next) => {
  // Add headers to help with regional performance
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Add server region info for debugging
  res.set('X-Server-Region', 'Bahrain-DB');
  res.set('X-Optimized-For', 'Egypt,Italy');
  
  next();
};

