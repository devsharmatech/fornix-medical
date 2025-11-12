"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Activity,
  TrendingUp,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  FileText,
  BarChart3,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Custom Stat Card Component
const StatCard = ({ title, value, icon: Icon, change, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative group"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
    {change && (
      <div className={`flex items-center gap-1 text-xs ${
        change.startsWith('+') ? 'text-green-600' : 'text-red-600'
      }`}>
        <TrendingUp className="w-3 h-3" />
        <span>{change} from last month</span>
      </div>
    )}
  </motion.div>
);

// Graph Card Component
const GraphCard = ({ title, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
    {children}
  </motion.div>
);

// Recent Activity Item
const ActivityItem = ({ icon: Icon, title, description, time, color }) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
      <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{time}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    users: 1258, 
    doctors: 42, 
    subjects: 156,
    activeUsers: 234 
  });
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const userGrowthData = [
    { month: 'Jan', users: 400, doctors: 24 },
    { month: 'Feb', users: 600, doctors: 30 },
    { month: 'Mar', users: 800, doctors: 35 },
    { month: 'Apr', users: 1000, doctors: 38 },
    { month: 'May', users: 1200, doctors: 40 },
    { month: 'Jun', users: 1258, doctors: 42 },
  ];

  const performanceData = [
    { day: 'Mon', efficiency: 85, productivity: 78 },
    { day: 'Tue', efficiency: 92, productivity: 85 },
    { day: 'Wed', efficiency: 78, productivity: 82 },
    { day: 'Thu', efficiency: 88, productivity: 79 },
    { day: 'Fri', efficiency: 95, productivity: 88 },
    { day: 'Sat', efficiency: 65, productivity: 70 },
    { day: 'Sun', efficiency: 70, productivity: 65 },
  ];

  const subjectDistributionData = [
    { name: 'Mathematics', value: 35 },
    { name: 'Science', value: 25 },
    { name: 'Literature', value: 20 },
    { name: 'History', value: 15 },
    { name: 'Arts', value: 5 },
  ];

  const activityData = [
    { icon: Users, title: 'New User Registration', description: 'John Doe joined the platform', time: '2 min ago', color: 'blue' },
    { icon: FileText, title: 'Document Uploaded', description: 'Medical report uploaded by Dr. Smith', time: '1 hour ago', color: 'green' },
    { icon: BarChart3, title: 'Report Generated', description: 'Monthly analytics report ready', time: '2 hours ago', color: 'purple' },
    { icon: UserCheck, title: 'Doctor Verified', description: 'Dr. Johnson verification completed', time: '4 hours ago', color: 'orange' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    async function loadStats() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error("Error loading stats:", error);
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600 dark:text-gray-400 font-medium text-sm"
          >
            Loading Dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your platform summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar className="w-4 h-4 inline mr-2" />
            Last 30 days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={Users}
          change="+12%"
          color="blue"
          delay={0.1}
        />
        <StatCard 
          title="Doctors" 
          value={stats.doctors} 
          icon={UserCheck}
          change="+5%"
          color="green"
          delay={0.2}
        />
        <StatCard 
          title="Subjects" 
          value={stats.subjects} 
          icon={BookOpen}
          change="+8%"
          color="purple"
          delay={0.3}
        />
        <StatCard 
          title="Active Now" 
          value={stats.activeUsers} 
          icon={Activity}
          change="+15%"
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <GraphCard title="User Growth Analytics">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stroke="#0088FE" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="doctors" stroke="#00C49F" fillOpacity={1} fill="url(#colorDoctors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GraphCard>

        {/* Performance Metrics */}
        <GraphCard title="Performance Metrics">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#0088FE" radius={[2, 2, 0, 0]} />
                <Bar dataKey="productivity" fill="#00C49F" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GraphCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Distribution */}
        <GraphCard title="Subject Distribution" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subjectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GraphCard>

        {/* Recent Activity */}
        <GraphCard title="Recent Activity" className="lg:col-span-2">
          <div className="space-y-1">
            {activityData.map((activity, index) => (
              <ActivityItem
                key={index}
                icon={activity.icon}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                color={activity.color}
              />
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            View All Activity
          </button>
        </GraphCard>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Content Views</p>
              <p className="text-2xl font-bold mt-1">12.4K</p>
              <p className="text-blue-100 text-xs mt-1">+18% from last month</p>
            </div>
            <Eye className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Downloads</p>
              <p className="text-2xl font-bold mt-1">2.3K</p>
              <p className="text-green-100 text-xs mt-1">+8% from last month</p>
            </div>
            <Download className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg. Session</p>
              <p className="text-2xl font-bold mt-1">24m</p>
              <p className="text-purple-100 text-xs mt-1">+12% from last month</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
}