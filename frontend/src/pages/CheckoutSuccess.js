import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      setLoading(true);
      const data = await orderAPI.verifyPayment(sessionId);
      setOrder(data.order);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to verify payment');
      console.error('Payment verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-4/5 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-xl text-gray-600">Verifying payment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {error ? (
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : order ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h1>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">PDF:</span> {order.pdf.title}
                </p>
                <p>
                  <span className="font-medium">Language:</span> {order.pdf.language}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ${order.amount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {order.status}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/"
                className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutSuccess;

