import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Bell, 
  LogOut, 
  Plus, 
  Search,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { api } from './lib/api';
import { Project, Task, DashboardStats, Notification, User } from './types';

// --- Components ---

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(setNotifications).catch(console.error);
    }
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E9ECEF] flex flex-col fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">ProTrack</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-black text-white'
                    : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-black'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#E9ECEF]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E9ECEF] flex items-center justify-center font-bold text-[#495057]">
              {user?.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-[#6C757D] uppercase tracking-wider font-bold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-[#DC3545] font-medium hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[#6C757D] text-sm">
            <span>Assignment</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-black font-medium">Enterprise Management</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-[#6C757D] hover:text-black transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC3545] rounded-full border-2 border-white"></span>
              )}
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-80 bg-white border border-[#E9ECEF] rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#E9ECEF] bg-[#F8F9FA]">
                      <p className="text-sm font-bold uppercase tracking-widest text-[#6C757D]">Recent Alerts</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors last:border-0 text-left">
                            <p className="text-sm text-[#495057]">{n.message}</p>
                            <p className="text-[10px] text-[#ADB5BD] mt-1 uppercase font-bold">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-[#ADB5BD]">
                          <p className="text-sm italic">Clear as a mountain lake.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// --- Pages ---

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    api.get('/stats').then(setStats).catch(console.error);
    api.get('/tasks').then(setTasks).catch(console.error);
  }, []);

  if (!stats) return <div className="animate-pulse">Loading engine...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Overview</h2>
          <p className="text-[#6C757D] mt-1 italic serif">System diagnostics and resource allocation.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E9ECEF] text-xs font-bold uppercase tracking-widest text-[#6C757D]">
          <Clock className="w-3.5 h-3.5" />
          Real-time Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Projects', value: stats.projects, color: 'text-black' },
          { label: 'Pending Tasks', value: stats.tasks, color: 'text-[#6C757D]' },
          { label: 'Completion Rate', value: `${Math.round((stats.completed / (stats.tasks || 1)) * 100)}%`, color: 'text-black' },
        ].map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.label} 
            className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm flex flex-col justify-between"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#6C757D]">{item.label}</p>
            <p className={`text-4xl font-bold mt-4 ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-8">Throughput Velocity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ADB5BD', fontSize: 11 }}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#ADB5BD', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="black" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: 'black', strokeWidth: 2, stroke: 'white' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-4">Urgent Deadlines</p>
          <div className="space-y-4">
            {tasks.filter(t => t.status !== 'DONE').slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors border-b border-[#F8F9FA]">
                <div>
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="text-xs text-[#6C757D] italic">{task.project_title}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                     task.status === 'TODO' ? 'bg-[#FFF9DB] text-[#F08C00]' : 'bg-[#E7F5FF] text-[#228BE6]'
                   }`}>
                     {task.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  useEffect(() => {
    api.get('/projects').then(setProjects).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      const updated = await api.get('/projects');
      setProjects(updated);
      setShowModal(false);
      setNewProject({ title: '', description: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Portfolios</h2>
          <p className="text-[#6C757D] mt-1 font-mono text-xs uppercase tracking-widest">Master record of operational entities.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-tight hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Initialize Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm hover:border-black transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-[#F8F9FA] rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-[#ADB5BD] group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-sm text-[#6C757D] line-clamp-2 italic mb-6">{project.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[#F8F9FA]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ADB5BD]">ID: PRJ-{project.id}00</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E9ECEF] px-2 py-0.5 rounded-full">{project.status}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 italic serif">New Mission</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Project Label</label>
                  <input 
                    required
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm" 
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Scope & Objectives</label>
                  <textarea 
                    rows={4}
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm resize-none" 
                    placeholder="Describe the mission parameters..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E9ECEF] font-bold text-sm hover:bg-[#F8F9FA] transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Authorize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ project_id: '', title: '', description: '', assignee_id: '', due_date: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [t, p, u] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users')
      ]);
      setTasks(t);
      setProjects(p);
      setUsers(u);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      refreshData();
      setShowModal(false);
      setNewTask({ project_id: '', title: '', description: '', assignee_id: '', due_date: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/tasks/${id}`, { status });
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deployment Matrix</h2>
          <p className="text-[#6C757D] mt-1 font-mono text-xs uppercase tracking-widest">Discrete operational components grid.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm tracking-tight hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Queue Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((column) => (
          <div key={column} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6C757D]">{column.replace('_', ' ')}</h3>
              <span className="bg-[#E9ECEF] text-[#495057] px-2 py-0.5 rounded-full text-[10px] font-bold">
                {tasks.filter(t => t.status === column).length}
              </span>
            </div>
            <div className="bg-[#F1F3F5]/50 p-3 rounded-2xl flex-1 space-y-3 min-h-[500px]">
              {tasks.filter(t => t.status === column).map((task) => (
                <motion.div 
                  layoutId={`${task.id}`}
                  key={task.id} 
                  className="bg-white p-4 rounded-xl border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <p className="text-[10px] uppercase font-bold text-[#ADB5BD] mb-1 italic">{task.project_title}</p>
                  <h4 className="font-bold text-sm mb-2">{task.title}</h4>
                  <p className="text-xs text-[#6C757D] mb-4 line-clamp-2">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold" title={task.assignee_name}>
                      {task.assignee_name?.[0]}
                    </div>
                    
                    <select 
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="text-[10px] font-bold uppercase tracking-wider bg-[#F8F9FA] border-none focus:ring-0 cursor-pointer text-[#6C757D] hover:text-black"
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 italic serif">New Unit</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Entity Label</label>
                  <input 
                    required
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm" 
                    placeholder="Operation title..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Parent Project</label>
                  <select 
                    required
                    value={newTask.project_id}
                    onChange={e => setNewTask({...newTask, project_id: e.target.value})}
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm"
                  >
                    <option value="">Select Target Portfolio...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Assign Agent</label>
                    <select 
                      value={newTask.assignee_id}
                      onChange={e => setNewTask({...newTask, assignee_id: e.target.value})}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm"
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2">Deadline</label>
                    <input 
                      type="date"
                      value={newTask.due_date}
                      onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E9ECEF] font-bold text-sm hover:bg-[#F8F9FA] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Commit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await api.post(endpoint, formData);
      if (isLogin) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-10 rounded-[2rem] border border-[#E9ECEF] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
           <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center rotate-3">
             <span className="text-white font-black text-xl">P</span>
           </div>
        </div>

        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ADB5BD] mb-4">Enterprise Protocol</p>
          <h2 className="text-4xl font-bold tracking-tighter mb-2">{isLogin ? 'Welcome Back' : 'Access Request'}</h2>
          <p className="text-[#6C757D] italic serif">System authentication for ProTrack v1.0.4</p>
        </div>

        {error && (
          <div className="bg-[#FFF5F5] border border-[#FFE3E3] p-4 rounded-xl mb-6 flex items-center gap-3 text-[#DC3545] text-sm animate-pulse">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2 px-1">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm" 
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2 px-1">Email Endpoint</label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm" 
              placeholder="user@enterprise.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2 px-1">Authorization Cipher</label>
            <input 
              required
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm" 
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
               <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] block mb-2 px-1">Access Level</label>
               <select 
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value})}
                 className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors font-medium text-sm appearance-none"
               >
                 <option value="USER">Standard Operator</option>
                 <option value="ADMIN">System Administrator</option>
               </select>
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm tracking-tight hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
          >
            {isLogin ? 'Authenticate' : 'Submit Application'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#ADB5BD]">
          {isLogin ? "No access portal?" : "Existing credential?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-black font-bold hover:underline"
          >
            {isLogin ? 'Register Endpoint' : 'Sign In'}
          </button>
        </p>

        <div className="mt-12 pt-12 border-t border-[#F1F3F5] text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#DEE2E6]">Protected by Enterprise Core Architecture</p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Protected Route ---

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-[0.3em]">Booting System...</div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Layout><Projects /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout><Tasks /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
