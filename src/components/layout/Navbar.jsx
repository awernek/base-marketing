import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../shared/Avatar';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium pb-4 pt-4 border-b-2 transition-colors ${
    isActive
      ? 'text-primary-blue border-primary-blue'
      : 'text-gray-600 hover:text-primary-blue border-transparent'
  }`;

export default function Navbar() {
  const { isCoordenador, logout, user } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarRef = useRef(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        const isHamburger = event.target.closest('[data-nav-hamburger]');
        if (!isHamburger) setMobileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const userDisplay = user?.email || '?';
  const links = [
    ...(isCoordenador ? [{ to: '/', label: 'Dashboard' }] : []),
    ...(isCoordenador ? [{ to: '/empreendimentos', label: 'Empreendimentos' }] : []),
    ...(isCoordenador ? [{ to: '/relatorios', label: 'Relatórios' }] : []),
    { to: '/demandas', label: 'Demandas' },
    { to: '/calendario', label: 'Calendário' },
    { to: '/checkin', label: 'Check-in' },
  ];

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shadow-ds-sm sticky top-0 z-40">
      <div className="flex items-center gap-6 md:gap-8">
        <NavLink to={isCoordenador ? '/' : '/checkin'} className="text-xl font-bold text-primary-blue shrink-0">
          Base Marketing
        </NavLink>

        {/* Desktop: links na horizontal */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Desktop: avatar + dropdown */}
      <div className="hidden md:block relative shrink-0" ref={avatarRef}>
        <button
          type="button"
          onClick={() => setAvatarOpen((v) => !v)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
          aria-expanded={avatarOpen}
          aria-haspopup="true"
          aria-label="Menu do usuário"
        >
          <Avatar user={userDisplay} size="md" />
        </button>
        {avatarOpen && (
          <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-lg shadow-ds-lg border border-gray-200">
            <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
              {user?.email}
            </div>
            <button
              type="button"
              onClick={() => {
                setAvatarOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Mobile: hamburger + drawer */}
      <div className="flex md:hidden items-center gap-2" ref={mobileRef}>
        <button
          type="button"
          data-nav-hamburger
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          aria-expanded={mobileOpen}
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setAvatarOpen((v) => !v)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
          aria-label="Menu do usuário"
        >
          <Avatar user={userDisplay} size="sm" />
        </button>
      </div>

      {/* Mobile: drawer de links */}
      {mobileOpen && (
        <div className="absolute md:hidden top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-ds-lg py-4 px-4">
          <div className="flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-blue-light text-primary-blue' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Mobile: overlay e dropdown do avatar */}
      {avatarOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-black/20" aria-hidden="true" onClick={() => setAvatarOpen(false)} />
      )}
      {avatarOpen && (
        <div className="md:hidden absolute right-4 top-16 z-40 w-48 py-1 bg-white rounded-lg shadow-ds-lg border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">{user?.email}</div>
          <button
            type="button"
            onClick={() => {
              setAvatarOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
