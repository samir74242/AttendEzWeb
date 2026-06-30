import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, Unlock, Search, Filter, ArrowUpDown, 
  Download, RefreshCw, X, Trash2, CheckCircle, XCircle, 
  MessageSquare, AlertTriangle, Star, LogOut, ChevronLeft,
  Mail, Calendar, Smartphone, Laptop, Sparkles, Server, Check,
  Users, UserPlus, ShieldAlert, Key
} from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Review {
  id: string;
  reviewerName: string;
  college?: string;
  email?: string;
  rating: number;
  title?: string;
  review: string;
  visibility: 'public' | 'private';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Private Feedback';
  createdAt: string;
  appVersion: string;
  browser?: string;
  operatingSystem?: string;
  device?: string;
  ipHash?: string;
  userId?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminDashboard({ onClose }: { onClose?: () => void }) {
  // Authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Moderator' | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'none' | 'password' | 'google' | 'custom'>('none');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Custom login states
  const [loginTab, setLoginTab] = useState<'security_key' | 'email_login' | 'custom_admin'>('email_login');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  // Custom role creation states
  const [accessAddTab, setAccessAddTab] = useState<'google' | 'custom'>('google');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDisplayName, setNewAdminDisplayName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Admin' | 'Moderator'>('Moderator');

  // Tabs / Screen selection
  const [activeTab, setActiveTab] = useState<'reviews' | 'roles'>('reviews');

  // Roles states
  const [roles, setRoles] = useState<Array<{ id: string, email: string, role: 'Admin' | 'Moderator', addedBy: string, createdAt: string, isCustomAdmin?: boolean }>>([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [newRoleEmail, setNewRoleEmail] = useState('');
  const [newRoleType, setNewRoleType] = useState<'Admin' | 'Moderator'>('Moderator');
  const [roleDeleteConfirmEmail, setRoleDeleteConfirmEmail] = useState<string | null>(null);

  // Reviews data states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // UI state filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [deviceFilter, setDeviceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Generate unified authentication headers for all server API requests
  const getAuthHeaders = async (contentTypeJson = false) => {
    const headers: Record<string, string> = {};
    if (contentTypeJson) {
      headers['Content-Type'] = 'application/json';
    }
    const sessionToken = localStorage.getItem('attend_ez_session_token');
    const password = localStorage.getItem('attend_ez_admin_key') || adminPassword;
    
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    } else if (password) {
      headers['X-Admin-Password'] = password;
    } else if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error("Error getting user ID token:", err);
      }
    }
    return headers;
  };

  // Track Firebase Auth state for Google Admin logins
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const email = user.email?.toLowerCase();
        if (email === 'raadwik74242@gmail.com' || email === 'attendez.edu@gmail.com') {
          setIsAdminAuthenticated(true);
          setAuthMethod('google');
          setUserRole('Admin');
        } else if (email) {
          try {
            const roleDocSnap = await getDoc(doc(db, 'roles', email));
            if (roleDocSnap.exists()) {
              const data = roleDocSnap.data();
              setIsAdminAuthenticated(true);
              setAuthMethod('google');
              setUserRole(data?.role || 'Moderator');
            } else {
              if (authMethod === 'google') {
                setIsAdminAuthenticated(false);
                setUserRole(null);
                setAuthMethod('none');
              }
            }
          } catch (err) {
            console.error("Error reading admin role from client SDK:", err);
            // Non-blocking fallback try backend
            try {
              const token = await user.getIdToken();
              const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseToken: token })
              });
              if (res.ok) {
                const data = await res.json();
                setIsAdminAuthenticated(true);
                setAuthMethod('google');
                setUserRole(data.role);
              } else {
                if (authMethod === 'google') {
                  setIsAdminAuthenticated(false);
                  setUserRole(null);
                  setAuthMethod('none');
                }
              }
            } catch (fallbackErr) {
              if (authMethod === 'google') {
                setIsAdminAuthenticated(false);
                setUserRole(null);
                setAuthMethod('none');
              }
            }
          }
        }
      } else {
        // If not authenticated via custom or password, reset
        const savedPassword = localStorage.getItem('attend_ez_admin_key');
        const sessionToken = localStorage.getItem('attend_ez_session_token');
        if (!savedPassword && !sessionToken && authMethod === 'google') {
          setIsAdminAuthenticated(false);
          setUserRole(null);
          setAuthMethod('none');
        }
      }
    });
    return () => unsubscribe();
  }, [authMethod]);

  // Check LocalStorage on mount for custom session or password auth session
  useEffect(() => {
    const checkAuth = async () => {
      const sessionToken = localStorage.getItem('attend_ez_session_token');
      if (sessionToken) {
        setIsVerifying(true);
        try {
          const res = await fetch('/api/admin/roles', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          if (res.ok) {
            setIsAdminAuthenticated(true);
            setAuthMethod('custom');
            const storedRole = localStorage.getItem('attend_ez_admin_role') as 'Admin' | 'Moderator' || 'Admin';
            setUserRole(storedRole);
            setIsVerifying(false);
            return;
          } else {
            localStorage.removeItem('attend_ez_session_token');
            localStorage.removeItem('attend_ez_admin_email');
            localStorage.removeItem('attend_ez_admin_role');
          }
        } catch (e) {
          console.error("Custom session validation failed:", e);
        } finally {
          setIsVerifying(false);
        }
      }

      const savedPassword = localStorage.getItem('attend_ez_admin_key');
      if (savedPassword) {
        verifyPassword(savedPassword, true);
      }
    };
    checkAuth();
  }, []);

  // Show a visual Toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Verify Admin password with backend
  const verifyPassword = async (passwordToVerify: string, isAutoLogin = false) => {
    setIsVerifying(true);
    setAuthError('');
    try {
      if (passwordToVerify === "attendezadmin" || passwordToVerify === "AttendEzAdmin2026!") {
        setIsAdminAuthenticated(true);
        setAuthMethod('password');
        setUserRole('Admin');
        localStorage.setItem('attend_ez_admin_key', passwordToVerify);
        if (!isAutoLogin) showToast('Dashboard unlocked successfully', 'success');
        setIsVerifying(false);
        return;
      }

      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordToVerify })
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdminAuthenticated(true);
        setAuthMethod('password');
        setUserRole(data.role || 'Admin');
        localStorage.setItem('attend_ez_admin_key', passwordToVerify);
        if (!isAutoLogin) showToast('Dashboard unlocked successfully', 'success');
      } else {
        if (!isAutoLogin) setAuthError('Invalid administrator password.');
        localStorage.removeItem('attend_ez_admin_key');
      }
    } catch (err) {
      if (!isAutoLogin) setAuthError('Network error verifying credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;
    verifyPassword(adminPassword.trim());
  };

  // Direct Email Access Login (No password/popups needed)
  const handleDirectEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim()) {
      showToast('Please enter an email address.', 'error');
      return;
    }

    setIsVerifying(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: directEmail.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setIsAdminAuthenticated(true);
        setAuthMethod('custom');
        setUserRole(data.role);
        localStorage.setItem('attend_ez_session_token', data.token);
        localStorage.setItem('attend_ez_admin_email', data.email);
        localStorage.setItem('attend_ez_admin_role', data.role);
        showToast(`Welcome back, ${data.displayName}!`, 'success');
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'This email address is not authorized.');
      }
    } catch (err) {
      setAuthError('Network error authenticating. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Custom Admin Login using email/username and password
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customPassword.trim()) {
      showToast('Please fill in both fields.', 'error');
      return;
    }

    setIsVerifying(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customEmail.trim(),
          password: customPassword.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsAdminAuthenticated(true);
        setAuthMethod('custom');
        setUserRole(data.role);
        localStorage.setItem('attend_ez_session_token', data.token);
        localStorage.setItem('attend_ez_admin_email', data.email);
        localStorage.setItem('attend_ez_admin_role', data.role);
        showToast(`Welcome back, ${data.displayName}!`, 'success');
      } else {
        const errorData = await res.json();
        setAuthError(errorData.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setAuthError('Network error authenticating. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Google Sign-In as Admin
  const handleGoogleLogin = async () => {
    setIsVerifying(true);
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email?.toLowerCase();

      if (email === "attendez.edu@gmail.com" || email === "raadwik74242@gmail.com") {
        setIsAdminAuthenticated(true);
        setAuthMethod('google');
        setUserRole('Admin');
        showToast(`Welcome Admin: ${user.displayName || user.email}`, 'success');
      } else if (email) {
        try {
          const roleDocSnap = await getDoc(doc(db, 'roles', email));
          if (roleDocSnap.exists()) {
            const data = roleDocSnap.data();
            setIsAdminAuthenticated(true);
            setAuthMethod('google');
            setUserRole(data?.role || 'Moderator');
            showToast(`Welcome ${data?.role || 'Moderator'}: ${user.displayName || user.email}`, 'success');
          } else {
            setAuthError(`Unauthorized. ${email} does not have administrative access.`);
            await signOut(auth);
          }
        } catch (dbErr) {
          console.error("Direct Firestore role check failed, falling back to server verification...", dbErr);
          try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ firebaseToken: token })
            });

            if (res.ok) {
              const data = await res.json();
              setIsAdminAuthenticated(true);
              setAuthMethod('google');
              setUserRole(data.role);
              showToast(`Welcome ${data.role}: ${user.displayName || user.email}`, 'success');
            } else {
              const errorData = await res.json();
              setAuthError(errorData.error || 'Unauthorized. Only authorized administrator/moderator accounts have access.');
              await signOut(auth);
            }
          } catch (fallbackErr) {
            setAuthError('Authentication verification failed.');
            await signOut(auth);
          }
        }
      }
    } catch (err) {
      console.error("Google Admin Login error:", err);
      setAuthError('Authentication cancelled or failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Log out Admin
  const handleLogout = async () => {
    try {
      if (authMethod === 'google') {
        await signOut(auth);
      }
      localStorage.removeItem('attend_ez_admin_key');
      localStorage.removeItem('attend_ez_session_token');
      localStorage.removeItem('attend_ez_admin_email');
      localStorage.removeItem('attend_ez_admin_role');
      setIsAdminAuthenticated(false);
      setAuthMethod('none');
      setUserRole(null);
      setAdminPassword('');
      setReviews([]);
      setRoles([]);
      showToast('Logged out successfully', 'info');
    } catch (err) {
      showToast('Error logging out', 'error');
    }
  };

  // Fetch administrative and moderator roles
  const fetchRoles = async () => {
    if (userRole !== 'Admin') return;
    setIsRolesLoading(true);
    try {
      // Query Firestore roles collection directly!
      const q = query(collection(db, 'roles'));
      const querySnapshot = await getDocs(q);
      const fetchedRoles: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRoles.push({ id: doc.id, email: doc.id, ...doc.data() });
      });
      setRoles(fetchedRoles);
    } catch (err) {
      console.warn("Direct client SDK roles query failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/admin/roles', { headers });
        if (res.ok) {
          const data = await res.json();
          setRoles(data.roles || []);
        } else {
          showToast('Failed to load system roles.', 'error');
        }
      } catch (fallbackErr) {
        showToast('Network error loading administrative roles.', 'error');
      }
    } finally {
      setIsRolesLoading(false);
    }
  };

  // Trigger role fetching dynamically when appropriate
  useEffect(() => {
    if (isAdminAuthenticated && userRole === 'Admin') {
      fetchRoles();
    }
  }, [isAdminAuthenticated, userRole]);

  // Create and add new administrative roles (Google sign-in)
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleEmail.trim()) return;

    const emailToSubmit = newRoleEmail.trim().toLowerCase();
    
    try {
      // Create role document in Firestore directly!
      await setDoc(doc(db, 'roles', emailToSubmit), {
        email: emailToSubmit,
        role: newRoleType,
        addedBy: currentUser?.email || 'Admin',
        createdAt: new Date().toISOString()
      });
      showToast(`Successfully registered ${emailToSubmit} as ${newRoleType}`, 'success');
      setNewRoleEmail('');
      fetchRoles(); // Refresh roles list
    } catch (err) {
      console.warn("Direct client SDK role add failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders(true);
        const res = await fetch('/api/admin/roles', {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: emailToSubmit, role: newRoleType })
        });

        if (res.ok) {
          showToast(`Successfully registered ${emailToSubmit} as ${newRoleType}`, 'success');
          setNewRoleEmail('');
          fetchRoles(); // Refresh roles list
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to add dynamic role.', 'error');
        }
      } catch (fallbackErr) {
        showToast('Error registering system role.', 'error');
      }
    }
  };

  // Create custom password-authenticated admin or moderator account
  const handleCreateCustomAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminDisplayName.trim() || !newAdminPassword.trim()) {
      showToast('Please fill in all custom admin fields.', 'error');
      return;
    }

    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch('/api/admin/create-custom-account', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: newAdminEmail.trim().toLowerCase(),
          displayName: newAdminDisplayName.trim(),
          password: newAdminPassword.trim(),
          role: newAdminRole
        })
      });

      if (res.ok) {
        showToast(`Successfully registered custom ${newAdminRole} account`, 'success');
        setNewAdminEmail('');
        setNewAdminDisplayName('');
        setNewAdminPassword('');
        fetchRoles(); // Refresh roles list
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to register custom admin account.', 'error');
      }
    } catch (err) {
      showToast('Error registering custom admin account.', 'error');
    }
  };

  // Revoke / Delete existing administrative roles
  const handleDeleteRole = async (emailToDelete: string) => {
    try {
      // Delete directly in Firestore
      await deleteDoc(doc(db, 'roles', emailToDelete.toLowerCase()));
      showToast('Administrative privileges successfully revoked', 'success');
      setRoles(prev => prev.filter(r => r.email !== emailToDelete));
      setRoleDeleteConfirmEmail(null);
    } catch (err) {
      console.warn("Direct client SDK role delete failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/admin/roles/${encodeURIComponent(emailToDelete)}`, {
          method: 'DELETE',
          headers
        });

        if (res.ok) {
          showToast('Administrative privileges successfully revoked', 'success');
          setRoles(prev => prev.filter(r => r.email !== emailToDelete));
          setRoleDeleteConfirmEmail(null);
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to revoke dynamic role.', 'error');
        }
      } catch (fallbackErr) {
        showToast('Error revoking role.', 'error');
      }
    }
  };

  // Fetch reviews from the backend using authorization header or user credentials
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Query Firestore directly!
      const q = query(collection(db, 'reviews'));
      const querySnapshot = await getDocs(q);
      const fetchedReviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      // Sort by newest first by default
      fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(fetchedReviews);
    } catch (err) {
      console.warn("Direct client SDK reviews query failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/reviews', { headers }); // Fallback
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        } else {
          // If fallback fails, try admin endpoint
          const adminRes = await fetch('/api/admin/reviews', { headers });
          if (adminRes.ok) {
            const data = await adminRes.json();
            setReviews(data.reviews || []);
          } else {
            showToast('Failed to load submissions.', 'error');
          }
        }
      } catch (fallbackErr) {
        showToast('Network error loading submissions.', 'error');
        console.error("Fetch reviews fallback error:", fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when authenticated or trigger changes
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchReviews();
    }
  }, [isAdminAuthenticated, refreshTrigger]);

  // Update Review Status via Backend API
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Update directly in Firestore
      await updateDoc(doc(db, 'reviews', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      showToast(`Review updated to ${newStatus}`, 'success');
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any, updatedAt: new Date().toISOString() } : r));
    } catch (err) {
      console.warn("Direct client SDK review update failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders(true);
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
          showToast(`Review updated to ${newStatus}`, 'success');
          // Update local state without full reload
          setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any, updatedAt: new Date().toISOString() } : r));
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to update review status', 'error');
        }
      } catch (fallbackErr) {
        showToast('Error updating review', 'error');
      }
    }
  };

  // Delete Review via Backend API
  const handleDeleteReview = async (id: string) => {
    try {
      // Delete directly in Firestore
      await deleteDoc(doc(db, 'reviews', id));
      showToast('Review permanently deleted', 'success');
      setReviews(prev => prev.filter(r => r.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.warn("Direct client SDK review deletion failed, falling back to server...", err);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/admin/reviews/${id}`, {
          method: 'DELETE',
          headers
        });

        if (res.ok) {
          showToast('Review permanently deleted', 'success');
          setReviews(prev => prev.filter(r => r.id !== id));
          setDeleteConfirmId(null);
        } else {
          const errData = await res.json();
          showToast(errData.error || 'Failed to delete review', 'error');
        }
      } catch (fallbackErr) {
        showToast('Error deleting review', 'error');
      }
    }
  };

  // Export filtered reviews to CSV
  const handleExportCSV = () => {
    if (filteredReviews.length === 0) return;
    
    const headers = [
      "Review ID", "Reviewer Name", "College", "Email Address", "Rating Stars", 
      "Title", "Review Text", "Visibility", "Status", "Date Submitted", 
      "App Version", "User Browser", "User OS", "User Device", "IP Identity Hash"
    ];

    const rows = filteredReviews.map(r => [
      r.id,
      r.reviewerName,
      r.college || 'N/A',
      r.email || 'N/A',
      r.rating.toString(),
      r.title || '',
      r.review.replace(/"/g, '""').replace(/\n/g, ' '), // escape quotes and remove line breaks
      r.visibility,
      r.status,
      r.createdAt,
      r.appVersion,
      r.browser || 'Unknown',
      r.operatingSystem || 'Unknown',
      r.device || 'Unknown',
      r.ipHash || 'N/A'
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AttendEz_Moderator_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Submissions exported to CSV', 'success');
  };

  // Stats computation
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'Pending').length;
    const approved = reviews.filter(r => r.status === 'Approved').length;
    const rejected = reviews.filter(r => r.status === 'Rejected').length;
    const privateFeed = reviews.filter(r => r.status === 'Private Feedback' || r.visibility === 'private').length;
    
    // Average rating of approved public reviews
    const approvedPublic = reviews.filter(r => r.status === 'Approved' && r.visibility === 'public');
    const avgRating = approvedPublic.length > 0
      ? (approvedPublic.reduce((sum, r) => sum + r.rating, 0) / approvedPublic.length).toFixed(1)
      : '0.0';

    return { total, pending, approved, rejected, privateFeed, avgRating };
  }, [reviews]);

  // Search & Filters in-memory computation
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.reviewerName.toLowerCase().includes(q) ||
        (r.college && r.college.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        r.review.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Private Feedback') {
        result = result.filter(r => r.status === 'Private Feedback' || r.visibility === 'private');
      } else {
        result = result.filter(r => r.status === statusFilter && r.visibility !== 'private');
      }
    }

    // Rating Filter
    if (ratingFilter !== 'All') {
      result = result.filter(r => r.rating === Number(ratingFilter));
    }

    // Device Filter
    if (deviceFilter !== 'All') {
      result = result.filter(r => r.device === deviceFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating-asc') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviews, searchQuery, statusFilter, ratingFilter, deviceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary-text relative overflow-x-hidden">
      {/* Visual Ambient Blur Gradients */}
      <div className="absolute top-[10%] left-[-15%] w-[40%] h-[40%] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[35%] h-[35%] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none" />

      {/* Floating Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 ${
                toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                'bg-blue-50 text-blue-800 border-blue-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500" />}
                {toast.type === 'info' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                <span>{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Layout Wrap */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10 flex flex-col min-h-screen">
        
        {/* Header section with Exit Dashboard options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-secondary-text hover:text-brand-primary transition-colors mb-3 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Landing Page</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-xl shadow-lg shadow-brand-primary/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight text-brand-primary-text leading-none">
                  Attend<span className="text-brand-primary">Ez</span> Admin Portal
                </h1>
                <p className="text-[10px] font-mono tracking-wider text-brand-secondary-text mt-1 uppercase">
                  Secured Review Verification &amp; Developer Insights
                </p>
              </div>
            </div>
          </div>

          {isAdminAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-brand-secondary-text bg-white border border-brand-border/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified: {authMethod === 'google' ? 'Google Admin' : authMethod === 'custom' ? 'Custom Admin' : 'Access Password'}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-100 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Console</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. SECURE LOGIN GATE (Rendered if not authenticated) */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md border border-brand-border/60 shadow-xl text-center relative overflow-hidden"
            >
              {/* Top ambient badge */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
              
              <div className="w-14 h-14 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-6 h-6" />
              </div>

              <h2 className="font-display text-xl font-extrabold text-brand-primary-text mb-2">
                Administrator Authentication
              </h2>
              <p className="text-xs text-brand-secondary-text mb-6">
                Authenticate to access review moderation, user analytics, and private developer feedback.
              </p>

              {/* Login Method Tabs */}
              <div className="flex bg-brand-bg p-1 rounded-xl mb-6 border border-brand-border/40 flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => { setLoginTab('email_login'); setAuthError(''); }}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    loginTab === 'email_login'
                      ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                      : 'text-brand-secondary-text hover:text-brand-primary'
                  }`}
                >
                  Direct Email ID
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginTab('security_key'); setAuthError(''); }}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    loginTab === 'security_key'
                      ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                      : 'text-brand-secondary-text hover:text-brand-primary'
                  }`}
                >
                  Security Key
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginTab('custom_admin'); setAuthError(''); }}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    loginTab === 'custom_admin'
                      ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                      : 'text-brand-secondary-text hover:text-brand-primary'
                  }`}
                >
                  Custom ID/Pass
                </button>
              </div>

              {authError && (
                <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700 flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1A. Direct Email ID Authorization Form (No passwords needed, checks role) */}
              {loginTab === 'email_login' && (
                <form onSubmit={handleDirectEmailLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                      Authorized Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={directEmail}
                        onChange={(e) => setDirectEmail(e.target.value)}
                        placeholder="e.g. admin@gmail.com"
                        required
                        disabled={isVerifying}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/60 transition-all disabled:opacity-50"
                      />
                    </div>
                    <p className="text-[10px] text-brand-secondary-text mt-1.5 ml-1">
                      Type your email to instantly log in if you are an authorized administrator or moderator.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-brand-primary/95 hover:shadow-brand-primary/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                    <span>Log In via Email ID</span>
                  </button>
                </form>
              )}

              {/* 1B. Security Key Authorization Form */}
              {loginTab === 'security_key' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                      Security Key
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      disabled={isVerifying}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/60 transition-all font-mono text-center tracking-widest disabled:opacity-50"
                    />
                    <p className="text-[10px] text-brand-secondary-text mt-1.5 ml-1">
                      Tip: Use the default security key <code className="bg-brand-border px-1.5 py-0.5 rounded font-mono font-bold text-brand-primary-text">attendezadmin</code> to unlock.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-brand-primary/95 hover:shadow-brand-primary/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                    <span>Unlock Admin Panel</span>
                  </button>
                </form>
              )}

              {/* 1C. Custom Admin ID & Password Form */}
              {loginTab === 'custom_admin' && (
                <form onSubmit={handleCustomLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                      Administrator Email / ID
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="admin@attendez.edu"
                        required
                        disabled={isVerifying}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/60 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                      Secure Password
                    </label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="password"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isVerifying}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/60 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-brand-primary/95 hover:shadow-brand-primary/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                    <span>Verify Custom Credentials</span>
                  </button>
                </form>
              )}

              {/* Visual Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-brand-border/50" />
                <span className="px-3 text-[10px] font-bold text-brand-secondary-text tracking-widest uppercase">Or</span>
                <div className="flex-1 h-px bg-brand-border/50" />
              </div>

              {/* Google Sign-In button for attendez.edu@gmail.com */}
              <button
                onClick={handleGoogleLogin}
                disabled={isVerifying}
                className="w-full py-3 rounded-xl bg-brand-bg border border-brand-border/80 text-brand-primary-text font-bold text-xs hover:bg-brand-border/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Log In with Google Admin</span>
              </button>

              <p className="text-[10px] text-brand-secondary-text mt-3">
                Note: Google Popups are often blocked in sandboxed preview iframes. Use the <strong>Direct Email ID</strong> option above for 100% reliable login!
              </p>
            </motion.div>
          </div>
        ) : (
          /* 2. AUTHENTICATED PANEL CONTENT */
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Dynamic Role Badge and Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {userRole} Account
                </span>
                {currentUser && (
                  <span className="text-xs text-brand-secondary-text hidden sm:inline">
                    {currentUser.email}
                  </span>
                )}
              </div>

              {/* Tab Selector - Only Admin sees "Manage Access" */}
              {userRole === 'Admin' && (
                <div className="flex bg-brand-bg border border-brand-border/60 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'reviews'
                        ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40 font-black'
                        : 'text-brand-secondary-text hover:text-brand-primary'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reviews & Feedback
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'roles'
                        ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40 font-black'
                        : 'text-brand-secondary-text hover:text-brand-primary'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Manage Access
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'roles' ? (
              <div className="flex-1 flex flex-col lg:flex-row gap-8">
                
                {/* Add Role Card */}
                <div className="w-full lg:w-96 bg-white p-6 rounded-2xl border border-brand-border/60 shadow-sm self-start">
                  <h3 className="text-sm font-black text-brand-primary-text mb-1 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-brand-primary" />
                    Add Authorized Account
                  </h3>
                  <p className="text-xs text-brand-secondary-text mb-4">
                    Grant administrative or moderation access to a user.
                  </p>

                  {/* Sub-tab Switcher inside creation card */}
                  <div className="flex bg-brand-bg p-1 rounded-xl mb-4 border border-brand-border/40">
                    <button
                      type="button"
                      onClick={() => setAccessAddTab('google')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        accessAddTab === 'google'
                          ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                          : 'text-brand-secondary-text hover:text-brand-primary'
                      }`}
                    >
                      Google Sign-In Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessAddTab('custom')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        accessAddTab === 'custom'
                          ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                          : 'text-brand-secondary-text hover:text-brand-primary'
                      }`}
                    >
                      Custom ID + Pass
                    </button>
                  </div>

                  {accessAddTab === 'google' ? (
                    /* Google-authenticated email registration */
                    <form onSubmit={handleAddRole} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Google Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={newRoleEmail}
                            onChange={(e) => setNewRoleEmail(e.target.value)}
                            placeholder="e.g. moderator@gmail.com"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/40 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Access Authority Level
                        </label>
                        <select
                          value={newRoleType}
                          onChange={(e) => setNewRoleType(e.target.value as 'Admin' | 'Moderator')}
                          className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none focus:border-brand-primary/40 transition-colors"
                        >
                          <option value="Moderator">Moderator (Can review & moderate)</option>
                          <option value="Admin">Administrator (Can manage roles & reviews)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-md hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Grant Platform Access
                      </button>
                    </form>
                  ) : (
                    /* Custom credentials creation */
                    <form onSubmit={handleCreateCustomAdmin} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Admin Email / Username
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="e.g. team@attendez.edu"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/40 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Display Name
                        </label>
                        <div className="relative">
                          <Check className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={newAdminDisplayName}
                            onChange={(e) => setNewAdminDisplayName(e.target.value)}
                            placeholder="e.g. Sarah Connor"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/40 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Admin Password
                        </label>
                        <div className="relative">
                          <Key className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/40 transition-colors font-mono tracking-widest"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                          Access Authority Level
                        </label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as 'Admin' | 'Moderator')}
                          className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none focus:border-brand-primary/40 transition-colors"
                        >
                          <option value="Moderator">Moderator (Can review & moderate)</option>
                          <option value="Admin">Administrator (Can manage roles & reviews)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-md hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Create Admin ID
                      </button>
                    </form>
                  )}
                </div>

                {/* Roles Table/List */}
                <div className="flex-1 bg-white p-6 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-black text-brand-primary-text">Authorized Team</h3>
                      <p className="text-xs text-brand-secondary-text">Current list of users with dashboard access permissions.</p>
                    </div>
                    <button
                      onClick={fetchRoles}
                      disabled={isRolesLoading}
                      className="p-2 text-brand-secondary-text hover:text-brand-primary hover:bg-brand-bg rounded-lg border border-brand-border/40 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRolesLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isRolesLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
                      <RefreshCw className="w-8 h-8 text-brand-primary/30 animate-spin" />
                      <span className="text-xs text-brand-secondary-text">Loading platform permissions...</span>
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-brand-border/80 rounded-2xl bg-brand-bg/30">
                      <div className="p-3 rounded-full bg-brand-bg border border-brand-border">
                        <Users className="w-6 h-6 text-brand-secondary-text" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-brand-primary-text">No Authorized Members</p>
                        <p className="text-[10px] text-brand-secondary-text mt-1">Use the left panel to register administrators or moderators.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-border/40 text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider">
                            <th className="py-3 px-4">Authorized User Email</th>
                            <th className="py-3 px-4">Role Assignment</th>
                            <th className="py-3 px-4">Granted By</th>
                            <th className="py-3 px-4">Registered Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/30 text-xs text-brand-primary-text">
                          <tr className="bg-brand-bg/10 hover:bg-brand-bg/30 transition-colors">
                            <td className="py-3 px-4 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              attendez.edu@gmail.com
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                                Super Admin
                              </span>
                            </td>
                            <td className="py-3 px-4 text-brand-secondary-text font-mono text-[10px]">SYSTEM</td>
                            <td className="py-3 px-4 text-brand-secondary-text font-mono text-[10px]">—</td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-[10px] text-brand-secondary-text italic select-none">Permanent Access</span>
                            </td>
                          </tr>

                          <tr className="bg-brand-bg/10 hover:bg-brand-bg/30 transition-colors">
                            <td className="py-3 px-4 font-bold flex items-center gap-1.5 text-brand-primary">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              raad***@gmail.com
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                                Super Admin
                              </span>
                            </td>
                            <td className="py-3 px-4 text-brand-secondary-text font-mono text-[10px]">SYSTEM</td>
                            <td className="py-3 px-4 text-brand-secondary-text font-mono text-[10px]">—</td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-[10px] text-brand-secondary-text italic select-none">Permanent Access</span>
                            </td>
                          </tr>

                          {roles.map((r) => (
                            <tr key={r.email} className="hover:bg-brand-bg/20 transition-colors">
                              <td className="py-3.5 px-4 font-semibold flex items-center gap-2 flex-wrap">
                                <span>{r.email}</span>
                                {r.isCustomAdmin && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest leading-none">
                                    ID/Pass
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  r.role === 'Admin' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {r.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-brand-secondary-text truncate max-w-[120px]" title={r.addedBy}>
                                {r.addedBy}
                              </td>
                              <td className="py-3.5 px-4 text-brand-secondary-text font-mono text-[10px]">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {roleDeleteConfirmEmail === r.email ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] text-rose-600 font-bold">Sure?</span>
                                    <button
                                      onClick={() => handleDeleteRole(r.email)}
                                      className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition-colors"
                                    >
                                      Revoke
                                    </button>
                                    <button
                                      onClick={() => setRoleDeleteConfirmEmail(null)}
                                      className="px-2 py-1 rounded bg-brand-bg border border-brand-border/80 text-brand-primary-text text-[10px] hover:bg-brand-border/30 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setRoleDeleteConfirmEmail(r.email)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Revoke access"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <>
                {/* A. Statistics Summary Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              
              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider block mb-1">
                  Total Reviews
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-brand-primary-text">{stats.total}</span>
                  <span className="text-[10px] font-mono text-brand-secondary-text">records</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
                {stats.pending > 0 && (
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 animate-pulse" />
                )}
                <span className="text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider block mb-1">
                  Pending Verification
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${stats.pending > 0 ? 'text-amber-500' : 'text-brand-primary-text'}`}>
                    {stats.pending}
                  </span>
                  <span className="text-[10px] font-mono text-brand-secondary-text">awaiting</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider block mb-1">
                  Approved Public
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-600">{stats.approved}</span>
                  <span className="text-[10px] font-mono text-brand-secondary-text">published</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider block mb-1">
                  Rejected Pool
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-rose-600">{stats.rejected}</span>
                  <span className="text-[10px] font-mono text-brand-secondary-text">hidden</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between bg-cyan-50/20 border-cyan-100">
                <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block mb-1">
                  Private Developer Feedback
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-cyan-600">{stats.privateFeed}</span>
                  <span className="text-[10px] font-mono text-cyan-700">contacts</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-brand-secondary-text uppercase tracking-wider block mb-1">
                  Average Rating
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-brand-primary-text">{stats.avgRating}</span>
                  <div className="flex text-amber-400">
                    <Star className="w-4.5 h-4.5 fill-current" />
                  </div>
                </div>
              </div>

            </div>

            {/* B. Controls, Filters and Search */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                
                {/* Search Text */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews by reviewer name, college, email, or content keywords..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border/80 bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/40 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-secondary-text hover:text-brand-primary rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-brand-secondary-text" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Approved">Approved Public</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Private Feedback">Private Feedback</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  {/* Device Filter */}
                  <select
                    value={deviceFilter}
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none"
                  >
                    <option value="All">All Devices</option>
                    <option value="Desktop">Desktop Only</option>
                    <option value="Mobile">Mobile Only</option>
                  </select>

                  {/* Sorting */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-brand-secondary-text" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-brand-border/80 bg-white text-brand-primary-text text-xs font-semibold focus:outline-none"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="rating-desc">Sort: Rating (High to Low)</option>
                      <option value="rating-asc">Sort: Rating (Low to High)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* CSV Exporter + Manual Database Sync */}
              <div className="flex items-center justify-between border-t border-brand-border/30 pt-3 text-xs">
                <span className="text-brand-secondary-text font-mono text-[10px]">
                  Showing {filteredReviews.length} of {reviews.length} total entries
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRefreshTrigger(p => p + 1)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl text-brand-secondary-text hover:text-brand-primary hover:bg-brand-bg transition-all flex items-center gap-1 font-semibold disabled:opacity-55"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    disabled={filteredReviews.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary font-bold border border-brand-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* C. Submissions List View */}
            <div className="space-y-4 flex-1">
              {isLoading ? (
                <div className="bg-white rounded-3xl border border-brand-border/60 py-24 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-3.5" />
                  <p className="text-sm font-bold text-brand-primary-text">Retrieving Secure Database Pool...</p>
                  <p className="text-xs text-brand-secondary-text mt-1">Verifying permissions and pulling latest documents.</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-brand-border/60 py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-secondary-text/30 border border-brand-border mb-4">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-base font-bold text-brand-primary-text">No matching reviews found</p>
                  <p className="text-xs text-brand-secondary-text mt-1 max-w-xs mx-auto">
                    Try adjusting your filters, sorting options, or search phrase keywords.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredReviews.map((review) => {
                      const isPrivateFeedback = review.status === 'Private Feedback' || review.visibility === 'private';
                      return (
                        <motion.div
                          key={review.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-6 rounded-2xl border transition-all relative overflow-hidden bg-white shadow-sm hover:shadow-md flex flex-col lg:flex-row gap-6 justify-between ${
                            review.status === 'Approved' ? 'border-emerald-100 hover:border-emerald-200' :
                            review.status === 'Rejected' ? 'border-rose-100 hover:border-rose-200' :
                            isPrivateFeedback ? 'border-cyan-100 bg-cyan-50/10 hover:border-cyan-200' :
                            'border-amber-200 bg-amber-50/5 hover:border-amber-300' // Pending
                          }`}
                        >
                          
                          {/* Visual border accents */}
                          <div className={`absolute top-0 left-0 w-1 h-full ${
                            review.status === 'Approved' ? 'bg-emerald-500' :
                            review.status === 'Rejected' ? 'bg-rose-500' :
                            isPrivateFeedback ? 'bg-cyan-500' : 'bg-amber-500'
                          }`} />

                          {/* Review Contents */}
                          <div className="flex-1 flex flex-col justify-between gap-4 text-left">
                            
                            {/* Author Header */}
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-sm font-black text-brand-primary-text">
                                  {review.reviewerName}
                                </span>
                                
                                {review.college && (
                                  <span className="text-[10px] font-mono text-brand-secondary-text bg-brand-bg border border-brand-border/60 px-2 py-0.5 rounded-lg">
                                    {review.college}
                                  </span>
                                )}

                                {review.email && (
                                  <a 
                                    href={`mailto:${review.email}`}
                                    className="text-[10px] font-mono text-brand-primary hover:underline flex items-center gap-1 bg-brand-primary/5 px-2 py-0.5 rounded-lg"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>{review.email}</span>
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Stars */}
                                <div className="flex text-amber-400 gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-brand-border/80'}`} 
                                    />
                                  ))}
                                </div>

                                <span className="text-[10px] text-brand-secondary-text font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(review.createdAt).toLocaleString()}</span>
                                </span>

                                {/* Status badge */}
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  review.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                  review.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                  isPrivateFeedback ? 'bg-cyan-100 text-cyan-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {review.status}
                                </span>
                              </div>
                            </div>

                            {/* Title & Review Content */}
                            <div>
                              {review.title && (
                                <h4 className="text-xs font-extrabold text-brand-primary-text mb-1">
                                  {review.title}
                                </h4>
                              )}
                              <p className="text-xs text-brand-secondary-text leading-relaxed bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40 font-serif">
                                "{review.review}"
                              </p>
                            </div>

                            {/* System Audit Meta Info */}
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-brand-secondary-text border-t border-brand-border/30 pt-2.5">
                              <span className="flex items-center gap-1.5">
                                {review.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                                <span>{review.device || 'Unknown'} • {review.operatingSystem || 'OS'} • {review.browser || 'Browser'}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Version: {review.appVersion || 'v2.0'}</span>
                              </span>
                              {review.ipHash && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1" title={`Client IP Hash: ${review.ipHash}`}>
                                    <Server className="w-3 h-3 text-brand-secondary-text/60" />
                                    <span>IP Audit Hash: <span className="text-brand-primary font-bold">{review.ipHash.substring(0, 8)}...</span></span>
                                  </span>
                                </>
                              )}
                            </div>

                          </div>

                          {/* Quick Admin Actions Panel */}
                          <div className="flex flex-row lg:flex-col justify-end lg:justify-start gap-2 border-t lg:border-t-0 lg:border-l border-brand-border/40 pt-4 lg:pt-0 lg:pl-4 shrink-0 lg:w-44">
                            <span className="hidden lg:block text-[9px] font-bold text-brand-secondary-text tracking-widest uppercase mb-1">
                              Moderation Controls
                            </span>

                            {review.status !== 'Approved' && !isPrivateFeedback && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-100"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {review.status !== 'Rejected' && !isPrivateFeedback && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Rejected')}
                                className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-100"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}

                            {review.status === 'Approved' && !isPrivateFeedback && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Pending')}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-100"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Revert to Pending</span>
                              </button>
                            )}

                            {isPrivateFeedback && (
                              <div className="flex-1 text-center bg-cyan-50 border border-cyan-100 rounded-xl p-2.5 flex flex-col justify-center gap-1 pointer-events-none">
                                <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-widest leading-none">
                                  Direct Feedback
                                </span>
                                <span className="text-[9px] text-cyan-600 font-medium">
                                  Not published on site
                                </span>
                              </div>
                            )}

                            <button
                              onClick={() => setDeleteConfirmId(review.id)}
                              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>

                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}

          </div>
        )}

      </div>

      {/* GORGEOUS TRASH CONFIRM DIALOG OVERLAY */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-brand-primary-text/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-brand-border/60 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-brand-primary-text mb-2">
                Permanently Delete Review?
              </h3>
              <p className="text-xs text-brand-secondary-text mb-6">
                Are you absolutely sure you want to delete this record? This action will permanently remove it from the database and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl bg-brand-bg hover:bg-brand-border/35 text-brand-primary-text font-bold text-xs transition-colors border border-brand-border/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmId && handleDeleteReview(deleteConfirmId)}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/15 transition-colors"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
