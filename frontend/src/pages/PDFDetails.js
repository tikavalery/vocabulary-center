import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { pdfAPI, orderAPI } from '../utils/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

const PDFDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPDF();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { authAPI } = require('../utils/api');
        const data = await authAPI.getCurrentUser();
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
    }
  };

  const fetchPDF = async () => {
    try {
      setLoading(true);
      const data = await pdfAPI.getById(id);
      setPdf(data.pdf);
      setError(null);
    } catch (err) {
      setError('Failed to load PDF details');
      console.error('Error fetching PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/pdf/${id}` } });
      return;
    }

    try {
      setProcessing(true);
      const data = await orderAPI.createCheckoutSession(id);
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        setError(error.message);
        setProcessing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate checkout');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-4/5 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !pdf) {
    return (
      <div className="w-4/5 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl text-red-600">{error}</div>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return null;
  }

  return (
    <div className="w-4/5 max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={pdf.coverImageUrl}
              alt={pdf.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold mb-4">{pdf.title}</h1>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {pdf.language}
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-6">
              ${pdf.price.toFixed(2)}
            </p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{pdf.description}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={processing}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {processing ? 'Processing...' : 'Buy Now'}
            </button>

            {!user && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                Please{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  login
                </Link>{' '}
                or{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  sign up
                </Link>{' '}
                to purchase so we can send the PDF to your account
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFDetails;

