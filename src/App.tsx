import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MentorsPage from './pages/MentorsPage';
import TasksPage from './pages/TasksPage';
// Auth pages removed per request
import './styles/App.css';

const App: React.FC = () => {
  return (
        (
          <div className="App">
            <nav className="navbar">
              <div className="nav-brand">
                <div className="nav-logo">DNX</div>
              </div>
              <div className="nav-links">
                <Link to="/" className="nav-link">Overview</Link>
                <Link to="/tasks" className="nav-link">Task</Link>
                <Link to="/mentors" className="nav-link">Mentors</Link>
                <Link to="/messages" className="nav-link">Message</Link>
                <Link to="/settings" className="nav-link">Settings</Link>
              </div>
              <div className="nav-user">
                <div className="notification-icon">🔔</div>
                <div className="user-avatar">👤</div>
              </div>
            </nav>

            <div className="main-content">
              <Routes>
                <Route path="/" element={<div className="overview-page">Overview Page</div>} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/mentors" element={<MentorsPage />} />
                <Route path="/messages" element={<div className="messages-page">Messages Page</div>} />
                <Route path="/settings" element={<div className="settings-page">Settings Page</div>} />
              </Routes>
            </div>

            <div className="help-center">
              <div className="help-icon">❓</div>
              <div className="help-content">
                <h3>Help Center</h3>
                <p>Having Trouble in Learning. Please contact us for more questions.</p>
                <button className="help-button">Go To Help Center</button>
              </div>
            </div>
          </div>
        )
  );
};

export default App;

/* Inline auth pages removed; using dedicated files in src/pages */
/* function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error(`Login failed: ${res.status}`);
      const data = await res.json();
      login(data.token, data.user);
      navigate('/');
    } catch (e: any) { setError(e.message); }
  }
  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'user' | 'mentor'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [first_name, setFirst] = useState('');
  const [last_name, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [mentor, setMentor] = useState({ profession: '', specialization: '', bio: '', company: '', position: '', location: '', hourly_rate: 0, currency: 'USD', availability_status: 'available' });
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      const body: any = { email, password, username, first_name, last_name, phone, role };
      if (role === 'mentor') Object.assign(body, mentor);
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Signup failed: ${res.status}`);
      const data = await res.json();
      login(data.token, data.user);
      navigate('/');
    } catch (e: any) { setError(e.message); }
  }
  return (
    <div>
      <h1>Signup</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <select value={role} onChange={e => setRole(e.target.value as any)}>
          <option value="user">User</option>
          <option value="mentor">Mentor</option>
        </select>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="First name" value={first_name} onChange={e => setFirst(e.target.value)} />
        <input placeholder="Last name" value={last_name} onChange={e => setLast(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        {role === 'mentor' && (
          <div>
            <input placeholder="Profession" value={mentor.profession} onChange={e => setMentor({ ...mentor, profession: e.target.value })} />
            <input placeholder="Specialization" value={mentor.specialization} onChange={e => setMentor({ ...mentor, specialization: e.target.value })} />
            <input placeholder="Bio" value={mentor.bio} onChange={e => setMentor({ ...mentor, bio: e.target.value })} />
            <input placeholder="Company" value={mentor.company} onChange={e => setMentor({ ...mentor, company: e.target.value })} />
            <input placeholder="Position" value={mentor.position} onChange={e => setMentor({ ...mentor, position: e.target.value })} />
            <input placeholder="Location" value={mentor.location} onChange={e => setMentor({ ...mentor, location: e.target.value })} />
            <input placeholder="Hourly Rate" type="number" value={mentor.hourly_rate} onChange={e => setMentor({ ...mentor, hourly_rate: Number(e.target.value) })} />
            <input placeholder="Currency" value={mentor.currency} onChange={e => setMentor({ ...mentor, currency: e.target.value })} />
            <select value={mentor.availability_status} onChange={e => setMentor({ ...mentor, availability_status: e.target.value })}>
              <option value="available">available</option>
              <option value="busy">busy</option>
              <option value="away">away</option>
            </select>
          </div>
        )}
        <button type="submit">Create account</button>
      </form>
    </div>
  );
} */

