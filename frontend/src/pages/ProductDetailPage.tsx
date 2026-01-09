import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, ShoppingCart, Star, Truck, RotateCcw } from 'lucide-react';
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
  created_at?: string;
  updated_at?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: cartState, dispatch } = useContext(CartContext);
  const { addToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch specific product
        const data = await apiCall(`${API_BASE_URL}/products/${id}`);
        let productData = Array.isArray(data) ? data[0] : data;
        
        if (!productData) {
          setError('Product not found');
          return;
        }

        // Handle image URL
        let imageUrl = productData.image_url;
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '');
          imageUrl = `${apiRoot}${imageUrl}`;
        }

        productData = {
          ...productData,
          image_url: imageUrl,
        };

        setProduct(productData);

        // Fetch related products from same category
        try {
          const allProducts = await apiCall(API.products);
          const productsArray = Array.isArray(allProducts) ? allProducts : allProducts.data || [];
          
          const related = productsArray
            .filter((p: Product) => p.category === productData.category && p.id !== productData.id)
            .slice(0, 4)
            .map((p: Product) => {
              let url = p.image_url;
              if (url && url.startsWith('/uploads/')) {
                const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '');
                url = `${apiRoot}${url}`;
              }
              return { ...p, image_url: url };
            });
          
          setRelatedProducts(related);
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = (prod?: Product) => {
    const cartProduct = prod || product;
    if (!cartProduct) return;

    if (cartProduct.stock <= 0) {
      addToast('Product out of stock', 'error');
      return;
    }

    const existingItem = cartState.items.find(item => item.id === cartProduct.id);
    
    // First add the product to cart
    dispatch({
      type: 'ADD_TO_CART',
      product: {
        id: cartProduct.id,
        name: cartProduct.name,
        price: cartProduct.price,
        image: cartProduct.image_url,
        rating: cartProduct.rating || 0,
        reviews: cartProduct.reviews || 0,
        description: cartProduct.description,
        skillLevel: cartProduct.skill_level,
        categories: [cartProduct.category],
        ageGroup: cartProduct.age_group,
      },
    });

    // Then adjust quantity if needed (for product detail page, quantity > 1)
    if (!prod && quantity > 1) {
      const newQty = (existingItem?.qty || 1) + quantity - 1;
      dispatch({
        type: 'ADJUST_QTY',
        id: cartProduct.id,
        qty: newQty,
      });
    }

    addToast(`${cartProduct.name} added to cart!`, 'success');
  };

  const inCart = product ? cartState.items.some(item => item.id === product.id) : false;

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center gap-3">
            <div>
              <h4 className="alert-heading">Error</h4>
              <p className="mb-0">{error || 'Product not found'}</p>
            </div>
          </div>
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/shop')}
        >
          <ChevronLeft size={18} className="me-2" />
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page py-4">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ backgroundColor: 'transparent', padding: '0.5rem 0' }}>
            <li className="breadcrumb-item" style={{ fontSize: '0.9rem' }}>
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item" style={{ fontSize: '0.9rem' }}>
              <Link to="/shop" className="text-decoration-none">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ fontSize: '0.9rem' }}>
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <button 
          className="btn btn-link btn-sm text-dark p-0 mb-4"
          onClick={() => navigate('/shop')}
          style={{ textDecoration: 'none', fontWeight: '500' }}
        >
          <ChevronLeft size={18} className="me-1" style={{ marginTop: '-2px' }} />
          Back to Shop
        </button>

        {/* Product Details */}
        <div className="row g-4 mb-5">
          {/* Product Image */}
          <div className="col-12 col-md-5">
            <div className="product-detail-image-wrapper" style={{ 
              backgroundColor: '#f8f9fa',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              aspectRatio: '4/5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <img 
                src={product.image_url} 
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e9ecef" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23666" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="col-12 col-md-7">
            <div className="product-detail-info">
              {/* Category Badge */}
              <span className="badge bg-primary bg-opacity-10 text-primary mb-3" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}>
                {product.category}
              </span>

              {/* Title */}
              <h1 className="h2 fw-bold mb-2" style={{ lineHeight: '1.3' }}>{product.name}</h1>

              {/* Rating */}
              {product.rating && (
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.rating!) ? 'text-warning' : 'text-secondary'}
                        style={{ fill: i < Math.floor(product.rating!) ? '#ffc107' : 'none' }}
                      />
                    ))}
                  </div>
                  <span className="text-medium" style={{ fontSize: '0.95rem' }}>
                    {product.rating.toFixed(1)} ({product.reviews || 0} {product.reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4 pb-3">
                <span className="fw-bold" style={{ fontSize: '2rem', color: '#2c3e50' }}>
                  ₦{product.price.toLocaleString()}
                </span>
                {product.stock > 0 && (
                  <span className="text-success ms-3" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                    ✓ In Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-4 pb-4 border-bottom">
                <h5 className="fw-semibold mb-2" style={{ fontSize: '1rem' }}>About this product</h5>
                <p className="text-medium mb-0" style={{ lineHeight: '1.7', fontSize: '0.95rem', color: '#555' }}>
                  {product.description}
                </p>
              </div>

              {/* Product Details Grid */}
              <div className="mb-4 pb-4 border-bottom">
                <h5 className="fw-semibold mb-3" style={{ fontSize: '1rem' }}>Specifications</h5>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <span className="text-medium d-block" style={{ fontSize: '0.85rem' }}>Skill Level</span>
                      <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>{product.skill_level}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <span className="text-medium d-block" style={{ fontSize: '0.85rem' }}>Age Group</span>
                      <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>{product.age_group}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <span className="text-medium d-block" style={{ fontSize: '0.85rem' }}>Category</span>
                      <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>{product.category}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <span className="text-medium d-block" style={{ fontSize: '0.85rem' }}>Stock Available</span>
                      <span className={`fw-semibold ${product.stock <= 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.95rem' }}>
                        {product.stock > 0 ? product.stock : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="mb-4">
                <label className="fw-semibold mb-3 d-block" style={{ fontSize: '0.95rem' }}>Quantity:</label>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{ width: '40px', height: '40px', padding: '0' }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={product.stock <= 0}
                    style={{ width: '70px', textAlign: 'center', fontWeight: '600' }}
                    title="Select quantity"
                  />
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{ width: '40px', height: '40px', padding: '0' }}
                  >
                    +
                  </button>
                  <span className="text-medium ms-2" style={{ fontSize: '0.9rem' }}>
                    {product.stock} available
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 mb-2"
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      handleAddToCart();
                    }
                  }}
                  disabled={inCart || product.stock <= 0}
                  style={{ 
                    fontWeight: '600',
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <ShoppingCart size={20} className="me-2" />
                  {inCart ? 'Already in Cart' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                {inCart && (
                  <Link to="/cart" className="btn btn-outline-primary btn-lg w-100">
                    Go to Cart
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="row g-2 mt-5 pt-4 border-top">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2 p-3 rounded" style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }}>
                    <Truck size={20} className="text-primary" style={{ flexShrink: 0 }} />
                    <div>
                      <div className="fw-semibold">Fast Delivery</div>
                      <div className="text-medium" style={{ fontSize: '0.8rem' }}>Quick shipping</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2 p-3 rounded" style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }}>
                    <RotateCcw size={20} className="text-primary" style={{ flexShrink: 0 }} />
                    <div>
                      <div className="fw-semibold">Easy Returns</div>
                      <div className="text-medium" style={{ fontSize: '0.8rem' }}>30-day guarantee</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products section py-5 border-top">
            <h3 className="h4 fw-bold mb-4" style={{ paddingTop: '1rem' }}>You might also like</h3>
            <div className="row g-3">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="col-12 col-sm-6 col-lg-3">
                  <Link 
                    to={`/product/${relatedProduct.id}`}
                    className="product-card-modern text-decoration-none h-100"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = 'translateY(-4px)';
                      el.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div className="product-image-wrapper" style={{ overflow: 'hidden', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                      <img 
                        src={relatedProduct.image_url} 
                        alt={relatedProduct.name}
                        className="product-image"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="180"%3E%3Crect fill="%23e9ecef" width="180" height="180"/%3E%3Ctext x="50%25" y="50%25" font-size="12" fill="%23666" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="product-content p-3">
                      <div className="product-category mb-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '0.75rem' }}>
                          {relatedProduct.category}
                        </span>
                      </div>
                      <h5 className="product-title mb-2" style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.3' }}>{relatedProduct.name}</h5>
                      <p className="product-description text-medium mb-2" style={{ fontSize: '0.85rem', lineHeight: '1.4', color: '#666' }}>
                        {relatedProduct.description.substring(0, 50)}...
                      </p>
                      <div className="product-footer d-flex justify-content-between align-items-center">
                        <div className="product-price">
                          <span className="fw-bold text-dark">₦{relatedProduct.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
