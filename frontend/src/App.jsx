import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { courses, RAZORPAY_LINK, API_URL } from './data/courses'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ====================== AUTH CONTEXT ======================
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('devmaster-user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('devmaster-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('devmaster-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

// ====================== HELPERS ======================
const Icon = ({ children, size = 20 }) => (
  <span style={{ display: 'inline-flex', fontSize: size, lineHeight: 1 }}>{children}</span>
)

function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('devmaster-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('devmaster-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (course) => {
    setCart((prev) => {
      if (prev.find((c) => c.id === course.id)) return prev
      return [...prev, { id: course.id, title: course.title, price: course.price, color: course.color, icon: course.icon }]
    })
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id))
  const clearCart = () => setCart([])
  const total = cart.reduce((sum, c) => sum + c.price, 0)

  return { cart, addToCart, removeFromCart, clearCart, total }
}

// ====================== NAVBAR ======================
function Navbar({ cartCount }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const navRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar" ref={navRef}>
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">{'}'}</div>
            DevMaster
          </Link>

          <div className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            <Link to="/courses" className={isActive('/courses') ? 'active' : ''}>Courses</Link>
            {user && <Link to="/my-courses" className={isActive('/my-courses') ? 'active' : ''}>My Courses</Link>}
            <Link to="/cart" className="cart-btn">
              <Icon size={20}>🛒</Icon>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Hi, {user.name}</span>
                <button onClick={logout} className="btn btn-sm btn-outline">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">Login</Link>
            )}
          </div>

          <button className="mobile-toggle" onClick={() => setOpen(!open)}>
            {open ? <Icon size={24}>✕</Icon> : <Icon size={24}>☰</Icon>}
          </button>
        </div>

        <div className={`mobile-menu ${open ? 'open' : ''}`}>
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
          {user && <Link to="/my-courses" onClick={() => setOpen(false)}>My Courses</Link>}
          <Link to="/cart" onClick={() => setOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <button onClick={() => { logout(); setOpen(false) }} style={{ textAlign: 'left', padding: '12px 0', color: 'var(--text-muted)' }}>
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

// ====================== FOOTER ======================
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} DevMaster Courses. All rights .</p>
          <div className="footer-links">
            <a href="mailto:support@devmaster.example">Support</a>
            <a href={RAZORPAY_LINK} target="_blank" rel="noopener noreferrer">Payments</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ====================== COURSE CARD ======================
function CourseCard({ course, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, delay: index * 0.1, ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 90%" }
      }
    )
  }, [index])

  return (
    <Link to={`/course/${course.id}`} className="course-card" ref={cardRef}>
      <div className="course-card-top" style={{ background: `linear-gradient(135deg, ${course.color}33, ${course.color}11)` }}>
        <div className="course-icon" style={{ color: course.color }}>
          {course.icon === 'html' && '</>'}
          {course.icon === 'css' && '#{}'}
          {course.icon === 'js' && 'JS'}
          {course.icon === 'react' && '⚛'}
          {course.icon === 'node' && 'N'}
          {course.icon === 'sql' && 'SQL'}
        </div>
      </div>
      <div className="course-card-body">
        <div className="course-meta">
          <span className="badge">{course.level}</span>
          <span className="badge">{course.duration}</span>
        </div>
        <h3>{course.title}</h3>
        <p className="subtitle">{course.subtitle}</p>
        <p className="desc">{course.description}</p>
        <div className="course-footer">
          <div className="price">
            <span className="price-current">₹{course.price}</span>
            <span className="price-old">₹{course.originalPrice}</span>
          </div>
          <span className="btn btn-sm btn-outline">View →</span>
        </div>
      </div>
    </Link>
  )
}

// ====================== HOME ======================
function Home() {
  const badgeRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const actionsRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(badgeRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.3")
      .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
      .fromTo(actionsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(statsRef.current?.children || [], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.2")
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge" ref={badgeRef}>🚀 Lifetime Access • Downloadable Videos</div>
            <h1 ref={titleRef}>
              Master Web Development<br />
              <span>From Zero to Pro</span>
            </h1>
            <p ref={descRef}>
              Premium courses on HTML, CSS, JavaScript, React, Node.js & SQL.
              Learn with downloadable video courses and lifetime access.
            </p>
            <div className="hero-actions" ref={actionsRef}>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              <Link to="/login" className="btn btn-outline">Login / Register</Link>
            </div>
            <div className="hero-stats" ref={statsRef}>
              <div className="stat"><div className="stat-value">6</div><div className="stat-label">Courses</div></div>
              <div className="stat"><div className="stat-value">300+</div><div className="stat-label">Lessons</div></div>
              <div className="stat"><div className="stat-value">ZIP</div><div className="stat-label">Download</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Popular Courses</h2>
            <p>Start your development journey with our most loved courses</p>
          </div>
          <div className="courses-grid">
            {courses.slice(0, 3).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/courses" className="btn btn-outline">View All Courses</Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ====================== COURSES PAGE ======================
function CoursesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2>All Courses</h2>
          <p>Choose the skill you want to master next</p>
        </div>
        <div className="courses-grid">
          {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// ====================== LOGIN / REGISTER ======================
function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const body = isLogin ? { email, password } : { name, email, password }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      login(data.user)
      navigate('/my-courses')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, padding: '60px 24px' }}>
      <div className="buy-card">
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 28 }}>
          {isLogin ? 'Login to access your courses' : 'Register to start learning'}
        </p>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
                placeholder="Your name"
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError('') }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none'
}

// ====================== MY COURSES ======================
function MyCoursesPage() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch(`${API_URL}/api/my-courses/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setPurchases(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  if (!user) return <Navigate to="/login" />

  const ownedCourses = purchases.map(p => {
    const course = courses.find(c => c.id === p.courseId)
    return course ? { ...course, purchase: p } : null
  }).filter(Boolean)

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2>My Courses</h2>
          <p>Courses you have purchased and unlocked</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
        ) : ownedCourses.length === 0 ? (
          <div className="empty-cart">
            <h2>No courses yet</h2>
            <p>Purchase a course and request access after payment.</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="courses-grid">
            {ownedCourses.map((course, i) => (
              <div key={course.id} className="course-card">
                <div className="course-card-top" style={{ background: `linear-gradient(135deg, ${course.color}33, ${course.color}11)` }}>
                  <div className="course-icon" style={{ color: course.color }}>
                    {course.icon === 'html' && '</>'}
                    {course.icon === 'css' && '#{}'}
                    {course.icon === 'js' && 'JS'}
                    {course.icon === 'react' && '⚛'}
                    {course.icon === 'node' && 'N'}
                    {course.icon === 'sql' && 'SQL'}
                  </div>
                </div>
                <div className="course-card-body">
                  <h3>{course.title}</h3>
                  <p className="subtitle">{course.subtitle}</p>
                  <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                    <a
                      href={course.zipUrl}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ⬇ Download Course ZIP
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ====================== COURSE DETAIL ======================
function CourseDetail({ addToCart, cart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const course = courses.find(c => c.id === id)
  const [status, setStatus] = useState(null) // null | pending | unlocked
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState('')
  const detailRef = useRef(null)

  useEffect(() => {
    if (detailRef.current) {
      gsap.fromTo(detailRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
    }
  }, [id])

  useEffect(() => {
    if (!user || !course) return
    fetch(`${API_URL}/api/my-courses/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.courseId === course.id)
        if (found) setStatus('unlocked')
      })
  }, [user, course])

  if (!course) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Courses</Link>
      </div>
    )
  }

  const inCart = cart.some(c => c.id === course.id)
  const savePercent = Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)

  const handleRequestAccess = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          transactionId,
          note: ''
        })
      })
      const data = await res.json()
      setMessage(data.message || 'Request submitted!')
      setStatus('pending')
    } catch {
      setMessage('Failed to submit request. Try again.')
    }
  }

  return (
    <div className="detail-hero" ref={detailRef}>
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline" style={{ marginBottom: 24 }}>
          <Icon size={16}>←</Icon> Back
        </button>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="course-meta" style={{ marginBottom: 12 }}>
              <span className="badge" style={{ background: `${course.color}22`, color: course.color }}>{course.category}</span>
              <span className="badge">{course.level}</span>
            </div>
            <h1>{course.title}</h1>
            <p className="subtitle">{course.subtitle}</p>

            <div className="detail-meta">
              <div className="meta-item"><Icon size={16}>⏱</Icon> {course.duration}</div>
              <div className="meta-item"><Icon size={16}>📚</Icon> {course.lessons} lessons</div>
              <div className="meta-item"><Icon size={16}>📊</Icon> {course.level}</div>
            </div>

            <p className="detail-description">{course.longDescription}</p>

            <div className="features-list">
              {course.features.map(f => (
                <div key={f} className="feature-item"><Icon size={18}>✓</Icon> {f}</div>
              ))}
            </div>

            <div className="curriculum">
              <h3>Curriculum</h3>
              {course.curriculum.map((item, i) => (
                <div key={i} className="curriculum-item">
                  <span>{item.title}</span>
                  <span>{item.lessons} lessons</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="buy-card">
              {status === 'unlocked' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>You own this course</h3>
                  </div>
                  <a href={course.zipUrl} className="btn btn-primary" style={{ width: '100%' }} target="_blank" rel="noopener noreferrer">
                    ⬇ Download Course ZIP
                  </a>
                  <p className="buy-note">Download the complete video course and learn offline.</p>
                </>
              ) : (
                <>
                  <div className="price">
                    <span className="price-current">₹{course.price}</span>
                    <span className="price-old">₹{course.originalPrice}</span>
                  </div>
                  <p className="save">You save {savePercent}% today</p>

                  <a href={RAZORPAY_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}>
                    1. Pay with Razorpay
                  </a>

                  <button className="btn btn-outline" style={{ width: '100%', marginBottom: 10 }} onClick={() => addToCart(course)} disabled={inCart}>
                    {inCart ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>

                  {user && status !== 'pending' && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                        After payment, enter Transaction ID (optional) and request access:
                      </p>
                      <input
                        type="text"
                        placeholder="Transaction ID (optional)"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        style={{ ...inputStyle, marginBottom: 10 }}
                      />
                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRequestAccess}>
                        2. I have paid – Request Access
                      </button>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(34,211,238,0.1)', borderRadius: 10, fontSize: 14, color: 'var(--accent)' }}>
                      ⏳ Access request submitted. We will unlock it soon after verifying payment.
                    </div>
                  )}

                  {message && <p className="buy-note" style={{ marginTop: 12 }}>{message}</p>}

                  {!user && (
                    <p className="buy-note">
                      <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link> to request access after payment.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================== CART ======================
function CartPage({ cart, removeFromCart, total, clearCart }) {
  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse our courses and start learning today.</p>
        <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="cart-layout">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Your Cart</h2>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-icon" style={{ background: `${item.color}22`, color: item.color }}>
                  {item.icon === 'html' && '</>'}
                  {item.icon === 'css' && '#{}'}
                  {item.icon === 'js' && 'JS'}
                  {item.icon === 'react' && '⚛'}
                  {item.icon === 'node' && 'N'}
                  {item.icon === 'sql' && 'SQL'}
                </div>
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <p>Lifetime access + ZIP download</p>
                </div>
                <div className="cart-item-price">₹{item.price}</div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <Icon size={18}>🗑</Icon>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({cart.length} items)</span><span>₹{total}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
          <a href={RAZORPAY_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
            Pay ₹{total} with Razorpay
          </a>
          <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={clearCart}>Clear Cart</button>
          <p className="buy-note" style={{ marginTop: 16 }}>
            After payment, go to the course page and click “I have paid – Request Access”.
          </p>
        </div>
      </div>
    </div>
  )
}

// ====================== ADMIN PAGE ======================
function AdminPage() {
  const [pending, setPending] = useState([])
  const [secret, setSecret] = useState('')
  const [msg, setMsg] = useState('')

  const loadPending = () => {
    fetch(`${API_URL}/api/admin/pending`)
      .then(res => res.json())
      .then(setPending)
  }

  useEffect(() => { loadPending() }, [])

  const unlock = async (purchaseId) => {
    const res = await fetch(`${API_URL}/api/admin/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId, secret })
    })
    const data = await res.json()
    setMsg(data.message || data.error)
    loadPending()
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin – Unlock Courses</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Secret key is: <code>devmaster2026</code></p>

      <input
        type="password"
        placeholder="Enter admin secret"
        value={secret}
        onChange={e => setSecret(e.target.value)}
        style={{ ...inputStyle, maxWidth: 300, marginBottom: 24 }}
      />

      {msg && <p style={{ marginBottom: 16, color: 'var(--accent)' }}>{msg}</p>}

      {pending.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No pending requests</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map(p => {
            const course = courses.find(c => c.id === p.courseId)
            return (
              <div key={p.id} className="cart-item">
                <div style={{ flex: 1 }}>
                  <h4>{course?.title || p.courseId}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    User ID: {p.userId} | Txn: {p.transactionId || '—'} | {new Date(p.requestedAt).toLocaleString()}
                  </p>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => unlock(p.id)}>
                  Unlock
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ====================== MAIN APP ======================
export default function App() {
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart()

  return (
    <AuthProvider>
      <div className="app">
        <Navbar cartCount={cart.length} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:id" element={<CourseDetail addToCart={addToCart} cart={cart} />} />
            <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} total={total} clearCart={clearCart} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}