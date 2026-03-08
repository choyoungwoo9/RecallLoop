import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { HomeIcon, QuizIcon } from './Icons'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-content">
          <Link to="/" className="layout__logo">
            <img src={logo} alt="Recall Loop" className="layout__logo-image" />
          </Link>
          <h1 className="layout__title">무한 학습의 순환</h1>

          <nav className="layout__header-nav">
            <ul className="layout__header-nav-list">
              <li>
                <Link
                  to="/"
                  className={`layout__header-nav-link ${isActive('/') ? 'layout__header-nav-link--active' : ''}`}
                >
                  <HomeIcon className="layout__header-nav-icon" />
                  <span className="layout__header-nav-text">홈</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/queue"
                  className={`layout__header-nav-link ${isActive('/queue') ? 'layout__header-nav-link--active' : ''}`}
                >
                  <QuizIcon className="layout__header-nav-icon" />
                  <span className="layout__header-nav-text">문제 풀기</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="layout__main">
        {children}
      </main>
    </div>
  )
}

export default Layout
