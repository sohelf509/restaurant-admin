// src/components/Dashboard.jsx
import Navbar from './Navbar';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { admin } = useAuthStore();

  const stats = [
    { title: 'Total Orders', value: '156', icon: '📦', color: 'bg-blue-500' },
    { title: 'Menu Items', value: '42', icon: '🍽️', color: 'bg-green-500' },
    { title: 'Revenue', value: '₹1,24,500', icon: '💰', color: 'bg-yellow-500' },
    { title: 'Customers', value: '89', icon: '👥', color: 'bg-purple-500' },
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">📦</span>
              Recent Orders
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((order) => (
                <div key={order} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Order #{1000 + order}</p>
                    <p className="text-sm text-gray-600">Customer {order}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🔥</span>
              Popular Items
            </h2>
            <div className="space-y-4">
              {['Margherita Pizza', 'Caesar Salad', 'Pasta Carbonara'].map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{item}</p>
                    <p className="text-sm text-gray-600">{45 - index * 5} orders today</p>
                  </div>
                  <span className="text-2xl">⭐</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;