import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserStats } from "@/services/api/progressApi";
import { getStudyPlans } from "@/services/api/studyPlanApi";
import { updateUserProfile, changeUserPassword } from "@/services/api/userApi";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Trash2,
  Edit2,
  Camera,
  Check,
  X,
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  Code2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAttempted: 0,
    totalStudyPlans: 0,
    completedPlans: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalHours: 0,
    totalProblems: 0,
    solvedProblems: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    leetcode: 0,
    codeforces: 0,
    thisWeekSolved: 0,
    thisMonthSolved: 0,
    averageTimePerProblem: 0,
  });

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderEmails, setReminderEmails] = useState(true);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get user progress stats - real-time from API
      const progressStats = await getUserStats();

      // Get study plans from last 6 months for comprehensive analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const plans = await getStudyPlans(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Calculate total study hours from time ranges
      let totalMinutes = 0;
      let completedPlansCount = 0;
      let totalPlannedProblems = 0;
      let totalCompletedProblems = 0;

      if (plans && plans.length > 0) {
        plans.forEach((plan) => {
          // Count completed plans
          if (plan.isCompleted) {
            completedPlansCount++;
          }

          // Sum up problems
          totalPlannedProblems += plan.totalPlanned || 0;
          totalCompletedProblems += plan.totalCompleted || 0;

          // Calculate time spent
          if (plan.startTime && plan.endTime) {
            const [startH, startM] = plan.startTime.split(":").map(Number);
            const [endH, endM] = plan.endTime.split(":").map(Number);
            const start = startH * 60 + startM;
            const end = endH * 60 + endM;
            const duration = end >= start ? end - start : (24 * 60 - start + end);
            totalMinutes += duration;
          }
        });
      }

      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      // Calculate this week's solved problems from activity calendar
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekSolved =
        progressStats?.activityCalendar
          ?.filter((day) => new Date(day.date) >= oneWeekAgo)
          .reduce((sum, day) => sum + day.problemsSolved, 0) || 0;

      // Calculate this month's solved problems
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const thisMonthSolved =
        progressStats?.activityCalendar
          ?.filter((day) => new Date(day.date) >= oneMonthAgo)
          .reduce((sum, day) => sum + day.problemsSolved, 0) || 0;

      // Calculate average time per problem (in minutes)
      const avgTimePerProblem =
        progressStats?.totalSolved && progressStats.totalSolved > 0
          ? Math.round(totalMinutes / progressStats.totalSolved)
          : 0;

      // Set all real-time stats
      setStats({
        totalSolved: progressStats?.totalSolved || 0,
        totalAttempted: progressStats?.totalAttempted || 0,
        totalStudyPlans: plans?.length || 0,
        completedPlans: completedPlansCount,
        currentStreak: progressStats?.currentStreak || 0,
        longestStreak: progressStats?.longestStreak || 0,
        totalHours,
        totalProblems: totalPlannedProblems,
        solvedProblems: totalCompletedProblems,
        easy: progressStats?.solvedByDifficulty?.easy || 0,
        medium: progressStats?.solvedByDifficulty?.medium || 0,
        hard: progressStats?.solvedByDifficulty?.hard || 0,
        leetcode: progressStats?.solvedByPlatform?.leetcode || 0,
        codeforces: progressStats?.solvedByPlatform?.codeforces || 0,
        thisWeekSolved,
        thisMonthSolved,
        averageTimePerProblem: avgTimePerProblem,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Prepare update data (only send changed fields)
      const updateData: any = {};
      if (name !== user?.name) updateData.name = name;
      if (username !== user?.username) updateData.username = username;
      if (email !== user?.email) updateData.email = email;

      // Check if there are any changes
      if (Object.keys(updateData).length === 0 && !avatarPreview) {
        alert("No changes to save");
        setIsEditing(false);
        setSaving(false);
        return;
      }

      // Call API to update profile
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateUserProfile(updateData);

        // Update AuthContext with new user data
        updateUser(updatedUser as any);
      }

      setIsEditing(false);
      if (avatarPreview) {
        setAvatar(avatarPreview);
        setAvatarPreview(null);
      }

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setAvatarPreview(null);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      alert("Please enter your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters!");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from current password!");
      return;
    }

    try {
      setSaving(true);

      // Call API to change password
      await changeUserPassword({
        currentPassword,
        newPassword,
      });

      // Success - clear form and close modal
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);

      alert("Password changed successfully! You may need to login again on other devices.");
    } catch (error: any) {
      console.error("Error changing password:", error);
      alert(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm');
      return;
    }

    // For now, just show a confirmation
    alert("Account deletion feature is not yet implemented. Please contact support to delete your account.");
    setShowDeleteModal(false);
    setDeleteConfirmText("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b-2 border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[var(--color-hover)] rounded-lg transition-all"
              >
                <ArrowLeft size={20} className="text-[var(--color-text-primary)]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Profile</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Avatar & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-6 shadow-md">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f77f00] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {avatarPreview || avatar ? (
                      <img
                        src={avatarPreview || avatar || ""}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(name || user?.name || "U")
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleAvatarClick}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={32} className="text-white" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <h2 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">
                  {name || user?.name}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">@{username || user?.username}</p>

                <div className="mt-4 w-full pt-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Mail size={16} />
                    <span className="truncate">{email || user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mt-2">
                    <Calendar size={16} />
                    <span>
                      Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#ff6b35]/10 via-[var(--color-surface)] to-[#f77f00]/10 border-2 border-[var(--color-border)] rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-[#ff6b35]" />
                Quick Stats
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 size={18} className="text-[#ff6b35]" />
                      <span className="text-sm text-[var(--color-text-secondary)]">Solved</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {stats.totalSolved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-blue-500" />
                      <span className="text-sm text-[var(--color-text-secondary)]">Attempted</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {stats.totalAttempted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame size={18} className="text-orange-500" />
                      <span className="text-sm text-[var(--color-text-secondary)]">Current Streak</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {stats.currentStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-500" />
                      <span className="text-sm text-[var(--color-text-secondary)]">Best Streak</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {stats.longestStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-purple-500" />
                      <span className="text-sm text-[var(--color-text-secondary)]">Study Plans</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {stats.completedPlans}/{stats.totalStudyPlans}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                By Difficulty
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <span className="text-sm font-medium text-green-500">Easy</span>
                    <span className="text-lg font-bold text-green-500">{stats.easy}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <span className="text-sm font-medium text-yellow-500">Medium</span>
                    <span className="text-lg font-bold text-yellow-500">{stats.medium}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-sm font-medium text-red-500">Hard</span>
                    <span className="text-lg font-bold text-red-500">{stats.hard}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Stats */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                By Platform
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg">
                    <span className="text-sm font-medium text-[#ff6b35]">LeetCode</span>
                    <span className="text-lg font-bold text-[#ff6b35]">{stats.leetcode}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <span className="text-sm font-medium text-blue-500">Codeforces</span>
                    <span className="text-lg font-bold text-blue-500">{stats.codeforces}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#ff6b35]/5 to-transparent border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-[#ff6b35]" />
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                    Personal Information
                  </h3>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all text-sm flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-hover)] transition-all text-sm flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Study Analytics */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500/5 to-transparent border-b border-[var(--color-border)] flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-500" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Study Analytics</h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                </div>
              ) : (
                <div className="p-6">
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Total Study Hours */}
                    <div className="bg-gradient-to-br from-[#ff6b35]/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-[#ff6b35]" />
                        <span className="text-xs text-[var(--color-text-secondary)]">Total Hours</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {stats.totalHours}h
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Time invested
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span className="text-xs text-[var(--color-text-secondary)]">Success Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {stats.totalAttempted > 0
                          ? Math.round((stats.totalSolved / stats.totalAttempted) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {stats.totalSolved}/{stats.totalAttempted} solved
                      </div>
                    </div>

                    {/* This Week */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-blue-500" />
                        <span className="text-xs text-[var(--color-text-secondary)]">This Week</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {stats.thisWeekSolved}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        problems solved
                      </div>
                    </div>

                    {/* This Month */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-lg p-4 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-yellow-500" />
                        <span className="text-xs text-[var(--color-text-secondary)]">This Month</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {stats.thisMonthSolved}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        problems solved
                      </div>
                    </div>
                  </div>

                  {/* Additional Insights */}
                  <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Average Time/Problem
                      </span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {stats.averageTimePerProblem} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Study Plans Completion
                      </span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {stats.totalStudyPlans > 0
                          ? Math.round((stats.completedPlans / stats.totalStudyPlans) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Problems from Plans
                      </span>
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {stats.solvedProblems}/{stats.totalProblems}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500/5 to-transparent border-b border-[var(--color-border)] flex items-center gap-2">
                <Shield size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Security</h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Password</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Change your password regularly
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-hover)] transition-all text-sm"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-500/5 to-transparent border-b border-[var(--color-border)] flex items-center gap-2">
                <Bell size={20} className="text-green-500" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Preferences</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      Email Notifications
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Receive updates about your progress
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? "bg-[#ff6b35]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Reminder Emails</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Get study plan reminders
                    </p>
                  </div>
                  <button
                    onClick={() => setReminderEmails(!reminderEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reminderEmails ? "bg-[#ff6b35]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminderEmails ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[var(--color-surface)] border-2 border-red-500/50 rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-500/5 to-transparent border-b border-red-500/30 flex items-center gap-2">
                <Trash2 size={20} className="text-red-500" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Danger Zone</h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-500">Delete Account</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 rounded-lg transition-all text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-[#ff6b35]" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Change Password
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-[var(--color-hover)] rounded-lg"
              >
                <X size={20} className="text-[var(--color-text-primary)]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Current Password
                </label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-[var(--color-text-secondary)]"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-[var(--color-text-secondary)]"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="flex-1 px-4 py-2 bg-[#ff6b35] hover:bg-[#f77f00] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border-2 border-red-500 rounded-xl max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-red-500/30 flex items-center justify-between bg-red-500/10">
              <div className="flex items-center gap-2">
                <Trash2 size={20} className="text-red-500" />
                <h3 className="text-lg font-bold text-red-500">Delete Account</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-red-500/20 rounded-lg"
              >
                <X size={20} className="text-red-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-500 font-medium">⚠️ Warning: This action cannot be undone!</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                  All your data including study plans, progress, and statistics will be permanently deleted.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Type <span className="font-bold text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2 bg-[var(--color-background)] border border-red-500/50 rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirmText !== "DELETE"}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;