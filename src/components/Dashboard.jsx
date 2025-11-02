// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const Dashboard = () => {
  const { admin } = useAuthStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    menuItems: 0,
    revenue: 0,
    totalCustomers: 0,
    dineInOrders: 0,
    deliveryOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch orders
      const ordersResponse = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch menu items
      const menuResponse = await axios.get(`${API_URL}/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (ordersResponse.data.success && menuResponse.data.success) {
        const orders = ordersResponse.data.data;
        const menuItems = menuResponse.data.data;
        
        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const uniqueCustomers = new Set(orders.map(o => o.customerName || 'Guest')).size;
        const dineIn = orders.filter(o => o.orderType === 'dine-in').length;
        const delivery = orders.filter(o => o.orderType === 'home-delivery').length;
        const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
        const completed = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;

        setStats({
          totalOrders: orders.length,
          menuItems: menuItems.length,
          revenue: totalRevenue,
          totalCustomers: uniqueCustomers,
          dineInOrders: dineIn,
          deliveryOrders: delivery,
          pendingOrders: pending,
          completedOrders: completed
        });

        // Get recent 5 orders
        setRecentOrders(orders.slice(0, 5));

        // Calculate popular items
        const itemCounts = {};
        orders.forEach(order => {
          order.items?.forEach(item => {
            const itemName = item.menuItem?.name || 'Unknown Item';
            const itemId = item.menuItem?._id || item.menuItem?.id;
            
            if (!itemCounts[itemId]) {
              itemCounts[itemId] = {
                name: itemName,
                count: 0,
                revenue: 0
              };
            }
            itemCounts[itemId].count += item.quantity;
            itemCounts[itemId].revenue += item.price * item.quantity;
          });
        });

        // Convert to array and sort by count
        const popularItemsArray = Object.values(itemCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setPopularItems(popularItemsArray);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatTime = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return orderDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const mainStats = [
    { title: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-500' },
    { title: 'Menu Items', value: stats.menuItems, icon: '🍽️', color: 'bg-green-500' },
    { title: 'Revenue', value: formatCurrency(stats.revenue), icon: '💰', color: 'bg-yellow-500' },
    { title: 'Customers', value: stats.totalCustomers, icon: '👥', color: 'bg-purple-500' },
  ];

  const additionalStats = [
    { title: 'Dine-in Orders', value: stats.dineInOrders, icon: '🍽️', color: 'bg-indigo-500' },
    { title: 'Delivery Orders', value: stats.deliveryOrders, icon: '🚚', color: 'bg-pink-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-orange-500' },
    { title: 'Completed', value: stats.completedOrders, icon: '✅', color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {admin?.name}! 👋</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your restaurant today.</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {mainStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {additionalStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className={`${stat.color} w-10 h-10 rounded-full flex items-center justify-center text-xl mx-auto mb-2`}>
                  {stat.icon}
                </div>
                <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">📦</span>
                Recent Orders
              </h2>
              <button 
                onClick={() => navigate('/orders')}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between border-b pb-3 hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {order.orderType === 'home-delivery' ? '🏠' : '🍽️'} 
                        {order.orderType === 'dine-in' 
                          ? ` Table ${order.tableNumber}` 
                          : ' Delivery'}
                      </p>
                      <p className="text-sm text-gray-600">{order.customerName || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 mb-1">{formatCurrency(order.totalAmount)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent orders</p>
              )}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">🔥</span>
                Popular Items
              </h2>
              <button 
                onClick={() => navigate('/menu')}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                View Menu →
              </button>
            </div>
            <div className="space-y-4">
              {popularItems.length > 0 ? (
                popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.count} orders</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                      <p className="text-xs text-gray-500">revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No order data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-3xl mb-2">📦</span>
              <span className="text-sm font-semibold text-gray-700">View Orders</span>
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-3xl mb-2">🍽️</span>
              <span className="text-sm font-semibold text-gray-700">Manage Menu</span>
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span className="text-3xl mb-2">👥</span>
              <span className="text-sm font-semibold text-gray-700">Customers</span>
            </button>
            <button
              onClick={fetchDashboardData}
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <span className="text-3xl mb-2">🔄</span>
              <span className="text-sm font-semibold text-gray-700">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;