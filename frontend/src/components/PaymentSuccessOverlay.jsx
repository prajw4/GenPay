import React from 'react'
import '../styles/paymentSuccess.css'

const PaymentSuccessOverlay = ({ visible, message = 'Money Sent Successfully' }) => {
  if (!visible) return null

  return (
    <div className="ps-overlay">
      <div className="ps-content">
        <svg className="ps-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <g className="ps-anim">
            <circle className="ps-circle" cx="60" cy="60" r="38" fill="none" strokeWidth="6" />
            <path
              className="ps-check"
              d="M44 62 L56 74 L78 50"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
        <div className="ps-text">{message}</div>
      </div>
    </div>
  )
}

export default PaymentSuccessOverlay
