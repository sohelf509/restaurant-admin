// src/components/Orders.jsx
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axios from 'axios';

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statuses = ['All', 'pending', 'preparing', 'served', 'completed', 'out-for-delivery', 'delivered'];
  const orderTypes = ['All', 'dine-in', 'home-delivery'];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get valid statuses based on order type
  const getValidStatuses = (orderType) => {
    if (orderType === 'home-delivery') {
      return ['pending', 'preparing', 'out-for-delivery', 'delivered'];
    }
    return ['pending', 'preparing', 'served', 'completed'];
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? response.data.data : order
        ));
        alert('Order status updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
      console.error('Error updating order:', err);
    } finally {
      setUpdating(null);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Order deleted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = selectedStatus === 'All' || order.status === selectedStatus;
    const typeMatch = selectedType === 'All' || order.orderType === selectedType;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      served: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      'out-for-delivery': 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      preparing: '👨‍🍳',
      served: '✅',
      completed: '🎉',
      'out-for-delivery': '🚗',
      delivered: '✅',
    };
    return icons[status] || '📦';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      preparing: 'Preparing',
      served: 'Served',
      completed: 'Completed',
      'out-for-delivery': 'Out for Delivery',
      delivered: 'Delivered',
    };
    return labels[status] || status;
  };

  const getOrderTypeIcon = (type) => {
    return type === 'home-delivery' ? '🏠' : '🍽️';
  };

  const getOrderTypeLabel = (type) => {
    return type === 'home-delivery' ? 'Delivery' : 'Dine In';
  };

  const formatTime = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
          <button 
            onClick={fetchOrders}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management 📦</h1>
          <p className="text-gray-600 mt-2">Track and manage all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statuses.slice(1).map((status) => {
            const count = orders.filter(order => order.status === status).length;
            return (
              <div key={status} className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl mb-2">{getStatusIcon(status)}</div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{getStatusLabel(status)}</p>
              </div>
            );
          })}
        </div>

        {/* Order Type Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Order Type:</label>
          <div className="flex flex-wrap gap-2">
            {orderTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type === 'All' ? 'All Orders' : `${getOrderTypeIcon(type)} ${getOrderTypeLabel(type)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Status:</label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'All' ? 'All' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <>
                    <tr 
                      key={order._id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.orderType === 'dine-in' ? (
                          <span className="font-medium text-gray-900">Table {order.tableNumber}</span>
                        ) : (
                          <span className="font-medium text-indigo-600">🏠 Delivery</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{order.customerName || 'Guest'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderType === 'home-delivery' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getOrderTypeIcon(order.orderType)} {getOrderTypeLabel(order.orderType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">{order.items?.length || 0} items</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          ${order.totalAmount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          <span>{getStatusIcon(order.status)}</span>
                          <span>{getStatusLabel(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order._id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={updating === order._id}
                          className="mr-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {getValidStatuses(order.orderType).map(status => (
                            <option key={status} value={status}>
                              {getStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOrder(order._id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Order Details */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Order Details:</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Order ID:</strong> {order._id}</p>
                                {order.orderType === 'home-delivery' && (
                                  <>
                                    <p><strong>Phone:</strong> {order.phoneNumber || 'N/A'}</p>
                                    <p><strong>Address:</strong> {order.deliveryAddress || 'N/A'}</p>
                                    <p><strong>Payment:</strong> {order.paymentMethod?.replace('-', ' ') || 'N/A'}</p>
                                    {order.deliveryFee > 0 && (
                                      <p><strong>Delivery Fee:</strong> ${order.deliveryFee.toFixed(2)}</p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                              <div className="space-y-2">
                                {order.items?.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.menuItem?.name || 'Item'} x{item.quantity}</span>
                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;