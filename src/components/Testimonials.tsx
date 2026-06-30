import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quote, Star, ShieldCheck, Mail, CheckCircle, 
  AlertTriangle, Lock, Unlock, Eye, EyeOff, Trash2, 
  Search, SlidersHorizontal, ArrowUpDown, Download, 
  HelpCircle, Sparkles, RefreshCw, X, ChevronRight, MessageSquare
} from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, query, where, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Browser/OS detection helpers
function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
}

function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Macintosh") || ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "OS";
}

function detectDevice() {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|Phone/i.test(ua)) return "Mobile";
  return "Desktop";
}

interface Review {
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
}

export default function Testimonials() {
  // Tabs: 'read' | 'write'
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read');
  
  // Google Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    getIdToken: () => Promise<string>;
    isBypass?: boolean;
  } | null>(() => {
    const saved = localStorage.getItem('attend_ez_demo_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          ...u,
          getIdToken: async () => `bypass_token:${u.email}:${u.displayName}`
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [reviewLoginTab, setReviewLoginTab] = useState<'direct_email' | 'google'>('direct_email');
  const [bypassEmailInput, setBypassEmailInput] = useState('');
  const [bypassNameInput, setBypassNameInput] = useState('');
  
  // Public Approved Reviews State
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    email: '',
    rating: 5,
    title: '',
    review: '',
    visibility: 'public' as 'public' | 'private',
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [captchaChallenge, setCaptchaChallenge] = useState<{ id: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean; message: string; isPrivate: boolean }>({
    isOpen: false,
    message: '',
    isPrivate: false
  });

  // Admin Dashboard States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  
  // Admin Filter / Search States
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('All');
  const [adminRatingFilter, setAdminRatingFilter] = useState<string>('All');
  const [adminVisibilityFilter, setAdminVisibilityFilter] = useState<string>('All');
  const [adminSortBy, setAdminSortBy] = useState<string>('newest');

  // Combined active user
  const effectiveUser = customUser || currentUser;

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user && !customUser) {
        setFormData(prev => ({
          ...prev,
          name: prev.name || user.displayName || '',
          email: user.email || ''
        }));
      }
    });
    return () => unsubscribe();
  }, [customUser]);

  // Direct Email Bypass Sign-In Handler
  const handleBypassSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const email = bypassEmailInput.trim().toLowerCase();
    if (!email) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    const name = bypassNameInput.trim();
    const u = {
      uid: `bypass-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email,
      displayName: name || email.split('@')[0],
      photoURL: null,
      isBypass: true
    };

    localStorage.setItem('attend_ez_demo_user', JSON.stringify(u));
    setCustomUser({
      ...u,
      getIdToken: async () => `bypass_token:${u.email}:${u.displayName}`
    });

    setFormData(prev => ({
      ...prev,
      name: prev.name || u.displayName,
      email: u.email
    }));
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setSubmitError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.message && err.message.includes("unauthorized-domain")) {
        setSubmitError(
          "Firebase Domain Error (auth/unauthorized-domain): Your Cloud Run domain has not been added to your Firebase project's Authorized Domains list. Under 'Authentication' > 'Settings' > 'Authorized Domains', please add your current dev and preview URL domains. Or, simply use the 'Direct Email ID' option on the left to sign in instantly!"
        );
      } else {
        setSubmitError(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      setCustomUser(null);
      localStorage.removeItem('attend_ez_demo_user');
      await signOut(auth);
      setFormData(prev => ({
        ...prev,
        name: '',
        email: ''
      }));
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  // Fetch approved public reviews
  const fetchPublicReviews = async () => {
    setIsLoadingPublic(true);
    try {
      const q = query(
        collection(db, 'reviews'),
        where('status', '==', 'Approved'),
        where('visibility', '==', 'public')
      );
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      // Sort by createdAt desc in-memory
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPublicReviews(reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingPublic(false);
    }
  };

  // Fetch Captcha challenge
  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaChallenge(data);
      }
    } catch (err) {
      console.error("Error fetching captcha:", err);
    }
  };

  useEffect(() => {
    fetchPublicReviews();
    fetchCaptcha();
  }, []);

  // Submit Review Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    if (!effectiveUser) {
      setSubmitError('Please sign in to submit a review.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.review.trim()) {
      setSubmitError('Please write your detailed review.');
      setIsSubmitting(false);
      return;
    }

    if (!captchaAnswer) {
      setSubmitError('Please answer the anti-spam bot question.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for duplicate reviews on the client side first safely
      try {
        const dupQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', effectiveUser.uid),
          where('review', '==', formData.review.trim())
        );
        const dupSnapshot = await getDocs(dupQuery);
        if (!dupSnapshot.empty) {
          setSubmitError("Duplicate review detected. You've already submitted this content.");
          setIsSubmitting(false);
          return;
        }
      } catch (dupErr) {
        console.warn("Non-blocking duplicate check skipped:", dupErr);
      }

      const token = await effectiveUser.getIdToken();
      const payload = {
        ...formData,
        email: effectiveUser.email, // Always send the verified email from Auth
        firebaseToken: token,
        captchaId: captchaChallenge?.id,
        captchaAnswer: captchaAnswer,
        browser: detectBrowser(),
        operatingSystem: detectOS(),
        device: detectDevice(),
        appVersion: 'v2.0' // Current detected app version
      };

      const res = await fetch('/api/reviews/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Safe to write directly to Firestore using client-side SDK (authorized by rules)
        const reviewId = doc(collection(db, 'reviews')).id;
        const submissionDate = new Date().toISOString();
        const finalReviewerName = (formData.name && formData.name.trim()) || effectiveUser.displayName || "Student";

        const reviewDoc = {
          id: reviewId,
          reviewerName: finalReviewerName,
          college: formData.college ? formData.college.trim() : "",
          email: effectiveUser.email,
          rating: Number(formData.rating),
          title: formData.title ? formData.title.trim() : "",
          review: formData.review.trim(),
          visibility: formData.visibility,
          status: formData.visibility === 'private' ? 'Private Feedback' : 'Pending',
          createdAt: submissionDate,
          updatedAt: submissionDate,
          appVersion: 'v2.0',
          browser: detectBrowser(),
          operatingSystem: detectOS(),
          device: detectDevice(),
          ipHash: data.ipHash,
          userId: effectiveUser.uid
        };

        await setDoc(doc(db, 'reviews', reviewId), reviewDoc);

        // Success dialog
        setSuccessDialog({
          isOpen: true,
          message: data.message,
          isPrivate: formData.visibility === 'private'
        });
        
        // Reset form but preserve verified credentials
        setFormData({
          name: effectiveUser.displayName || '',
          college: '',
          email: effectiveUser.email || '',
          rating: 5,
          title: '',
          review: '',
          visibility: 'public'
        });
        setCaptchaAnswer('');
        fetchCaptcha();
      } else {
        setSubmitError(data.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError('An error occurred while submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Verification
  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        setIsAdminAuthenticated(true);
        fetchAdminReviews();
      } else {
        setAdminAuthError('Invalid administrator password.');
      }
    } catch (err) {
      setAdminAuthError('Network error verifying credentials.');
    }
  };

  // Fetch admin review pool
  const fetchAdminReviews = async () => {
    setIsLoadingAdmin(true);
    try {
      // Check the local cache of adminReviews or query directly if authorized as admin
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      let reviews: Review[] = [];
      querySnapshot.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
      });

      // Filter in-memory
      if (adminStatusFilter !== 'All') {
        reviews = reviews.filter(r => r.status === adminStatusFilter);
      }
      if (adminRatingFilter !== 'All') {
        reviews = reviews.filter(r => r.rating === Number(adminRatingFilter));
      }
      if (adminVisibilityFilter !== 'All') {
        reviews = reviews.filter(r => r.visibility === adminVisibilityFilter);
      }

      // Sort in-memory
      if (adminSortBy === 'newest') {
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (adminSortBy === 'oldest') {
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (adminSortBy === 'rating-desc') {
        reviews.sort((a, b) => b.rating - a.rating);
      } else if (adminSortBy === 'rating-asc') {
        reviews.sort((a, b) => a.rating - b.rating);
      }

      setAdminReviews(reviews);
    } catch (err) {
      console.error("Error loading admin reviews directly:", err);
      setAdminReviews([]);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // Refetch admin reviews whenever filters change
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminReviews();
    }
  }, [adminStatusFilter, adminRatingFilter, adminVisibilityFilter, adminSortBy, isAdminAuthenticated]);

  // Update Review Status (Approve/Reject)
  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      const docRef = doc(db, 'reviews', id);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchAdminReviews();
      fetchPublicReviews(); // update landing page in real-time
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this review? This action cannot be undone.")) {
      return;
    }
    try {
      const docRef = doc(db, 'reviews', id);
      await deleteDoc(docRef);
      fetchAdminReviews();
      fetchPublicReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // Export reviews to CSV file
  const handleExportCSV = () => {
    if (adminReviews.length === 0) return;
    
    const headers = ["Review ID", "Name", "College", "Email", "Rating", "Title", "Review", "Visibility", "Status", "Created At", "App Version", "Browser", "OS", "Device"];
    const rows = adminReviews.map(r => [
      r.id,
      r.reviewerName,
      r.college || '',
      r.email || '',
      r.rating.toString(),
      r.title || '',
      r.review.replace(/"/g, '""'), // escape quotes
      r.visibility,
      r.status,
      r.createdAt,
      r.appVersion,
      r.browser || '',
      r.operatingSystem || '',
      r.device || ''
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AttendEz_Reviews_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search filtered reviews in-memory for admin search bar
  const filteredAdminReviews = adminReviews.filter(review => {
    if (!adminSearch) return true;
    const searchLower = adminSearch.toLowerCase();
    return (
      review.reviewerName.toLowerCase().includes(searchLower) ||
      (review.college && review.college.toLowerCase().includes(searchLower)) ||
      (review.title && review.title.toLowerCase().includes(searchLower)) ||
      review.review.toLowerCase().includes(searchLower) ||
      (review.email && review.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <section className="py-24 bg-brand-bg relative overflow-hidden z-10 border-b border-brand-border/30" id="reviews">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[30%] left-[-10%] w-[35%] h-[35%] rounded-full bg-brand-secondary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-[-10%] w-[30%] h-[30%] rounded-full bg-brand-accent/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header with integrated Administrator portal hook */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <span className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-2 block">
            STUDENT REVIEWS & FEEDBACK
          </span>
          <h2 className="font-display text-3xl sm:text-4.5xl font-extrabold tracking-tight text-brand-primary-text leading-[1.1] mb-4">
            Hear from Our Users <br />
            or Share Your Experience
          </h2>
          <p className="text-base sm:text-lg text-brand-secondary-text">
            Read verified public reviews or submit private feedback to help us build a better attendance manager for students.
          </p>

          {/* Hidden Admin Moderator access hook */}
          <div className="absolute -top-4 right-0">
            <button 
              onClick={() => { window.location.hash = '#secret-admin-portal'; }}
              className="p-2 rounded-xl text-brand-secondary-text/40 hover:text-brand-primary hover:bg-brand-primary/5 transition-all text-xs flex items-center gap-1.5 font-mono"
              title="Administrator Panel"
              id="admin-moderator-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Dev Console</span>
            </button>
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-brand-border/50 shadow-sm relative z-20">
            <button
              onClick={() => setActiveTab('read')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'read' 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                  : 'text-brand-secondary-text hover:text-brand-primary-text'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Public Reviews ({publicReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'write' 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                  : 'text-brand-secondary-text hover:text-brand-primary-text'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Review / Feedback</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Read Approved Public Reviews */}
        {activeTab === 'read' && (
          <div className="relative">
            {isLoadingPublic ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-4" />
                <p className="text-sm text-brand-secondary-text">Loading verified student reviews...</p>
              </div>
            ) : publicReviews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto text-center py-16 px-6 bg-white border border-brand-border/40 rounded-3xl shadow-sm"
              >
                <HelpCircle className="w-12 h-12 text-brand-primary/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-primary-text mb-2">No public reviews yet</h3>
                <p className="text-sm text-brand-secondary-text mb-6">
                  Be the first to share your experience with AttendEz!
                </p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 hover:-translate-y-0.5 transition-all"
                >
                  Write the First Review
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicReviews.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 border border-brand-border/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 text-brand-primary/5 group-hover:text-brand-primary/8 transition-colors">
                      <Quote className="w-12 h-12 transform scale-x-[-1]" />
                    </div>

                    <div>
                      {/* Rating stars & app version */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 shrink-0 ${
                                i < test.rating 
                                  ? 'fill-brand-warning text-brand-warning' 
                                  : 'text-brand-bg fill-brand-bg border-brand-border'
                              }`} 
                            />
                          ))}
                        </div>
                        {test.appVersion && (
                          <span className="text-[9px] font-mono bg-brand-bg text-brand-secondary-text px-2 py-0.5 rounded-md font-semibold">
                            App v{test.appVersion}
                          </span>
                        )}
                      </div>

                      {/* Optional Title */}
                      {test.title && (
                        <h4 className="text-sm font-bold text-brand-primary-text mb-2 line-clamp-1">
                          {test.title}
                        </h4>
                      )}

                      {/* Detailed Review */}
                      <p className="text-xs text-brand-secondary-text font-normal leading-relaxed italic mb-6">
                        "{test.review}"
                      </p>
                    </div>

                    {/* Reviewer Meta */}
                    <div className="flex items-center gap-3 pt-4 border-t border-brand-bg">
                      {/* User fallback avatar circle */}
                      <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center font-bold text-brand-primary text-sm shrink-0 border border-brand-primary/10">
                        {test.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <h5 className="text-xs font-bold text-brand-primary-text truncate">{test.reviewerName}</h5>
                        {test.college && (
                          <span className="text-[10px] text-brand-primary font-mono font-semibold truncate mt-0.5">
                            {test.college}
                          </span>
                        )}
                        <span className="text-[9px] text-brand-secondary-text/70 mt-0.5">
                          {new Date(test.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Write/Share Review Form */}
        {activeTab === 'write' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white border border-brand-border/40 rounded-3xl p-8 sm:p-10 shadow-lg relative"
          >
            <div className="absolute top-6 right-6 text-brand-primary/5">
              <Sparkles className="w-16 h-16" />
            </div>

            <h3 className="text-xl font-bold text-brand-primary-text mb-2 text-left">Write a Review</h3>
            <p className="text-xs text-brand-secondary-text mb-8 text-left">
              Share your honest feedback. Your review helps other students decide to try AttendEz and helps us improve!
            </p>

            {!effectiveUser ? (
              <div className="py-6 space-y-6">
                {/* Switcher Tabs */}
                <div className="flex bg-brand-bg p-1 rounded-xl max-w-sm mx-auto border border-brand-border/40 gap-1">
                  <button
                    type="button"
                    onClick={() => { setReviewLoginTab('direct_email'); setSubmitError(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      reviewLoginTab === 'direct_email'
                        ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                        : 'text-brand-secondary-text hover:text-brand-primary'
                    }`}
                  >
                    Direct Email ID
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReviewLoginTab('google'); setSubmitError(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      reviewLoginTab === 'google'
                        ? 'bg-white text-brand-primary shadow-sm border border-brand-border/40'
                        : 'text-brand-secondary-text hover:text-brand-primary'
                    }`}
                  >
                    Google Sign-In
                  </button>
                </div>

                {reviewLoginTab === 'direct_email' ? (
                  <form onSubmit={handleBypassSignIn} className="max-w-md mx-auto space-y-4 text-left p-5 border border-brand-border/40 rounded-2xl bg-brand-bg/5 shadow-sm">
                    <h4 className="text-sm font-black text-brand-primary-text mb-1 uppercase tracking-wider text-center">Quick Email Sign-In</h4>
                    <p className="text-[10px] text-brand-secondary-text leading-relaxed mb-4 text-center">
                      Type your email and your name to immediately sign in and submit your review. No popups or authorization domains required!
                    </p>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="email"
                          value={bypassEmailInput}
                          onChange={(e) => setBypassEmailInput(e.target.value)}
                          placeholder="e.g. student@gmail.com"
                          required
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border bg-white text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/60 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-brand-primary-text uppercase tracking-widest mb-1.5 ml-1">
                        Your Name / Alias <span className="text-brand-secondary-text/60 lowercase font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Sparkles className="w-3.5 h-3.5 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={bypassNameInput}
                          onChange={(e) => setBypassNameInput(e.target.value)}
                          placeholder="e.g. Sameer Pandey"
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border bg-white text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/60 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 mt-2 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-md hover:bg-brand-primary/95 hover:shadow-brand-primary/15 transition-all flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Instantly Sign In & Continue</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center space-y-5">
                    <div className="w-12 h-12 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center mx-auto border border-brand-primary/15 shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="text-base font-bold text-brand-primary-text">Google Sign-In</h4>
                      <p className="text-xs text-brand-secondary-text leading-relaxed">
                        Sign in with your Google Account to authorize and submit your review.
                      </p>
                      <p className="text-[10px] text-brand-secondary-text/75 italic">
                        Your email address is confidential and is never shared publicly.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isAuthLoading}
                        className="mx-auto flex items-center gap-3 px-6 py-3 rounded-xl border border-brand-border bg-white hover:bg-brand-bg text-brand-primary-text text-xs font-bold shadow-sm hover:shadow transition-all duration-200 active:scale-95 focus:outline-none"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-.1.85-1.11 2.38l3.32 2.58c1.94-1.78 3.05-4.4 3.05-7.4c0-.28 0-.56-.05-.83z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.97-1.08 7.96-2.9l-3.32-2.58c-1.13.76-2.58 1.21-4.64 1.21c-3.56 0-6.58-2.4-7.66-5.64L1.02 17.2C3.06 21.2 7.2 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M4.34 14.09c-.27-.81-.43-1.68-.43-2.59c0-.91.16-1.78.43-2.59L1.02 6.32C.37 7.63 0 9.27 0 11c0 1.73.37 3.37 1.02 4.68l3.32-2.59z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0C7.2 0 3.06 2.8 1.02 6.8l3.32 2.59c1.08-3.24 4.1-5.64 7.66-5.64z"
                          />
                        </svg>
                        {isAuthLoading ? 'Connecting...' : 'Sign in with Google'}
                      </button>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="text-xs text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 max-w-md mx-auto text-left space-y-1.5 leading-relaxed">
                    <p className="font-bold">Authentication Alert:</p>
                    <p>{submitError}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
                {/* Authenticated user banner */}
                <div className="flex items-center justify-between p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl mb-6">
                  <div className="flex items-center gap-3">
                    {effectiveUser.photoURL ? (
                      <img 
                        src={effectiveUser.photoURL} 
                        alt={effectiveUser.displayName || ''} 
                        className="w-10 h-10 rounded-full border border-brand-primary/20" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                        {(effectiveUser.displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-brand-primary-text">{effectiveUser.displayName || 'Student'}</p>
                      <p className="text-[10px] text-brand-secondary-text">{effectiveUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 underline focus:outline-none"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Name & College Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-2">
                      Reviewer Alias <span className="text-brand-secondary-text/50 lowercase font-normal">(optional, shown publicly)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sameer Pandey"
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border/60 bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-2">
                      College / University <span className="text-brand-secondary-text/50 lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. BITS Pilani"
                      maxLength={80}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border/60 bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Input with verified badge details */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    Email Address <span className="text-brand-success text-[10px] lowercase font-normal flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> verified via {effectiveUser.isBypass ? 'Direct Email' : 'Google'}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={effectiveUser.email || ''}
                      disabled
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-brand-border bg-brand-bg/40 text-brand-secondary-text text-sm cursor-not-allowed"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-secondary-text/60">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-secondary-text/70 mt-1.5 flex items-center gap-1">
                    Your verified email is strictly confidential and is never displayed publicly on our website.
                  </p>
                </div>

                {/* Interactive Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-2">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg hover:bg-brand-bg transition-colors focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-all ${
                            star <= (hoverRating ?? formData.rating)
                              ? 'fill-brand-warning text-brand-warning scale-110'
                              : 'text-brand-border fill-brand-bg'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-brand-secondary-text ml-2">
                      {formData.rating === 5 && '😍 Loved it! Excellent'}
                      {formData.rating === 4 && '😊 Great experience'}
                      {formData.rating === 3 && '😐 Average/Decent'}
                      {formData.rating === 2 && '🙁 Needs improvement'}
                      {formData.rating === 1 && '💩 Poor experience'}
                    </span>
                  </div>
                </div>

                {/* Review Title Input */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-2">
                    Review Title <span className="text-brand-secondary-text/50 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summarize your experience (e.g. Saves me so much math!)"
                    maxLength={80}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border/60 bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
                  />
                </div>

                {/* Detailed Review Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider">
                      Detailed Review <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-secondary-text">
                      {formData.review.length}/2000
                    </span>
                  </div>
                  <textarea
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    placeholder="Write your constructive review or detailed private feedback here... What do you like most about AttendEz? What should we fix?"
                    maxLength={2000}
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border/60 bg-brand-bg text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Privacy/Visibility Options Selector */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary-text uppercase tracking-wider mb-3">
                    Review Destination / Visibility <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Publish Publicly */}
                    <label 
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                        formData.visibility === 'public'
                          ? 'border-brand-primary bg-brand-primary/5 shadow-inner'
                          : 'border-brand-border hover:border-brand-secondary-text'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={() => setFormData({ ...formData, visibility: 'public' })}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🌍</span>
                        <span className="text-xs font-extrabold text-brand-primary-text">Publish Publicly</span>
                      </div>
                      <p className="text-[10px] text-brand-secondary-text leading-relaxed">
                        "I'd like my review to be considered for publication on the AttendEz website." (Saves as pending approval, published only after review)
                      </p>
                    </label>

                    {/* Option 2: Send only to Developer */}
                    <label 
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                        formData.visibility === 'private'
                          ? 'border-brand-primary bg-brand-primary/5 shadow-inner'
                          : 'border-brand-border hover:border-brand-secondary-text'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={() => setFormData({ ...formData, visibility: 'private' })}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔒</span>
                        <span className="text-xs font-extrabold text-brand-primary-text">Send Only to Developer</span>
                      </div>
                      <p className="text-[10px] text-brand-secondary-text leading-relaxed">
                        "This feedback is private and should only be seen by the developer." (Will never appear publicly on the landing page)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Dynamic Bot Protection CAPTCHA challenge */}
                {captchaChallenge && (
                  <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs shrink-0 font-mono">
                        🤖 Security Challenge
                      </span>
                      <span className="text-sm font-bold text-brand-primary-text">{captchaChallenge.question}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Answer"
                        className="w-24 px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="p-2 rounded-xl border border-brand-border bg-white hover:bg-brand-bg text-brand-secondary-text transition-colors"
                        title="Reload Challenge"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Warning */}
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-brand-primary text-white font-extrabold text-sm shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/95 disabled:bg-brand-secondary-text/30 disabled:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Your Review...</span>
                    </>
                  ) : (
                    <span>Submit Feedback</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}

      </div>

      {/* Success Dialog Popup Modal */}
      <AnimatePresence>
        {successDialog.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-brand-border/40 shadow-2xl relative text-center"
            >
              <div className="w-16 h-16 bg-brand-success/15 text-brand-success rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-success/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-extrabold text-brand-primary-text mb-3">Thank you!</h3>
              
              <p className="text-sm text-brand-secondary-text leading-relaxed mb-6">
                {successDialog.message}
              </p>

              <button
                onClick={() => {
                  setSuccessDialog({ ...successDialog, isOpen: false });
                  setActiveTab('read');
                }}
                className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 transition-colors"
              >
                Return to Reviews
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Verification and Moderate Console Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 bg-brand-primary-text/85 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-brand-bg rounded-3xl w-full max-w-6xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="p-6 bg-white border-b border-brand-border/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-brand-primary-text leading-none">AttendEz Admin Moderation Console</h3>
                    <p className="text-[10px] text-brand-secondary-text mt-1.5 font-mono">Status: Connected to Database</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdminOpen(false)}
                  className="p-2 rounded-xl text-brand-secondary-text hover:text-brand-primary hover:bg-brand-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Login screen if not authenticated */}
              {!isAdminAuthenticated ? (
                <div className="p-8 sm:p-12 max-w-md mx-auto text-center flex flex-col justify-center flex-1 my-auto">
                  <div className="w-14 h-14 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-border/60">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-brand-primary-text mb-2">Administrator Password Required</h4>
                  <p className="text-xs text-brand-secondary-text mb-6">
                    Enter the administrator password to manage reviews, read private developer feedback, and export records.
                  </p>
                  <form onSubmit={handleAdminVerify} className="space-y-4 text-left">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password..."
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-brand-border/60 bg-white text-brand-primary-text text-sm focus:outline-none focus:border-brand-primary/50 transition-colors text-center font-mono tracking-widest"
                    />
                    {adminAuthError && (
                      <p className="text-xs text-red-500 font-medium text-center">{adminAuthError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md hover:bg-brand-primary/95 transition-all"
                    >
                      Unlock Admin Console
                    </button>
                  </form>
                </div>
              ) : (
                /* Authenticated Admin Dashboard Layout */
                <div className="flex-1 overflow-hidden flex flex-col">
                  
                  {/* Dashboard filters, actions, searches */}
                  <div className="p-5 bg-white border-b border-brand-border/30 grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0 text-left">
                    {/* Search bar */}
                    <div className="lg:col-span-4 relative">
                      <Search className="w-4 h-4 text-brand-secondary-text absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search by reviewer, college, or text..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-xs focus:outline-none focus:border-brand-primary/45"
                      />
                    </div>

                    {/* Status filter */}
                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => setAdminStatusFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-xs focus:outline-none font-medium"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Approved">Approved Public</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Private Feedback">Private Feedback</option>
                      </select>
                    </div>

                    {/* Rating filter */}
                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <select
                        value={adminRatingFilter}
                        onChange={(e) => setAdminRatingFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-xs focus:outline-none font-medium"
                      >
                        <option value="All">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="lg:col-span-2 flex flex-col gap-1">
                      <select
                        value={adminSortBy}
                        onChange={(e) => setAdminSortBy(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-primary-text text-xs focus:outline-none font-medium"
                      >
                        <option value="newest">Sort: Newest First</option>
                        <option value="oldest">Sort: Oldest First</option>
                      </select>
                    </div>

                    {/* Export Actions */}
                    <div className="lg:col-span-2 flex gap-2">
                      <button
                        onClick={handleExportCSV}
                        disabled={filteredAdminReviews.length === 0}
                        className="w-full py-2.5 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-xs hover:bg-brand-primary/15 transition-all flex items-center justify-center gap-1.5 border border-brand-primary/20 disabled:opacity-40 disabled:hover:bg-brand-primary/10"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* List of submissions */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingAdmin ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-7 h-7 text-brand-primary animate-spin mb-3" />
                        <p className="text-xs text-brand-secondary-text">Fetching submissions pool...</p>
                      </div>
                    ) : filteredAdminReviews.length === 0 ? (
                      <div className="text-center py-20">
                        <HelpCircle className="w-10 h-10 text-brand-secondary-text/30 mx-auto mb-3" />
                        <p className="text-sm font-bold text-brand-primary-text">No matching reviews found</p>
                        <p className="text-xs text-brand-secondary-text mt-1">Try adjusting your filters or search keywords.</p>
                      </div>
                    ) : (
                      filteredAdminReviews.map((review) => (
                        <div 
                          key={review.id}
                          className={`p-5 rounded-2xl border bg-white transition-all text-left flex flex-col sm:flex-row justify-between gap-6 hover:shadow-sm ${
                            review.status === 'Approved' ? 'border-brand-success/20 hover:border-brand-success/30 bg-emerald-50/5' :
                            review.status === 'Rejected' ? 'border-red-500/10 hover:border-red-500/20 bg-rose-50/5' :
                            review.status === 'Private Feedback' ? 'border-brand-accent/20 bg-cyan-50/5' :
                            'border-amber-500/30 bg-amber-500/5 shadow-inner' // Pending Status
                          }`}
                        >
                          {/* Left Column: Review details */}
                          <div className="flex-1 space-y-3">
                            {/* Badges/Meta */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Visibility / Type badge */}
                              {review.visibility === 'private' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/15">
                                  <Lock className="w-2.5 h-2.5" />
                                  Private Feedback
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/15">
                                  <Eye className="w-2.5 h-2.5" />
                                  Public Submission
                                </span>
                              )}

                              {/* Status badge */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                review.status === 'Approved' ? 'bg-brand-success/10 text-brand-success border-brand-success/25' :
                                review.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/15' :
                                review.status === 'Private Feedback' ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/20' :
                                'bg-amber-500/15 text-amber-700 border-amber-500/30' // Pending
                              }`}>
                                {review.status === 'Pending' ? '● Pending Approval' : review.status}
                              </span>

                              {/* Rating stars */}
                              <div className="flex gap-0.5 ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${
                                      i < review.rating ? 'fill-brand-warning text-brand-warning' : 'text-brand-border'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Review content */}
                            <div>
                              {review.title && (
                                <h5 className="text-xs font-extrabold text-brand-primary-text mb-1">{review.title}</h5>
                              )}
                              <p className="text-xs text-brand-secondary-text leading-relaxed bg-brand-bg/50 p-3 rounded-xl border border-brand-border/40 font-mono text-[11px]">
                                "{review.review}"
                              </p>
                            </div>

                            {/* Client device parameters metadata info line */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9px] font-mono text-brand-secondary-text/80 bg-brand-bg p-2 rounded-lg border border-brand-border/40">
                              <span><strong>Browser:</strong> {review.browser || 'Unknown'}</span>
                              <span><strong>OS:</strong> {review.operatingSystem || 'Unknown'}</span>
                              <span><strong>Device:</strong> {review.device || 'Unknown'}</span>
                              <span><strong>App:</strong> v{review.appVersion || '2.0'}</span>
                              <span><strong>Date:</strong> {new Date(review.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Right Column: Moderator Action buttons */}
                          <div className="flex sm:flex-col items-stretch justify-start gap-2 sm:w-44 shrink-0 border-t sm:border-t-0 sm:border-l border-brand-border/40 pt-4 sm:pt-0 sm:pl-4">
                            {/* Contact Details */}
                            <div className="text-[10px] space-y-1 bg-brand-bg p-2.5 rounded-xl border border-brand-border/50 w-full mb-2">
                              <p className="font-bold text-brand-primary-text truncate" title={review.reviewerName}>
                                {review.reviewerName}
                              </p>
                              {review.college && (
                                <p className="text-brand-secondary-text truncate font-semibold" title={review.college}>
                                  🏫 {review.college}
                                </p>
                              )}
                              {review.email ? (
                                <a 
                                  href={`mailto:${review.email}`} 
                                  className="text-brand-primary hover:underline font-bold flex items-center gap-1 mt-1 break-all"
                                  title={review.email}
                                >
                                  <Mail className="w-2.5 h-2.5" />
                                  <span className="truncate">{review.email}</span>
                                </a>
                              ) : (
                                <p className="text-brand-secondary-text/50 italic mt-1">No email provided</p>
                              )}
                            </div>

                            {/* Approve Button (Only for Public reviews) */}
                            {review.visibility === 'public' && review.status !== 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                className="w-full py-2 rounded-xl bg-brand-success text-white font-bold text-xs hover:bg-brand-success/90 transition-colors shadow-sm"
                              >
                                Approve Review
                              </button>
                            )}

                            {/* Reject Button (Only for Public reviews) */}
                            {review.visibility === 'public' && review.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Rejected')}
                                className="w-full py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-semibold text-xs transition-colors"
                              >
                                Reject Review
                              </button>
                            )}

                            {/* Reset status to pending button */}
                            {review.visibility === 'public' && review.status !== 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(review.id, 'Pending')}
                                className="w-full py-1.5 rounded-xl border border-brand-border text-brand-secondary-text text-[10px] hover:bg-brand-bg transition-colors"
                              >
                                Reset to Pending
                              </button>
                            )}

                            {/* Delete submission */}
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="w-full py-2 mt-auto rounded-xl border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 text-red-500/80 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-white border-t border-brand-border/40 flex items-center justify-between text-[10px] font-mono text-brand-secondary-text shrink-0">
                <span>Secure SSL Connection</span>
                {isAdminAuthenticated && (
                  <button 
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setAdminPassword('');
                    }}
                    className="text-brand-primary hover:underline font-bold"
                  >
                    Lock Session
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
