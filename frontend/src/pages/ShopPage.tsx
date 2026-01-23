import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Filter, Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { API, apiCall, API_BASE_URL } from '../config/api';
import '../index.css';

interface Product {
  id: number;
  name: string;
  image_url: string;
  price: number;
  description: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  age_group: string;
  stock: number;
  rating?: number;
  reviews?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  subcategories?: any[];
  created_at: string;
  updated_at: string;
}

const ageGroups = ['Kids', 'Teens', 'Adults'];
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Fisher-Yates shuffle algorithm
const shuffleArray = <T extends Product>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ShopPage() {
  const { state: cartState, dispatch } = useContext(CartContext);
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [price, setPrice] = useState<[number, number]>([0, 999999]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // 5 columns × 3 rows
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch first page with 100 items to start with
        const data = await apiCall(`${API.products}?page=1&limit=100`);
        
        // Debug: log the response to see structure
        console.log('ShopPage API Response:', data);
        
        // Handle both array and paginated response formats
        let productsArray: Product[] = [];
        let totalCount = 0;
        
        if (Array.isArray(data)) {
          // If it's directly an array
          productsArray = data;
          totalCount = data.length;
        } else if (data?.data && Array.isArray(data.data)) {
          // If data is wrapped in .data property
          productsArray = data.data;
          totalCount = data.pagination?.total || data.data.length;
        } else if (Array.isArray(data)) {
          productsArray = data;
          totalCount = data.length;
        }
        
        console.log('Products array:', productsArray);
        console.log('Total count:', totalCount);
        
        // Convert relative URLs to absolute URLs
        const productsWithAbsoluteUrls = productsArray.map((product: any) => {
          let imageUrl = product.image_url;
          
          if (imageUrl) {
            if (imageUrl.startsWith('/uploads/')) {
              const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '')
              imageUrl = `${apiRoot}${imageUrl}`;
            } else if (imageUrl.startsWith('/assets/') || !imageUrl.startsWith('http')) {
              imageUrl = imageUrl;
            }
          }
          
          return {
            ...product,
            image_url: imageUrl,
          } as Product;
        });
        
        // Shuffle products for better variety
        const shuffledProducts = shuffleArray(productsWithAbsoluteUrls);
        console.log('Shuffled products:', shuffledProducts.length);
        
        setProducts(shuffledProducts);
        setTotalProducts(totalCount);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        addToast('Failed to load products', 'error');
      }
    };
    fetchProducts();
  }, [addToast]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiCall(`${API_BASE_URL}/categories`);
        const categoryArray = Array.isArray(data) ? data : [];
        // Extract just the category names and prepend 'All'
        const categoryNames = categoryArray.map((cat: Category) => cat.name);
        setCategories(['All', ...categoryNames]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Keep the default if fetch fails
        setCategories(['All']);
      }
    };
    fetchCategories();
  }, []);

  // FILTER LOGIC
  let filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const ageMatch = selectedAges.length === 0 || selectedAges.includes(p.age_group);
    const skillMatch = selectedSkill === 'All' || selectedSkill === p.skill_level;
    const priceMatch = p.price >= price[0] && p.price <= price[1];
    const searchMatch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && ageMatch && skillMatch && priceMatch && searchMatch;
  });

  // SORT LOGIC
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedAges([]);
    setSelectedSkill('All');
    setPrice([0, 999999]);
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('Product out of stock', 'error');
      return;
    }
    dispatch({
      type: 'ADD_TO_CART',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        description: product.description,
        skillLevel: product.skill_level,
        categories: [product.category],
        ageGroup: product.age_group,
      },
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    selectedAges.length +
    (selectedSkill !== 'All' ? 1 : 0) +
    (price[0] !== 10000 || price[1] !== 999999 ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0);

  return (
    <div className="shop-page-modern">
      <div className="container-custom">
        {/* Header Section */}
        <div className="shop-header mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div>
              <h1 className="h-xl fw-bold text-dark mb-2 concertOne">Shop Robotics Kits</h1>
              <p className="text-medium mb-0">Discover our collection of educational robotics kits and accessories</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <button 
                className="btn btn-outline-primary d-md-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} className="me-2" />
                Filters {activeFiltersCount > 0 && <span className="badge bg-primary ms-2">{activeFiltersCount}</span>}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="shop-search-wrapper mb-4">
            <div className="position-relative">
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-medium" size={20} style={{ zIndex: 10 }} />
              <input
                type="text"
                className="form-control form-control-lg ps-5"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results & Sort */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="text-medium">
              Showing <span className="fw-semibold text-dark">{paginatedProducts.length}</span> of <span className="fw-semibold text-dark">{filteredProducts.length}</span> products {filteredProducts.length !== products.length && `(filtered from ${products.length} total)`}
            </div>
            <div className="d-flex gap-2 align-items-center">
              <label className="text-medium mb-0 me-2">Sort:</label>
              <select 
                className="form-select form-select-sm shop-sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                title="Sort products"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <aside className={`col-12 col-md-3 ${showFilters ? 'd-block' : 'd-none d-md-block'}`}>
            <div className="shop-filters-card">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h3 className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
                  <Filter size={20} />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <button 
                    className="btn btn-link btn-sm text-danger p-0 fw-semibold"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="filter-section mb-4">
                <label className="fw-semibold mb-3 d-block">Category</label>
                <div className="filter-options">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group Filter */}
              <div className="filter-section mb-4">
                <label className="fw-semibold mb-3 d-block">Age Group</label>
                <div className="filter-checkboxes">
                  {ageGroups.map(age => (
                    <div className="form-check mb-2" key={age}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedAges.includes(age)}
                        onChange={() => {
                          setSelectedAges(arr => 
                            arr.includes(age) ? arr.filter(a => a !== age) : [...arr, age]
                          );
                        }}
                        id={`age-${age}`}
                      />
                      <label className="form-check-label" htmlFor={`age-${age}`}>
                        {age}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Level Filter */}
              <div className="filter-section mb-4">
                <label className="fw-semibold mb-3 d-block">Skill Level</label>
                <div className="filter-checkboxes">
                  {skillLevels.map(skill => (
                    <div className="form-check mb-2" key={skill}>
                      <input
                        type="radio"
                        className="form-check-input"
                        checked={selectedSkill === skill}
                        onChange={() => setSelectedSkill(skill)}
                        name="skillLevel"
                        id={`skill-${skill}`}
                      />
                      <label className="form-check-label" htmlFor={`skill-${skill}`}>
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-section">
                <label className="fw-semibold mb-3 d-block">Price Range</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    className="form-control form-control-sm"
                    value={price[0]}
                    onChange={e => setPrice([+e.target.value || 0, price[1]])}
                    placeholder="Min"
                  />
                  <span className="text-medium">-</span>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    className="form-control form-control-sm"
                    value={price[1]}
                    onChange={e => setPrice([price[0], +e.target.value || 999999])}
                    placeholder="Max"
                  />
                </div>
                <div className="text-small text-medium mt-2">
                  ₦{price[0].toLocaleString()} - ₦{price[1].toLocaleString()}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="col-12 col-md-9">
            {filteredProducts.length === 0 ? (
              <div className="shop-empty-state text-center py-5">
                <div className="mb-3">
                  <Search size={48} className="text-medium" />
                </div>
                <h3 className="h5 fw-semibold mb-2">No products found</h3>
                <p className="text-medium mb-4">Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {paginatedProducts.map(product => {
                    const inCart = cartState.items.some(item => item.id === product.id);
                    return (
                      <div className="col-12 col-sm-6 col-md-4 col-lg-5col" key={product.id}>
                        <Link 
                          to={`/product/${product.id}`}
                          className="product-card-modern text-decoration-none"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="product-image-wrapper" style={{ overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="product-image"
                              style={{
                                width: '100%',
                                height: '180px',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block',
                              }}
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="180"%3E%3Crect fill="%23e9ecef" width="180" height="180"/%3E%3Ctext x="50%25" y="50%25" font-size="12" fill="%23666" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            {inCart && (
                              <div className="product-badge in-cart">
                                <ShoppingCart size={16} />
                                In Cart
                              </div>
                            )}
                            <div className="product-overlay">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAddToCart(product);
                                }}
                                disabled={inCart || product.stock <= 0}
                              >
                                {inCart ? (
                                  <>
                                    <ShoppingCart size={16} className="me-1" />
                                    In Cart
                                  </>
                                ) : product.stock <= 0 ? (
                                  <>Out of Stock</>
                                ) : (
                                  <>
                                    <ShoppingCart size={16} className="me-1" />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="product-content">
                            <div className="product-category mb-2">
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {product.category}
                              </span>
                            </div>
                            <h3 className="product-title mb-2">{product.name}</h3>
                            <p className="product-description text-medium mb-3">
                              {product.description}
                            </p>
                            <div className="product-footer d-flex justify-content-between align-items-center">
                              <div className="product-price">
                                <span className="fw-bold fs-5 text-dark">₦{product.price.toLocaleString()}</span>
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAddToCart(product);
                                }}
                                disabled={inCart || product.stock <= 0}
                              >
                                {inCart ? 'In Cart' : product.stock <= 0 ? 'Out of Stock' : 'Add'}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {products.length < totalProducts && (
                  <div className="text-center mt-4 mb-5">
                    <button 
                      className="btn btn-outline-primary btn-lg"
                      onClick={async () => {
                        setIsLoadingMore(true);
                        try {
                          const nextPage = currentPage + 1;
                          const data = await apiCall(`${API.products}?page=${nextPage}&limit=100`);
                          const productsArray = Array.isArray(data) ? data : data.data || [];
                          const productsWithAbsoluteUrls = productsArray.map((product: Product) => {
                            let imageUrl = product.image_url;
                            if (imageUrl) {
                              if (imageUrl.startsWith('/uploads/')) {
                                const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '')
                                imageUrl = `${apiRoot}${imageUrl}`;
                              }
                            }
                            return { ...product, image_url: imageUrl };
                          });
                          const shuffledNewProducts = shuffleArray(productsWithAbsoluteUrls);
                          setProducts([...products, ...shuffledNewProducts]);
                          setCurrentPage(nextPage);
                        } catch (error) {
                          addToast('Failed to load more products', 'error');
                        } finally {
                          setIsLoadingMore(false);
                        }
                      }}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'Loading...' : `Load More (${products.length}/${totalProducts})`}
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="shop-pagination mt-5">
                    <ul className="pagination justify-content-center mb-0">
                      <li className="page-item" style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          title="Previous page"
                        >
                          <ChevronLeft size={18} />
                          <span className="visually-hidden">Previous</span>
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      {/* Show ellipsis if needed */}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      
                      {/* Last page */}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item">
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      )}
                      
                      <li className="page-item" style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          title="Next page"
                        >
                          <ChevronRight size={18} />
                          <span className="visually-hidden">Next</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
