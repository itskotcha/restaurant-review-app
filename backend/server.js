const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// ========================================
// GET /api/stats - ดึงสถิติทั้งหมด
// ========================================
app.get('/api/stats', async (req, res) => {
  try {
    const restaurants = await readJsonFile('restaurants.json');
    const reviews = await readJsonFile('reviews.json');

    const totalRestaurants = restaurants.length;
    const totalReviews = reviews.length;

    // Calculate average rating per restaurant
    const restaurantRatings = restaurants.map(r => {
      const rReviews = reviews.filter(rv => rv.restaurantId === r.id);
      const avgRating =
        rReviews.length > 0
          ? rReviews.reduce((sum, rv) => sum + rv.rating, 0) / rReviews.length
          : 0;
      return { ...r, averageRating: avgRating };
    });

    // Overall average rating (across all restaurants)
    const averageRating =
      restaurantRatings.length > 0
        ? restaurantRatings.reduce((sum, r) => sum + r.averageRating, 0) /
          restaurantRatings.length
        : 0;

    // Top 5 restaurants by rating
    const topRatedRestaurants = [...restaurantRatings]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5)
      .map(r => ({ id: r.id, name: r.name, averageRating: Number(r.averageRating.toFixed(1)) }));

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        topRatedRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
