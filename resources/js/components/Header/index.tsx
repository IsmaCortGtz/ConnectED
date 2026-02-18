import { useSelector } from 'react-redux';
import './header.scss';
import { RootState } from '@/store/store';
import { Icon } from '../Icon';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectED } from '../ConnectED';
import { animationConfig } from '@/config/animations';
import { Button } from '../Button';
import { UserRoles } from '@/store/types/auth';
import Avatar from '../Avatar';

const NAV_ROUTES = {
  dashboard: '/dashboard',
  login: '/login',

  users: '/admin/users',
  courses: '/admin/courses',
  discover: '/discover',
};

export function Header() {
  const { logout, isLoggedIn } = useAuth();
  const { name, role } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setProfile(false);
  }, [pathname]);

  if (pathname.startsWith('/video-call'))
    return <Outlet />; // Don't render header on video call page

  return (
    <>
      <motion.header
        className='page-header-container'
        {...animationConfig.headerPage}
      >
        <ConnectED color='blue' className='logo-component' />

        {isLoggedIn() ? (<>
          <aside className={`page-sidebar-container${profile ? ' active' : ''}`}>
            <div className='sidebar-container'>
              <header className='sidebar-header'>
                <span className='name'>{name}</span>
                <span className='role'>{role}</span>

                <Icon
                  className='close-sidebar-icon'
                  icon="close"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  animate={{ translateY: '-50%' }}
                  onClick={() => setProfile(false)}
                />
              </header>

              <nav className='navbar-content'>
                <NavLink className='item' to={NAV_ROUTES.dashboard}>
                  Dashboard
                </NavLink>

                {role === UserRoles.STUDENT && (<>
                  <NavLink className='item' to={NAV_ROUTES.discover}>
                    Discover
                  </NavLink>
                </>)}

                {role === UserRoles.ADMIN && (
                  <section className='navbar-dropdown'>
                    <span className='navbar-dropdown-title' tabIndex={0}>
                      Modules
                      <Icon
                        className='open-dropdown-icon'
                        icon="keyboard-arrow-up"
                      />
                    </span>
                    <article className='navbar-dropdown-container'>
                      <NavLink className='navbar-dropdown-item item' to={NAV_ROUTES.users}>
                        Users
                      </NavLink>
                      <NavLink className='navbar-dropdown-item item' to={NAV_ROUTES.courses}>
                        Courses
                      </NavLink>
                    </article>
                  </section>
                )}
              </nav>

              <footer className='sidebar-footer'>
                <Link className='action' to={NAV_ROUTES.login} onClick={logout}>
                  <Icon icon="logout" />
                  Logout
                </Link>
              </footer>
            </div>
          </aside>

          <section className='profile'>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className='button'
              onClick={() => setProfile(p => !p)}
            >
              <span className='name'>{name}</span>

              <Icon
                className='open-profile-icon'
                icon="keyboard-arrow-up"
                animate={{ rotate: !profile ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              />

              <Avatar className="profile-picture" text={name} />

              <Icon
                className='open-drawer-icon'
                icon="menu"
              />
            </motion.button>

            <AnimatePresence mode='popLayout'>
              {profile && (
                <motion.article
                  className='dropdown'
                  {...animationConfig.headerDropdown}
                >
                  <header className='dropdown-header'>
                    <span>{role}</span>
                  </header>

                  <Link to={NAV_ROUTES.login} onClick={logout}>
                    <Icon icon="logout" />
                    Logout
                  </Link>
                </motion.article>
              )}
            </AnimatePresence>

          </section>

        </>) : (<>
          <nav className='no-auth'>

          <Button onClick={() => navigate("/register")} btnType='outlined'>Sign up</Button>
          <Button onClick={() => navigate("/login")}>Sign in</Button>
          </nav>
        </>)}
      </motion.header>

      <main className='page-main-container'>
        <Outlet />
      </main>
    </>
  );
}