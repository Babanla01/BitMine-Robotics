import { useContext, useState, FormEvent } from 'react'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { state: cartState, dispatch } = useContext(CartContext)
  const { addToast } = useToast()
  const { isAuthenticated } = useAuth()
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = cartState.items.length > 0 ? 5000 : 0
  const total = subtotal + shipping
  const isCartEmpty = cartState.items.length === 0
  const checkoutDisabled = isCartEmpty || !isAuthenticated

  const handleRemove = (id: number, label: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', id })
    addToast(`${label} removed from cart`, 'info')
  }

  const handleClear = () => {
    dispatch({ type: 'CLEAR_CART' })
    addToast('Cart cleared', 'info')
  }

  const handleCheckoutSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated) {
      addToast('Please sign in to place an order.', 'error')
      return
    }
    if (!checkoutForm.name || !checkoutForm.email) {
      addToast('Please provide your name and email', 'error')
      return
    }
    addToast('Checkout request received! We will reach out shortly.', 'success')
    setCheckoutForm({ name: '', email: '', phone: '', notes: '' })
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom">
        <div className="mb-5 text-center">
          <span className="btn bg-primary bg-opacity-10 text-primary fw-semibold px-4 py-2 mb-3 rounded-pill">Your Cart</span>
          <h1 className="h-xl fw-bold text-dark concertOne">Review & Checkout</h1>
          <p className="text-medium max-w-48rem mx-auto">Confirm your robotics kits, update quantities, and share delivery details to finalize your order.</p>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold mb-4">Items</h2>
              {isCartEmpty ? (
                <div className="text-center text-medium py-5">Your cart is empty.</div>
              ) : (
                cartState.items.map(item => (
                  <div className="d-flex align-items-center mb-4 border-bottom pb-3" key={item.id}>
                    <img src={item.image} alt={item.name} className="cart-item-image me-3 flex-shrink-0" />
                    <div className="flex-grow-1">
                      <div className="fw-bold mb-1">{item.name}</div>
                      <div className="mb-1 text-medium cart-item-price">₦{item.price.toLocaleString()}</div>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-sm btn-light border qty-btn" onClick={() => dispatch({ type: 'ADJUST_QTY', id: item.id, qty: item.qty - 1 })} disabled={item.qty <= 1}>-</button>
                        <span>{item.qty}</span>
                        <button className="btn btn-sm btn-light border qty-btn" onClick={() => dispatch({ type: 'ADJUST_QTY', id: item.id, qty: item.qty + 1 })}>+</button>
                      </div>
                    </div>
                    <button className="btn btn-link text-danger fs-5 px-2" onClick={() => handleRemove(item.id, item.name)} aria-label={`Remove ${item.name}`}>&times;</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h3 className="h5 fw-semibold mb-3">Order Summary</h3>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-medium">Items</span>
                <span>{cartState.items.reduce((total, item) => total + item.qty, 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-medium">Subtotal</span>
                <span className="fw-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-medium">Logistics</span>
                <span className="fw-semibold">{shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold">₦{total.toLocaleString()}</span>
              </div>
              <button className="btn btn-outline-secondary w-100 mb-2" onClick={handleClear} disabled={isCartEmpty}>Clear Cart</button>
            </div>

            <div className="card border-0 shadow-sm p-4 mini-checkout">
              <h3 className="h5 fw-semibold mb-1">Quick Checkout</h3>
              <p className="text-medium small mb-3">Share your contact info and we’ll reach out to confirm delivery.</p>
              <form onSubmit={handleCheckoutSubmit} className="mini-checkout-form">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Ada Lovelace"
                  value={checkoutForm.name}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="hello@bitmine.com"
                  value={checkoutForm.email}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control mb-3"
                  placeholder="+234 800 000 0000"
                  value={checkoutForm.phone}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control mb-3"
                  rows={3}
                  placeholder="Preferred delivery timeline..."
                  value={checkoutForm.notes}
                  onChange={e => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))}
                ></textarea>
                <button type="submit" className="btn btn-primary w-100" disabled={isCartEmpty}>
                  Place Order
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

