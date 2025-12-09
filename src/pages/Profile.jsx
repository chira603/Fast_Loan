import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building, 
  IndianRupee, 
  CreditCard, 
  Users, 
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  Building2,
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { setUser } from '../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    company_name: '',
    annual_income: '',
    pan_number: '',
    aadhar_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    account_type: '',
    branch_name: '',
    upi_id: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/profile');
      // API interceptor already returns response.data, so we access .data directly
      const userData = response.data || response;
      
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
        gender: userData.gender || '',
        occupation: userData.occupation || '',
        company_name: userData.company_name || '',
        annual_income: userData.annual_income || '',
        pan_number: userData.pan_number || '',
        aadhar_number: userData.aadhar_number || '',
        emergency_contact_name: userData.emergency_contact_name || '',
        emergency_contact_phone: userData.emergency_contact_phone || '',
        emergency_contact_relation: userData.emergency_contact_relation || '',
        bank_name: userData.bank_name || '',
        account_holder_name: userData.account_holder_name || '',
        account_number: userData.account_number || '',
        ifsc_code: userData.ifsc_code || '',
        account_type: userData.account_type || '',
        branch_name: userData.branch_name || '',
        upi_id: userData.upi_id || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to load profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = { ...formData };
      delete updateData.email; // Email cannot be updated via this endpoint
      
      const response = await api.put('/api/v1/profile', updateData);
      
      // API interceptor already returns response.data, so we access .data directly
      const updatedUserData = response.data || response;
      
      // Update user in Redux store and localStorage
      const updatedUser = { ...user, ...updatedUserData };
      dispatch(setUser(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const getProfileCompletionPercentage = () => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field && field.toString().trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'banking', label: 'Banking Details', icon: Wallet },
    { id: 'emergency', label: 'Emergency Contact', icon: Users },
  ];

  if (loading && !formData.email) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const completionPercentage = getProfileCompletionPercentage();

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and settings</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-outline flex items-center gap-2"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary flex items-center gap-2"
                  disabled={loading}
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Completion</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-2xl font-bold text-primary-700">{completionPercentage}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Complete your profile to unlock all features and increase loan approval chances
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        {activeTab === 'personal' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10 min-h-[100px]"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employment Information */}
        {activeTab === 'employment' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              Employment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Income (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="annual_income"
                    value={formData.annual_income}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="Enter your annual income"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              Identity Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10 uppercase"
                    placeholder="ABCDE1234F"
                    maxLength="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="XXXX XXXX XXXX"
                    maxLength="12"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your documents are securely stored and encrypted. 
                This information is required for KYC verification and loan processing.
              </p>
            </div>
          </div>
        )}

        {/* Banking Details */}
        {activeTab === 'banking' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary-600" />
              Banking & Payment Details
            </h2>
            
            {/* Bank Account Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                      placeholder="e.g., State Bank of India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                      placeholder="Name as per bank account"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                      placeholder="Enter account number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10 uppercase"
                      placeholder="e.g., SBIN0001234"
                      maxLength="11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  >
                    <option value="">Select Account Type</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                    <option value="Salary">Salary Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="branch_name"
                      value={formData.branch_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                      placeholder="Enter branch name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* UPI Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                UPI Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-field pl-10"
                      placeholder="yourname@upi"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your UPI ID for faster transactions (e.g., 9876543210@paytm, username@ybl)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Secure & Encrypted:</strong> Your banking details are encrypted and stored securely. 
                This information is used only for loan disbursement and repayment processing.
              </p>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {activeTab === 'emergency' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-10"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Select Relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Relative">Relative</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Emergency contact will be notified only in case of urgent matters 
                related to your loan account.
              </p>
            </div>
          </div>
        )}
      </form>

      {/* KYC Status */}
      <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">KYC Verification Status</h3>
            <p className="text-sm text-gray-600">
              {user?.kyc_verified 
                ? 'Your account is verified and ready for loan applications'
                : 'Complete your profile and submit documents for verification'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${
            user?.kyc_verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {user?.kyc_verified ? '✓ Verified' : 'Pending'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
