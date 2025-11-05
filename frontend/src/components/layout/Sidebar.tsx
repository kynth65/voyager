import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Ship } from 'lucide-react';
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
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ backgroundColor: 'rgba(39, 35, 67, 0.5)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'w-64' : 'w-20'}
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e3f6f5',
          boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Logo & Toggle */}
        <div
          className="flex-shrink-0 flex items-center justify-between h-16 px-4"
          style={{ borderBottom: '1px solid #e3f6f5' }}
        >
          {isOpen ? (
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div
                className="h-9 w-9 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: '#272343',
                  boxShadow: '0 4px 6px -1px rgba(39, 35, 67, 0.2)',
                }}
              >
                <Ship className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-xl font-semibold"
                style={{ color: '#272343', letterSpacing: '-0.01em' }}
              >
                Voyager
              </span>
            </Link>
          ) : (
            <Link to="/dashboard" className="flex items-center justify-center w-full group">
              <div
                className="h-9 w-9 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: '#272343',
                  boxShadow: '0 4px 6px -1px rgba(39, 35, 67, 0.2)',
                }}
              >
                <Ship className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{ color: '#272343', opacity: 0.5 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = '#e3f6f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.5';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#bae8e8 #ffffff',
          }}
        >
          <div className="space-y-6">
            {navigation.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                {isOpen && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{
                      color: '#272343',
                      opacity: 0.4,
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.4';
                    }}
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
                            flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${!isOpen ? 'justify-center' : ''}
                          `}
                          style={
                            active
                              ? {
                                  backgroundColor: '#272343',
                                  color: '#ffffff',
                                  boxShadow: '0 4px 6px -1px rgba(39, 35, 67, 0.2)',
                                }
                              : {
                                  color: '#272343',
                                  opacity: 0.6,
                                }
                          }
                          title={!isOpen ? item.label : undefined}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.backgroundColor = '#e3f6f5';
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.opacity = '0.6';
                            }
                          }}
                        >
                          <Icon className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
                          {isOpen && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span
                                  className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: active ? '#ffffff20' : '#e3f6f5',
                                    color: active ? '#ffffff' : '#272343',
                                  }}
                                >
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
          <div
            className="flex-shrink-0 p-4"
            style={{ borderTop: '1px solid #e3f6f5' }}
          >
            <Link
              to="/profile"
              className="flex items-center space-x-3 p-2 rounded-xl transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f6f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                  style={{
                    border: '2px solid #e3f6f5',
                  }}
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: '#272343',
                    border: '2px solid #e3f6f5',
                  }}
                >
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: '#272343' }}
                >
                  {user.name}
                </p>
                <p
                  className="text-xs capitalize font-light truncate"
                  style={{ color: '#272343', opacity: 0.5 }}
                >
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
