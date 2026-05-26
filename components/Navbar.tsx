'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Menu, X, User as UserIcon, LogOut, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, profile, loginWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error('Error closing session', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-base">C</div>
              <span className="hidden sm:inline tracking-widest uppercase">CuantoCobras</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link href="/salarios" className="text-slate-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              Salarios
            </Link>
            <Link href="/foro" className="text-slate-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              Foro Financiero
            </Link>
            
            {!user ? (
              <button
                onClick={loginWithGoogle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-4"
              >
                Ingresar
              </button>
            ) : (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  {user.photoURL ? (
                    <img className="h-8 w-8 rounded-full border border-slate-700" src={user.photoURL} alt="" width={32} height={32} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 bg-slate-800 border border-slate-700 z-10 block text-slate-300">
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    {profile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-slate-700 hover:text-white transition-colors flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 hover:text-white transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/salarios"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Salarios
            </Link>
            <Link
              href="/foro"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Foro Financiero
            </Link>
            {!user ? (
               <button
                 onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                 className="block w-full text-left mt-4 px-3 py-2 rounded-xl text-base font-medium text-blue-400 hover:bg-slate-800"
               >
                 Ingresar con Google
               </button>
            ) : (
              <>
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Panel Administrador
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-400 hover:bg-slate-800"
                >
                  {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                </button>
              </>
            )}
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-slate-800">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <img className="h-10 w-10 rounded-full border border-slate-700" src={user.photoURL} alt="" width={40} height={40} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.displayName}</div>
                  <div className="text-sm font-medium text-slate-400">{user.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
