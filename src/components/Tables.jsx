// src/pages/Tables.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  // Fetch all tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tables`);
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch tables');
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Create new table
  const handleCreateTable = async (e) => {
    e.preventDefault();
    
    if (!tableNumber.trim()) {
      toast.error('Please enter a table number');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_URL}/tables`,
        { tableNumber: tableNumber.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Table ${tableNumber} created successfully!`);
        setTables([...tables, response.data.data]);
        setTableNumber('');
        setIsModalOpen(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create table';
      toast.error(message);
      console.error('Error creating table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (id, tableNum) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNum}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_URL}/tables/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Table deleted successfully');
        setTables(tables.filter(table => table._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete table');
      console.error('Error deleting table:', error);
    }
  };

  // Download QR Code
  const handleDownloadQR = (qrCodeUrl, tableNumber) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`QR code for Table ${tableNumber} downloaded!`);
  };

  // View QR Code Modal
  const QRModal = ({ qrCode, tableNum, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Table {tableNum} QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <img src={qrCode} alt={`QR Code for Table ${tableNum}`} className="w-64 h-64" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadQR(qrCode, tableNum)}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📥 Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tables Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage restaurant tables and QR codes
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-xl">+</span>
              <span className="font-medium">Add New Table</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <div className="text-4xl">🪑</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{tables.length}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tables Yet</h3>
            <p className="text-gray-600 mb-6">Create your first table to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tables.map((table) => (
              <div
                key={table._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Table {table.tableNumber}
                  </h3>
                  <span className="text-3xl">🪑</span>
                </div>

                {/* QR Code Preview */}
                <div 
                  className="bg-gray-50 rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedQR({ qr: table.qrCodeUrl, num: table.tableNumber })}
                >
                  <img
                    src={table.qrCodeUrl}
                    alt={`QR Code for Table ${table.tableNumber}`}
                    className="w-full h-auto rounded"
                  />
                  <p className="text-xs text-center text-gray-500 mt-2">Click to view full size</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedQR({ qr: table.qrCodeUrl, num: table.tableNumber })}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleDownloadQR(table.qrCodeUrl, table.tableNumber)}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>

                {/* Table Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(table.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Table Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Table</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setTableNumber('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTable}>
                <div className="mb-6">
                  <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="text"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., 1, A1, VIP-1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter a unique identifier for this table
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setTableNumber('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code View Modal */}
        {selectedQR && (
          <QRModal
            qrCode={selectedQR.qr}
            tableNum={selectedQR.num}
            onClose={() => setSelectedQR(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Tables;