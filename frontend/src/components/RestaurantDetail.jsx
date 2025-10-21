import { useState, useEffect, useCallback, memo } from 'react';
import ReviewForm from './ReviewForm';
import { getRestaurantById } from '../services/api';

// Memoized ReviewList to prevent unnecessary re-renders
const ReviewList = memo(function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p>ยังไม่มีรีวิวสำหรับร้านนี้</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-card">
          <div className="review-header">
            <strong>{review.userName}</strong>
            <span>⭐ {review.rating}</span>
          </div>
          <div className="review-date">{review.visitDate}</div>
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
});

function RestaurantDetail({ restaurantId, onBack }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchRestaurantDetail wrapped in useCallback to avoid unnecessary re-creation
  const fetchRestaurantDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getRestaurantById(restaurantId);
      if (result.success) {
        setRestaurant(result.data);
      } else {
        setError('ไม่สามารถโหลดข้อมูลร้านได้');
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลร้านได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantDetail();
  }, [fetchRestaurantDetail]);

  const handleReviewAdded = () => {
    // Refresh data after new review
    fetchRestaurantDetail();
  };

  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!restaurant) return <div className="error">ไม่พบร้านอาหาร</div>;

  return (
    <div className="restaurant-detail">
      <button className="back-button" onClick={onBack}>
        ← กลับ
      </button>

      <div className="detail-header">
        <img src={restaurant.image} alt={restaurant.name} />
        <div className="detail-info">
          <h1>{restaurant.name}</h1>
          <p className="category">{restaurant.category}</p>
          <p className="description">{restaurant.description}</p>
          <div className="info-row">
            <span>📍 {restaurant.location}</span>
            <span>📞 {restaurant.phone}</span>
            <span>🕐 {restaurant.openHours}</span>
          </div>
          <div className="rating-info">
            <span className="rating">
              ⭐ {restaurant.averageRating > 0
                ? restaurant.averageRating.toFixed(1)
                : 'ยังไม่มีรีวิว'}
            </span>
            <span className="price">{'฿'.repeat(restaurant.priceRange)}</span>
            <span className="total-reviews">({restaurant.totalReviews} รีวิว)</span>
          </div>
        </div>
      </div>

      <ReviewForm
        restaurantId={restaurantId}
        onReviewAdded={handleReviewAdded}
      />

      <ReviewList reviews={restaurant.reviews || []} />
    </div>
  );
}

export default RestaurantDetail;
