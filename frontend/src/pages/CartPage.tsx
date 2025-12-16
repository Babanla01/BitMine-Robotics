import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { MapPin } from 'lucide-react'

interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
}

interface UserAddress {
  id: number
  street_address: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

export default function CartPage() {
  const { state: cartState, dispatch } = useContext(CartContext)
  const { addToast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = Number(subtotal) + Number(deliveryFee)
  const isCartEmpty = cartState.items.length === 0

  // Fetch delivery zones and user profile on component mount
  useEffect(() => {
    fetchDeliveryZones()
    if (isAuthenticated && user?.id) {
      fetchUserProfile()
    }
  }, [isAuthenticated, user?.id])

  const fetchDeliveryZones = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/orders/delivery-zones')
      if (!response.ok) throw new Error('Failed to fetch delivery zones')
      // Zones fetched but not needed for simplified checkout
    } catch (error) {
      console.error('Error fetching delivery zones:', error)
      addToast('Failed to load delivery zones', 'error')
    }
  }

  const fetchUserProfile = async () => {
    if (!user?.id) return
    setProfileLoading(true)
    try {
      const response = await fetch(`http://localhost:5001/api/admin/profile/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setDefaultAddress(data.defaultAddress)
        
        // Set delivery fee based on default address state
        if (data.defaultAddress?.state) {
          await handleStateChange(data.defaultAddress.state)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleStateChange = async (state: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/delivery-fee/${state}`)
      if (!response.ok) throw new Error('Failed to fetch delivery fee')
      const data = await response.json()
      setDeliveryFee(data.delivery_fee)
    } catch (error) {
      console.error('Error fetching delivery fee:', error)
      addToast('Failed to get delivery fee', 'error')
    }
  }

  const handleRemove = (id: number, label: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', id })
    addToast(`${label} removed from cart`, 'info')
  }

  const handleClear = () => {
    dispatch({ type: 'CLEAR_CART' })
    addToast('Cart cleared', 'info')
  }

  const handlePlaceOrder = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (isCartEmpty) {
      addToast('Your cart is empty', 'error')
      return
    }

    if (!isAuthenticated) {
      addToast('Please sign up to complete your order', 'info')
      navigate('/signup')
      return
    }

    if (!userProfile || !defaultAddress) {
      addToast('Please complete your profile to place an order', 'info')
      navigate('/profile')
      return
    }

    setIsLoading(true)
    try {
      // Initialize payment with Paystack
      const orderData = {
        customer_name: userProfile.name,
        customer_email: userProfile.email,
        customer_phone: userProfile.phone,
        street_address: defaultAddress.street_address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postal_code: defaultAddress.postal_code,
        items: cartState.items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.qty,
          price: Number(item.price),
        })),
        subtotal: Number(subtotal),
        delivery_fee: Number(deliveryFee),
        total_amount: Number(total),
      }

      const response = await fetch('http://localhost:5001/api/orders/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initialize payment')
      }

      const paymentData = await response.json()
      
      // Redirect to Paystack payment page
      if (paymentData.authorization_url) {
        sessionStorage.setItem('pendingOrderData', JSON.stringify({
          reference: paymentData.reference,
          userProfile,
          items: cartState.items,
          total: total,
        }))

        window.location.href = paymentData.authorization_url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize payment'
      addToast(message, 'error')
      console.error('Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom">
        <div className="mb-5 text-center">
          <span className="btn bg-primary bg-opacity-10 text-primary fw-semibold px-4 py-2 mb-3 rounded-pill">
            Your Cart
          </span>
          <h1 className="h-xl fw-bold text-dark concertOne">Review & Checkout</h1>
          <p className="text-medium max-w-48rem mx-auto">
            Review your robotics kits and confirm your delivery details to finalize your order.
          </p>
        </div>

        <div className="row g-4">
          {/* Left Column - Cart Items & Delivery Info */}
          <div className="col-12 col-lg-8">
            {/* Cart Items */}
            <div className="card border-0 shadow-sm p-4 mb-4">
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
                        <button
                          className="btn btn-sm btn-light border qty-btn"
                          onClick={() => dispatch({ type: 'ADJUST_QTY', id: item.id, qty: item.qty - 1 })}
                          disabled={item.qty <= 1}
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          className="btn btn-sm btn-light border qty-btn"
                          onClick={() => dispatch({ type: 'ADJUST_QTY', id: item.id, qty: item.qty + 1 })}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="btn btn-link text-danger fs-5 px-2"
                      onClick={() => handleRemove(item.id, item.name)}
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Contact & Delivery Info */}
            {!isCartEmpty && (
              <div className="card border-0 shadow-sm p-4 mb-4">
                <h2 className="h4 fw-bold mb-4">Delivery Information</h2>
                
                {profileLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : userProfile && defaultAddress ? (
                  <>
                    {/* Contact Info - Read Only */}
                    <div className="mb-4">
                      <h5 className="fw-semibold mb-3">Contact Information</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Full Name</label>
                          <p className="fw-semibold mb-0">{userProfile.name}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Email</label>
                          <p className="fw-semibold mb-0">{userProfile.email}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Phone</label>
                          <p className="fw-semibold mb-0">{userProfile.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address - Read Only */}
                    <div>
                      <h5 className="fw-semibold mb-3">
                        <MapPin size={18} className="me-2" style={{ display: 'inline' }} />
                        Delivery Address
                      </h5>
                      <div className="bg-light p-3 rounded mb-3">
                        <p className="mb-1">
                          <strong>{defaultAddress.street_address}</strong>
                        </p>
                        <p className="mb-0">
                          {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
                        </p>
                      </div>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate('/profile')}
                      >
                        Change Address
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-warning">
                    <p className="mb-2">Please complete your profile to checkout.</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/profile')}
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h3 className="h5 fw-semibold mb-3">Order Summary</h3>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-medium">Items ({cartState.items.reduce((total, item) => total + item.qty, 0)})</span>
                <span className="fw-semibold">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-medium">Delivery Fee</span>
                <span className="fw-semibold">{deliveryFee === 0 ? 'N/A' : `₦${deliveryFee.toLocaleString()}`}</span>
              </div>

              <div className="border-top pt-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold h5">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                className="btn btn-outline-secondary w-100 mb-3"
                onClick={handleClear}
                disabled={isCartEmpty}
              >
                Clear Cart
              </button>

              <button
                onClick={handlePlaceOrder}
                className="btn btn-primary w-100"
                disabled={isCartEmpty || isLoading || !defaultAddress || profileLoading}
              >
                {isLoading ? 'Processing...' : `Pay ₦${total.toLocaleString()}`}
              </button>

              {!isAuthenticated && !isCartEmpty && (
                <p className="text-info small mt-2">
                  Sign up to proceed with checkout
                </p>
              )}
            </div>

            <div className="card border-0 shadow-sm p-4 bg-light">
              <h3 className="h5 fw-semibold mb-3">Payment Info</h3>
              <p className="small text-medium mb-2">
                <strong>Secure Payment:</strong> We accept payments via Paystack
              </p>
              <p className="small text-medium mb-0">
                Your order will be confirmed once payment is verified. You'll receive a confirmation email immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
