import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plane } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getNavigationForRole, type NavGroup } from '../../config/navigation';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Dashboard']));

  const navigation: NavGroup[] = user ? getNavigationForRole(user.role) : [];

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel);
      } else {
        newSet.add(groupLabel);
      }
      return newSet;
    });
  };

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-64' : 'w-20'}
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo & Toggle */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isOpen ? (
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Voyager
              </span>
            </Link>
          ) : (
            <Link to="/dashboard" className="flex items-center justify-center w-full">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                <Plane className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-6">
            {navigation.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                {isOpen && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>{group.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        expandedGroups.has(group.label) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                )}

                {/* Group Items */}
                {(isOpen ? expandedGroups.has(group.label) : true) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActiveLink(item.href);

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`
                            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              active
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
                            ${!isOpen ? 'justify-center' : ''}
                          `}
                          title={!isOpen ? item.label : undefined}
                        >
                          <Icon className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
                          {isOpen && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Info at Bottom */}
        {isOpen && user && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
