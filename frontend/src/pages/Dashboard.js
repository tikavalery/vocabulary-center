import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, orderAPI } from '../utils/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data.user);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (pdfId, title) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to download PDFs');
        return;
      }

      // Get download URL from backend (which will proxy the PDF)
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${API_URL}/download/${pdfId}`;
      
      // Fetch the PDF with authentication header
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download PDF. Please try again.');
      console.error('Download error:', err);
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

  return (
    <div className="w-4/5 max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">My Purchased PDFs</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't purchased any PDFs yet.</p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse PDFs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const pdf = order.pdfId;
              if (!pdf) return null;

              return (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={pdf.coverImageUrl}
                    alt={pdf.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{pdf.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{pdf.language}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Purchased: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDownload(pdf._id, pdf.title)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

