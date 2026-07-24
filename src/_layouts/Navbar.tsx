'use client'

// React Imports
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Compass, BookOpen, Flag, Trophy, Shield, Users, Gavel, User, ChevronDown, Loader2, Menu, X, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'

// Shared Imports
import APP from '@/config'
import { TDCTF } from '@/_vars/const'
import ImageWithFallback from '@/shared/components/ImageWithFallback'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { usePresence } from '@/shared/contexts'
import {
  SURFACE_NAVBAR_CLASS,
  SURFACE_NAV_DROPDOWN_CLASS,
  SURFACE_NAV_DROPDOWN_ITEM_CLASS,
  SURFACE_NAV_LINK_ACTIVE_CLASS,
  SURFACE_NAV_LINK_BASE_CLASS,
  SURFACE_NAV_LINK_IDLE_CLASS,
} from '@/shared/styles'

// Internal Imports
const NavbarLogsButton = dynamic(() => import('./components/NavbarLogsButton'), {
  ssr: false,
})

const NavbarNotifications = dynamic(() => import('@/widgets/notifications/NavbarNotifications'), {
  ssr: false,
})

const DevConfig = dynamic(() => import('@/widgets/dev-config'), {
  ssr: false,
})

const DEFAULT_NAVBAR_LOGO_SRC = '/logo.svg'

function normalizeNavbarImageSrc(src?: string | null, fallback: string | null = null) {
  const value = String(src || '').trim()
  if (!value) return fallback
  if (/^(https?:\/\/|data:|blob:)/i.test(value) || value.startsWith('//')) return value
  if (value.startsWith('/')) return value

  const publicPath = value
    .replace(/^\.?\//, '')
    .replace(/^public\//, '')

  return publicPath ? `/${publicPath}` : fallback
}

// Nav mode type
type NavMode = 'capsule' | 'bar' | 'morphing-to-capsule' | 'morphing-to-bar'

export default function Navbar() {
  const router = useRouter()
  const { user, setUser, loading } = useAuth()
  const { onlineCount } = usePresence()
  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminStatus, setAdminStatus] = useState(false)
  const [globalAdminStatus, setGlobalAdminStatus] = useState(false)

  const [scoreboardOpen, setScoreboardOpen] = useState(false)
  const scoreboardMenuRef = useRef<HTMLDivElement | null>(null)

  const [docsOpen, setDocsOpen] = useState(false)
  const docsMenuRef = useRef<HTMLDivElement | null>(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  // Capsule navbar state machine
  const isHome = pathname === '/'
  const [navMode, setNavMode] = useState<NavMode>(isHome ? 'capsule' : 'bar')
  const prevPathnameRef = useRef<string>(pathname)

  // Desktop detection: capsule is ONLY active on desktop (≥768px)
  // Mobile always uses the normal bar — never gets capsule classes
  const [isDesktop, setIsDesktop] = useState(false)
  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const { theme, toggleTheme } = useTheme()
  const authReady = !loading
  const logoSrc = normalizeNavbarImageSrc(APP.image_logo, DEFAULT_NAVBAR_LOGO_SRC)
  const avatarSrc = normalizeNavbarImageSrc(user?.profile_picture_url || user?.picture || null, null)



  useEffect(() => {
    if (user) {
      let active = true

      import('@/features/admin/services/admin.service')
        .then(async ({ isAdmin, isGlobalAdmin }) => {
          const [admin, globalAdmin] = await Promise.all([
            isAdmin(),
            isGlobalAdmin(),
          ])

          if (!active) return
          setAdminStatus(admin)
          setGlobalAdminStatus(globalAdmin)
        })
        .catch(() => {
          if (!active) return
          setAdminStatus(false)
          setGlobalAdminStatus(false)
        })

      return () => {
        active = false
      }
    } else {
      setAdminStatus(false)
      setGlobalAdminStatus(false)
    }
  }, [user])

  // Navbar morph: watch pathname changes and trigger animation
  useEffect(() => {
    const prev = prevPathnameRef.current
    const next = pathname
    prevPathnameRef.current = next

    const wasHome = prev === '/'
    const nowHome = next === '/'

    if (wasHome === nowHome) return // same page type, no morph needed

    if (nowHome) {
      // Going to home: bar → capsule
      setNavMode('morphing-to-capsule')
    } else {
      // Leaving home: capsule → bar
      setNavMode('morphing-to-bar')
    }
  }, [pathname])

  const handleNavAnimationEnd = useCallback((e: React.AnimationEvent<HTMLElement>) => {
    // Guard: ignore events bubbled from children — only process our own morph animations
    if (e.target !== e.currentTarget) return
    if (!e.animationName.startsWith('morph-to-')) return
    setNavMode(isHome ? 'capsule' : 'bar')
  }, [isHome])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    const { AuthService } = await import('@/features/auth/services/auth.service')
    await AuthService.signOut()
    setUser(null)
    setAdminStatus(false)
    setGlobalAdminStatus(false)
    router.push('/login')
  }

  const showTeamScoreboard = APP.teams.enabled
  const showUserScoreboard = !showTeamScoreboard || !APP.teams.hideScoreboardIndividual
  const scoreboardOptionCount = Number(showUserScoreboard) + Number(showTeamScoreboard)
  const routeActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const scoreboardActive = routeActive('/scoreboard') || routeActive('/teams/scoreboard')
  const infoActive = routeActive('/info') || routeActive('/rules')
  const navLinkClass = (active = false) =>
    `${SURFACE_NAV_LINK_BASE_CLASS} ${active ? SURFACE_NAV_LINK_ACTIVE_CLASS : SURFACE_NAV_LINK_IDLE_CLASS}`

  useEffect(() => {
    if (!scoreboardOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!scoreboardMenuRef.current) return
      if (!scoreboardMenuRef.current.contains(event.target as Node)) {
        setScoreboardOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [scoreboardOpen])

  useEffect(() => {
    if (!docsOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!docsMenuRef.current) return
      if (!docsMenuRef.current.contains(event.target as Node)) {
        setDocsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [docsOpen])

  useEffect(() => {
    if (!profileOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const navClassName = [
    SURFACE_NAVBAR_CLASS,
    // Capsule is ONLY for desktop — mobile always stays as plain bar
    isDesktop && (navMode === 'capsule' || navMode === 'morphing-to-capsule') ? 'navbar-capsule' : '',
    isDesktop && (navMode === 'bar' || navMode === 'morphing-to-bar') ? 'navbar-bar' : '',
    isDesktop && navMode === 'morphing-to-capsule' ? 'navbar-animating-to-capsule' : '',
    isDesktop && navMode === 'morphing-to-bar' ? 'navbar-animating-to-bar' : '',
  ].filter(Boolean).join(' ')

  const isCapsuled = isDesktop && (navMode === 'capsule' || navMode === 'morphing-to-capsule')

  return (
    <>
      <nav
        className={navClassName}
        onAnimationEnd={handleNavAnimationEnd}
      >
        <div className="navbar-inner max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14 items-center">
            {/* Logo */}
            <div className={`flex items-center ${isCapsuled ? 'space-x-4' : 'space-x-8'}`}>
              <Link
                href="/"
                className="group flex items-center gap-2 caret-transparent rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                data-tour="navbar-logo"
              >
                <ImageWithFallback
                  src={logoSrc}
                  alt={`${APP.shortName} logo`}
                  size={42}
                  className="rounded-full"
                />
                <span className={`text-[1.35rem] font-extrabold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-all duration-200 group-hover:text-blue-500 dark:group-hover:text-blue-400`}>{APP.shortName}</span>
              </Link>

              {/* Desktop menu */}
              <div className="hidden md:flex space-x-2">
                {authReady && user && (
                  <Link
                    href="/challenges"
                    className={navLinkClass(routeActive('/challenges'))}
                    data-tour="navbar-challenges"
                  >
                    <Flag size={18} className="mr-1" /> Challenges
                  </Link>
                )}

                {authReady && user && scoreboardOptionCount > 0 && (
                  scoreboardOptionCount === 1 ? (
                    <Link
                      href={showTeamScoreboard ? '/teams/scoreboard' : '/scoreboard'}
                      className={navLinkClass(scoreboardActive)}
                      data-tour="navbar-scoreboard"
                    >
                      <Trophy size={18} className="mr-1" /> Scoreboard
                    </Link>
                  ) : (
                    <div ref={scoreboardMenuRef} className="relative">
                      <button
                        type="button"
                        data-tour="navbar-scoreboard"
                        onClick={() => setScoreboardOpen((v) => !v)}
                        className={navLinkClass(scoreboardActive)}
                      >
                        <Trophy size={18} className="mr-1" /> Scoreboard
                        <ChevronDown className={`ml-1 h-3.5 w-3.5 opacity-70 transition-transform ${scoreboardOpen ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                      {scoreboardOpen && (
                        <div className={SURFACE_NAV_DROPDOWN_CLASS}>
                          {showUserScoreboard && (
                            <Link
                              href="/scoreboard"
                              onClick={() => setScoreboardOpen(false)}
                              className={SURFACE_NAV_DROPDOWN_ITEM_CLASS}
                            >
                              <span className="flex items-center">
                                <User size={18} className="mr-1" />
                                User Scoreboard
                              </span>
                            </Link>
                          )}
                          {showTeamScoreboard && (
                            <Link
                              href="/teams/scoreboard"
                              onClick={() => setScoreboardOpen(false)}
                              className={SURFACE_NAV_DROPDOWN_ITEM_CLASS}
                            >
                              <span className="flex items-center">
                                <Users size={18} className="mr-1" />
                                Team Scoreboard
                              </span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {authReady && user && APP.teams.enabled && (
                  <Link
                    href="/teams"
                    className={navLinkClass(routeActive('/teams') && !routeActive('/teams/scoreboard'))}
                  >
                    <Users size={18} className="mr-1" /> Teams
                  </Link>
                )}

                {/* Info Dropdown */}
                <div ref={docsMenuRef} className="relative">
                  <button
                    type="button"
                    data-tour="navbar-docs"
                    onClick={() => setDocsOpen((v) => !v)}
                    className={navLinkClass(infoActive)}
                  >
                    <Compass size={18} className="mr-1" /> Info
                    <ChevronDown className={`ml-1 h-3.5 w-3.5 opacity-70 transition-transform ${docsOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  {docsOpen && (
                    <div className={SURFACE_NAV_DROPDOWN_CLASS}>
                      <Link
                        href="/info"
                        onClick={() => setDocsOpen(false)}
                        className={SURFACE_NAV_DROPDOWN_ITEM_CLASS}
                        data-tour="navbar-info"
                      >
                        <span className="flex items-center">
                          <Compass size={18} className="mr-1" />
                          Info
                        </span>
                      </Link>
                      <Link
                        href="/rules"
                        onClick={() => setDocsOpen(false)}
                        className={SURFACE_NAV_DROPDOWN_ITEM_CLASS}
                        data-tour="navbar-rules"
                      >
                        <span className="flex items-center">
                          <Gavel size={18} className="mr-1" />
                          Rules
                        </span>
                      </Link>
                      <Link
                        href={TDCTF.tdctf_docs}
                        target="_blank"
                        onClick={() => setDocsOpen(false)}
                        className={SURFACE_NAV_DROPDOWN_ITEM_CLASS}
                        data-tour="navbar-docs"
                      >
                        <span className="flex items-center">
                          <BookOpen size={18} className="mr-1" />
                          Docs
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {authReady && adminStatus && user && (
                  <Link
                    href={globalAdminStatus ? '/admin/overview' : '/admin/challenges'}
                    className={navLinkClass(routeActive('/admin'))}
                  >
                    <Shield size={18} className="mr-1" /> Admin
                  </Link>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className={`flex items-center ${isCapsuled ? 'space-x-3' : 'space-x-5'}`}>
              {/* Live Status Counter */}
              {authReady && user && adminStatus && (
                <div 
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold select-none cursor-default shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                  title={`${onlineCount} user(s) online`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span>{onlineCount} Live</span>
                </div>
              )}

              {/* Notifications */}
              {authReady && user && (
                <NavbarNotifications key="notifications" theme={theme} globalAdminStatus={globalAdminStatus} />
              )}

              {/* Logs Icon */}
              {authReady && user && (
                <NavbarLogsButton key="logs" theme={theme} pathname={pathname} />
              )}

              {/* Dev Config Widget */}
              <DevConfig key="dev-config" />

              {/* Profile / Auth actions - Now rightmost */}
              <div className="hidden sm:flex items-center space-x-3">
                {!authReady ? null : user ? (
                  <div ref={profileMenuRef} className="relative flex items-center space-x-3 animate-in fade-in duration-300">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="group flex items-center gap-2 caret-transparent rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0"
                    >
                      <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-full border border-gray-200/50 dark:border-gray-800/80" />
                      <span
                        className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-all duration-150 group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate whitespace-nowrap ${isCapsuled ? 'max-w-[80px]' : 'max-w-[100px] md:max-w-[160px]'} block`}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                      <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {profileOpen && (
                      <div className={`${SURFACE_NAV_DROPDOWN_CLASS} right-0 left-auto mt-2 w-48 shadow-xl absolute top-full`}>
                        <div className="px-3.5 py-2.5 border-b border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/30">
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate mt-0.5">{user.username}</p>
                        </div>
                        
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className={`${SURFACE_NAV_DROPDOWN_ITEM_CLASS} flex items-center gap-2`}
                        >
                          <User size={16} className="text-gray-400" />
                          <span>My Profile</span>
                        </Link>

                        <button
                          onClick={() => {
                            setProfileOpen(false)
                            void handleLogout()
                          }}
                          className={`${SURFACE_NAV_DROPDOWN_ITEM_CLASS} w-full text-left flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 hover:bg-red-50`}
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 animate-in fade-in duration-300">
                    <Link
                      href="/login"
                      className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`px-4 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Theme Switcher - DISABLED TEMPORARILY */}
              {/* <button
                onClick={toggleTheme}
                className="focus:outline-none transition-colors duration-150 ml-1"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon transition-all duration-150">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun transition-all duration-150">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </button> */}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white/95 backdrop-blur-xl transition-all duration-200 dark:bg-[#0b0f19]/95 md:hidden">
          <div className="flex items-center justify-between border-b border-gray-200/80 px-4 py-3 dark:border-gray-800/90">
            <span className={`text-lg font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 pt-4 pb-6 space-y-2 animate-fade-in">
            {/* Profile */}
            {authReady && user && (
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ImageWithFallback src={avatarSrc} alt={user.username} size={36} className="rounded-full" />
                <span
                  className={`text-[15px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:text-blue-500 dark:group-hover:text-blue-400 truncate whitespace-nowrap max-w-[120px] block`}
                  title={user.username}
                >
                  {user.username}
                </span>
              </Link>
            )}

            {authReady && user && (
              <>
                <Link
                  href="/challenges"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Flag size={18} className="mr-1" /> Challenges
                </Link>
                {scoreboardOptionCount > 0 && (
                  scoreboardOptionCount === 1 ? (
                    <Link
                      href={showTeamScoreboard ? '/teams/scoreboard' : '/scoreboard'}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Trophy size={18} className="mr-1" /> Scoreboard
                    </Link>
                  ) : (
                    <details className="rounded-lg">
                      <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                        <Trophy size={18} className="mr-1" /> Scoreboard
                      </summary>
                      <div className="mt-1 ml-6 flex flex-col gap-1">
                        {showUserScoreboard && (
                          <Link
                            href="/scoreboard"
                            className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="flex items-center">
                              <User size={18} className="mr-1" />
                              User Scoreboard
                            </span>
                          </Link>
                        )}
                        {showTeamScoreboard && (
                          <Link
                            href="/teams/scoreboard"
                            className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="flex items-center">
                              <Users size={18} className="mr-1" />
                              Team Scoreboard
                            </span>
                          </Link>
                        )}
                      </div>
                    </details>
                  )
                )}
                {APP.teams.enabled && (
                  <Link
                    href="/teams"
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users size={18} className="mr-1" /> Teams
                  </Link>
                )}
              </>
            )}

            {/* Info Menu - Mobile */}
            <details className="rounded-lg">
              <summary className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                <BookOpen size={18} className="mr-1" /> Info
              </summary>
              <div className="mt-1 ml-6 flex flex-col gap-1">
                <Link
                  href="/info"
                  className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <Compass size={18} className="mr-1" /> Info
                  </span>
                </Link>
                <Link
                  href="/rules"
                  className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <Gavel size={18} className="mr-1" /> Rules
                  </span>
                </Link>
                <Link
                  href="/docs"
                  className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <BookOpen size={18} className="mr-1" /> Docs
                  </span>
                </Link>
              </div>
            </details>

            {authReady && user && (
              <>
                {adminStatus && (
                  <Link
                    href={globalAdminStatus ? '/admin/overview' : '/admin/challenges'}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[15px] font-medium transition-all duration-150 ${theme === 'dark' ? 'text-gray-200 hover:text-blue-400 hover:bg-gray-800 focus:ring-2 focus:ring-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={18} className="mr-1" /> Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 border border-red-500/25 text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/5 px-3 py-2 rounded-lg text-[15px] font-semibold transition-all duration-150"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {authReady && !user && (
              <>
                <Link
                  href="/login"
                  className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`flex px-3 py-2 rounded-lg text-[15px] font-medium shadow transition-all duration-150 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}


    </>
  )
}
