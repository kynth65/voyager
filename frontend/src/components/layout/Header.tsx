import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      superadmin: { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
      admin: { bg: '#e3f6f5', text: '#272343', border: '#bae8e8' },
      customer: { bg: '#f5f5f5', text: '#272343', border: '#e5e5e5' },
    };
    return colors[role] || colors.customer;
  };

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e3f6f5',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu + Search */}
        <div className="flex items-center flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg transition-all mr-4"
            style={{ color: '#272343', opacity: 0.6 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f6f5';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.opacity = '0.6';
            }}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center max-w-lg w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5" style={{ color: '#272343', opacity: 0.3 }} />
              </div>
              <input
                type="text"
                placeholder="Search bookings, customers..."
                className="block w-full pl-10 pr-3 py-2 border rounded-xl leading-5 bg-white font-light sm:text-sm transition-all"
                style={{
                  borderColor: '#bae8e8',
                  color: '#272343',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#272343';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#bae8e8';
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Notifications + User Info + Logout */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg transition-all"
            style={{ color: '#272343', opacity: 0.6 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f6f5';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.opacity = '0.6';
            }}
          >
            <Bell className="h-5 w-5" />
            <span
              className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white"
              style={{ backgroundColor: '#ef4444' }}
            />
          </button>

          {/* User Info */}
          <div
            className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-xl"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: '#272343' }}>
                {user?.name}
              </p>
              {(() => {
                const colors = getRoleBadgeColor(user?.role || '');
                return (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                  >
                    {user?.role?.replace('_', ' ')}
                  </span>
                );
              })()}
            </div>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
                style={{ border: '2px solid #e3f6f5' }}
              />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#272343',
                  border: '2px solid #e3f6f5',
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 border-transparent text-sm font-medium rounded-xl text-white transition-all duration-200"
            style={{
              backgroundColor: '#272343',
              boxShadow: '0 1px 3px 0 rgba(39, 35, 67, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1829';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(39, 35, 67, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#272343';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(39, 35, 67, 0.2)';
            }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
