import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Shield, Calendar, Ship, BookOpen, Users, Route as RouteIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
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
    <Layout>
      <div className="space-y-6">
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
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="px-6 py-6">
            {user?.role === 'customer' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/browse-routes')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ship className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-semibold text-gray-900">Browse Routes</h4>
                    <p className="text-sm text-gray-600">Find and book ferry tickets</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/my-bookings')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-semibold text-gray-900">My Bookings</h4>
                    <p className="text-sm text-gray-600">View your booking history</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Admin Bookings */}
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-semibold text-gray-900">All Bookings</h4>
                    <p className="text-sm text-gray-600">Manage all bookings</p>
                  </div>
                </button>

                {/* Vessels Management (superadmin only) */}
                {user?.role === 'superadmin' && (
                  <>
                    <button
                      onClick={() => navigate('/admin/vessels')}
                      className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-md transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Ship className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-semibold text-gray-900">Vessels</h4>
                        <p className="text-sm text-gray-600">Manage vessels</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/admin/routes')}
                      className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <RouteIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-semibold text-gray-900">Routes</h4>
                        <p className="text-sm text-gray-600">Manage routes</p>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/users')}
                      className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl hover:shadow-md transition-all group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-semibold text-gray-900">Users</h4>
                        <p className="text-sm text-gray-600">Manage user accounts</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
