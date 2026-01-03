import { useEffect, useContext, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { API_BASE_URL } from '../config/api'

export default function PaymentCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dispatch } = useContext(CartContext)
  const { addToast } = useToast()
  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple verifications
    if (hasVerifiedRef.current) {
      return
    }

    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference')
        console.log('Payment Callback - Reference from URL:', reference)
        console.log('All search params:', Object.fromEntries(searchParams))
        
        if (!reference) {
          addToast('No payment reference found', 'error')
          navigate('/cart')
          return
        }

        // Verify payment with backend
        const verifyResponse = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json()
          console.error('Payment verification error:', errorData)
          throw new Error(errorData.error || 'Payment verification failed')
        }

        const verifyData = await verifyResponse.json()
        console.log('Payment verification successful:', verifyData)

        if (verifyData.success) {
          // Clear cart (works for both new orders and duplicate orders)
          dispatch({ type: 'CLEAR_CART' })
          
          // Show success message
          const message = verifyData.isDuplicate 
            ? 'Order already processed. You will receive a confirmation email shortly.' 
            : 'Order placed successfully! You will receive a confirmation email shortly.'
          addToast(message, 'success')
          
          // Mark as verified
          hasVerifiedRef.current = true
          
          // Redirect to order details or dashboard
          setTimeout(() => {
            navigate('/dashboard/orders', { state: { newOrder: verifyData.order } })
          }, 2000)
        } else {
          throw new Error('Payment verification failed')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment verification failed'
        addToast(message, 'error')
        console.error('Payment verification error:', error)
        
        // Mark as verified even on error to prevent retries
        hasVerifiedRef.current = true
        
        // Redirect back to cart after error
        setTimeout(() => {
          navigate('/cart')
        }, 2000)
      }
    }

    verifyPayment()
  }, [searchParams, navigate, dispatch, addToast])

  return (
    <section className="section-padding bg-light">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card border-0 shadow-sm p-5">
              <div className="spinner-border text-primary mb-4" role="status">
                <span className="visually-hidden">Processing...</span>
              </div>
              <h2 className="h4 fw-bold mb-2">Processing Payment</h2>
              <p className="text-medium">Please wait while we verify your payment...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
