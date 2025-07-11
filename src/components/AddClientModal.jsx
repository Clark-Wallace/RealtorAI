import { useState } from 'react';
import { X, UserPlus, Mail, Phone, DollarSign, MessageSquare, Save } from 'lucide-react';

const AddClientModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budgetMin: '',
    budgetMax: '',
    preferredContact: 'email',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.budgetMin || !formData.budgetMax) {
      newErrors.budget = 'Budget range is required';
    } else if (parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax)) {
      newErrors.budget = 'Minimum budget must be less than maximum';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newClient = {
      id: Date.now(), // In production, this would come from backend
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      budget: {
        min: parseFloat(formData.budgetMin),
        max: parseFloat(formData.budgetMax)
      },
      preferredContact: formData.preferredContact,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };
    
    onSave(newClient);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      budgetMin: '',
      budgetMax: '',
      preferredContact: 'email',
      notes: ''
    });
    setErrors({});
    setSaving(false);
    onClose();
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const formatCurrency = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    return digits ? parseInt(digits).toLocaleString() : '';
  };

  const handleBudgetChange = (field, value) => {
    const digits = value.replace(/\D/g, '');
    setFormData({ ...formData, [field]: digits });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={24} />
            Add New Client
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Smith"
              style={{ fontSize: '16px' }}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
                style={{ fontSize: '16px' }}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
                style={{ fontSize: '16px' }}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.budgetMin ? `$${formatCurrency(formData.budgetMin)}` : ''}
                  onChange={(e) => handleBudgetChange('budgetMin', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Min"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.budgetMax ? `$${formatCurrency(formData.budgetMax)}` : ''}
                  onChange={(e) => handleBudgetChange('budgetMax', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Max"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>

          {/* Preferred Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontSize: '16px' }}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Any special requirements or preferences..."
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Client
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;