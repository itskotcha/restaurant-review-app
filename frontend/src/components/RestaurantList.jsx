import { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { getRestaurants } from '../services/api';

// simple debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function RestaurantList({ onSelectRestaurant }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minRating: '',
    priceRange: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300); // wait 300ms after typing

  // update search filter when debounced search term changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // fetch restaurants whenever filters change
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getRestaurants(filters);
        setRestaurants(result.data);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters]);

  // handle search input change
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // handle filter panel changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="restaurant-list-container">
      <SearchBar onSearch={handleSearch} />
      <FilterPanel onFilterChange={handleFilterChange} filters={filters} />

      {loading && <div className="loading">กำลังโหลด...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          {restaurants.length === 0 ? (
            <p className="no-results">
              ไม่พบร้านอาหารที่ค้นหา ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ
            </p>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={onSelectRestaurant}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RestaurantList;
