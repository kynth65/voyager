import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Phone, Shield, Calendar, Plane } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      company_admin: 'bg-blue-100 text-blue-800 border-blue-200',
      agent: 'bg-green-100 text-green-800 border-green-200',
      customer: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role] || colors.customer;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Voyager
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex sm:items-center sm:space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user?.first_name || user?.name}!
                  </h1>
                  <p className="mt-1 text-blue-100">
                    You're logged in as <span className="font-semibold">{user?.role?.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Account Details Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Account Details
                </h3>
              </div>
              <div className="px-6 py-6">
                <dl className="space-y-4">
                  <div className="flex items-start">
                    <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">{user?.name}</dd>
                  </div>

                  {user?.first_name && (
                    <div className="flex items-start">
                      <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                        <User className="h-4 w-4 mr-2" />
                        First Name
                      </dt>
                      <dd className="text-sm text-gray-900">{user.first_name}</dd>
                    </div>
                  )}

                  {user?.last_name && (
                    <div className="flex items-start">
                      <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                        <User className="h-4 w-4 mr-2" />
                        Last Name
                      </dt>
                      <dd className="text-sm text-gray-900">{user.last_name}</dd>
                    </div>
                  )}

                  <div className="flex items-start">
                    <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>

                  {user?.phone && (
                    <div className="flex items-start">
                      <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </dt>
                      <dd className="text-sm text-gray-900">{user.phone}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Account Status
                </h3>
              </div>
              <div className="px-6 py-6">
                <dl className="space-y-4">
                  <div className="flex items-start justify-between">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Role
                    </dt>
                    <dd>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role || '')}`}>
                        {user?.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </dd>
                  </div>

                  <div className="flex items-start justify-between">
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Status
                    </dt>
                    <dd>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user?.status || '')}`}>
                        {user?.status?.toUpperCase()}
                      </span>
                    </dd>
                  </div>

                  {user?.last_login_at && (
                    <div className="flex items-start">
                      <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last Login
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(user.last_login_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                  )}

                  <div className="flex items-start">
                    <dt className="flex items-center text-sm font-medium text-gray-500 w-32">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member Since
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600">
                More features coming soon! This dashboard will include booking management, customer profiles, and analytics.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
