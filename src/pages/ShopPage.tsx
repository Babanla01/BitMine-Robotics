import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../index.css';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  categories: string[];
  ageGroup: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Arduino Starter Kit',
    image: '/assets/serviceShop-2.png',
    price: 50000,
    rating: 4.8,
    reviews: 24,
    description: 'A beginner-friendly kit that includes all the basic components needed to start building robotics projects.',
    skillLevel: 'Beginner',
    categories: ['Robotics Kits'],
    ageGroup: 'Kids',
  },
  { // Robotics Kits
    id: 2,
    name: 'Arduino Starter Kit',
    image: '/assets/serviceShop-2.png',
    price: 50000,
    rating: 4.8,
    reviews: 24,
    description: 'A beginner-friendly kit that includes all the basic components needed to start building robotics projects.',
    skillLevel: 'Beginner',
    categories: ['Robotics Kits'],
    ageGroup: 'Kids',
  },
  {
    id: 3,
    name: 'Arduino Starter Kit',
    image: '/assets/serviceShop-2.png',
    price: 50000,
    rating: 4.8,
    reviews: 24,
    description: 'A beginner-friendly kit that includes all the basic components needed to start building robotics projects.',
    skillLevel: 'Beginner',
    categories: ['Robotics Kits'],
    ageGroup: 'Kids',
  },
  {
    id: 4,
    name: 'Arduino Starter Kit',
    image: '/assets/serviceShop-2.png',
    price: 50000,
    rating: 4.8,
    reviews: 24,
    description: 'A beginner-friendly kit that includes all the basic components needed to start building robotics projects.',
    skillLevel: 'Beginner',
    categories: ['Robotics Kits'],
    ageGroup: 'Kids',
  },
  {
    id: 5,
    name: 'Arduino Starter Kit',
    image: '/assets/serviceShop-2.png',
    price: 50000,
    rating: 4.8,
    reviews: 24,
    description: 'A beginner-friendly kit that includes all the basic components needed to start building robotics projects.',
    skillLevel: 'Beginner',
    categories: ['Robotics Kits'],
    ageGroup: 'Kids',
  },
  // ...REPEAT/MORE MOCK DATA as needed...
];

const categories = ['All', 'Robotics Kits', 'Coding Books', 'Accessories'];
const ageGroups = ['Kids', 'Teens', 'Adults'];
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ShopPage() {
  // Cart state
  const { state: cartState, dispatch } = useContext(CartContext);
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [price, setPrice] = useState<[number, number]>([10000, 99999]);

  // FILTER LOGIC
  const products = MOCK_PRODUCTS.filter(p => {
    const categoryMatch = selectedCategory === 'All' || p.categories.includes(selectedCategory);
    const ageMatch = selectedAges.length === 0 || selectedAges.includes(p.ageGroup);
    const skillMatch = selectedSkill === 'All' || selectedSkill === p.skillLevel;
    const priceMatch = p.price >= price[0] && p.price <= price[1];
    return categoryMatch && ageMatch && skillMatch && priceMatch;
  });

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="row gx-5">
          {/* --- Sidebar --- */}
          <aside className="col-12 col-md-3 mb-5 mb-md-0">
            <div className="card px-4 py-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-medium">Filters</span>
                <button className="btn btn-link btn-sm text-danger px-0" onClick={() => {
                  setSelectedCategory('All');
                  setSelectedAges([]);
                  setSelectedSkill('All');
                  setPrice([10000,99999]);
                }}>Clear all</button>
              </div>
              {/* Category Filter */}
              <div className="mb-3">
                <label className="fw-bold">Categories</label>
                <ul className="list-unstyled ms-1">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button className={`btn btn-link p-0 d-block ${selectedCategory === cat ? 'fw-bold text-primary' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Age Group Filter */}
              <div className="mb-3">
                <div className="fw-bold">Age Group</div>
                {ageGroups.map(age => (
                  <div className="form-check" key={age}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedAges.includes(age)}
                      onChange={() => {
                        setSelectedAges(arr => arr.includes(age) ? arr.filter(a => a !== age) : [...arr, age]);
                      }}
                      id={age}
                    />
                    <label className="form-check-label" htmlFor={age}>{age}</label>
                  </div>
                ))}
              </div>
              {/* Skill Level Filter */}
              <div className="mb-3">
                <div className="fw-bold">Skill Level</div>
                {skillLevels.map(skill => (
                  <div className="form-check" key={skill}>
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={selectedSkill === skill}
                      onChange={() => setSelectedSkill(skill)}
                      id={skill}
                    />
                    <label className="form-check-label" htmlFor={skill}>{skill}</label>
                  </div>
                ))}
              </div>
              {/* Price Filter */}
              <div>
                <div className="fw-bold">Price</div>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <input type="number" min={10000} max={99999} className="form-control form-control-sm w-50" value={price[0]} onChange={e => setPrice([+e.target.value, price[1]])} placeholder="Min Price" title="Minimum Price" />
                  <span>-</span>
                  <input type="number" min={10000} max={99999} className="form-control form-control-sm w-50" value={price[1]} onChange={e => setPrice([price[0], +e.target.value])} placeholder="Max Price" title="Maximum Price" />
                </div>
              </div>
            </div>
          </aside>

          {/* --- Product Grid--- */}
          <main className="col-12 col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="fs-5 fw-semibold">Featured Product Banner</span>
                <div className="text-medium">Lorem ipsum dolor sit amet.</div>
              </div>
              <div>
                <select className="form-select" title="Sort products">
                  <option>Sort by</option>
                </select>
              </div>
            </div>
            {/* Product Grid */}
            <div className="row g-4">
              {products.map(product => {
                const inCart = cartState.items.some(item => item.id === product.id);
                return (
                  <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={product.id}>
                    <div className="card h-100 d-flex flex-column">
                      <img src={product.image} alt={product.name} className="rounded mb-2 w-100 shop-product-image" />
                      <div className="fw-bold mb-1">{product.name}</div>
                      <div className="text-small text-truncate mb-1" title={product.description}>{product.description}</div>
                      <div className="mb-2">
                        <span className="fw-semibold">₦{product.price.toLocaleString()}</span>
                      </div>
                      <div className="mb-3">
                        <span className="text-warning">{Array(Math.round(product.rating)).fill("★").join("")}</span>
                        <span className="text-medium ms-2">({product.reviews})</span>
                      </div>
                    <div className="d-flex mt-auto">
                      <button
                        className={`btn btn-primary flex-grow-1${inCart ? ' disabled' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'ADD_TO_CART', product })
                          addToast(`${product.name} added to cart`, 'success')
                        }}
                        disabled={inCart}
                      >
                        {inCart ? 'In Cart' : 'Add to Cart'}
                      </button>
                    </div>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <div className="text-center py-5 w-100">No products found</div>
              )}
            </div>
            {/* Pagination UI (static) */}
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                <li className="page-item disabled"><button className="page-link">&lt;</button></li>
                <li className="page-item active"><button className="page-link">1</button></li>
                <li className="page-item"><button className="page-link">2</button></li>
                <li className="page-item disabled"><button className="page-link">...</button></li>
                <li className="page-item"><button className="page-link">10</button></li>
                <li className="page-item"><button className="page-link">&gt;</button></li>
              </ul>
            </nav>
          </main>
        </div>
      </div>
    </div>
  );
}


