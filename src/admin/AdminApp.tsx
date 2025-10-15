/**
 * Unified Admin Application
 * Single entry point for all admin functionality
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from '@/components/protected-route';

// Dashboard
import { AdminDashboard } from './pages/Dashboard';

// Content Management
import { BlogList } from './pages/Blogs';
import { PortfolioGrid } from './pages/Portfolio';
import { ServiceList } from './pages/Services';
import { TestimonialList } from './pages/Testimonials';
import { FAQList } from './pages/FAQ';

// Media & Users
import { MediaLibrary } from './pages/Media';
import { UserList } from './pages/Users';

// Analytics & Settings
import { AnalyticsOverview } from './pages/Analytics';
import { NotificationsList } from './pages/Notifications';
import { SettingsForm } from './pages/Settings';

// Homepage Content Management (NEW)
import { HomepageEditor } from './pages/Homepage/HomepageEditor';
import { NavigationEditor } from './pages/Homepage/NavigationEditor';
import { FooterEditor } from './pages/Homepage/FooterEditor';

export function AdminApp() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={
          <AdminLayout title="Dashboard">
            <AdminDashboard />
          </AdminLayout>
        } />

        {/* Content Management */}
        <Route path="/content" element={<Navigate to="/admin/blogs" replace />} />
        
        <Route path="/blogs" element={
          <AdminLayout title="Blog Management">
            <BlogList />
          </AdminLayout>
        } />
        
        <Route path="/portfolio" element={
          <AdminLayout title="Portfolio Management">
            <PortfolioGrid />
          </AdminLayout>
        } />
        
        <Route path="/services" element={
          <AdminLayout title="Services Management">
            <ServiceList />
          </AdminLayout>
        } />
        
        <Route path="/testimonials" element={
          <AdminLayout title="Testimonials Management">
            <TestimonialList onEdit={() => {}} onCreate={() => {}} />
          </AdminLayout>
        } />
        
        <Route path="/faqs" element={
          <AdminLayout title="FAQ Management">
            <FAQList />
          </AdminLayout>
        } />

        {/* Homepage Content Management */}
        <Route path="/homepage" element={
          <AdminLayout title="Homepage Editor">
            <HomepageEditor />
          </AdminLayout>
        } />
        
        <Route path="/navigation" element={
          <AdminLayout title="Navigation Editor">
            <NavigationEditor />
          </AdminLayout>
        } />
        
        <Route path="/footer" element={
          <AdminLayout title="Footer Editor">
            <FooterEditor />
          </AdminLayout>
        } />

        {/* Media & Users */}
        <Route path="/media" element={
          <AdminLayout title="Media Library">
            <MediaLibrary />
          </AdminLayout>
        } />
        
        <Route path="/users" element={
          <AdminLayout title="User Management">
            <UserList />
          </AdminLayout>
        } />

        {/* Analytics & System */}
        <Route path="/analytics" element={
          <AdminLayout title="Analytics">
            <AnalyticsOverview />
          </AdminLayout>
        } />
        
        <Route path="/notifications" element={
          <AdminLayout title="Notifications">
            <NotificationsList />
          </AdminLayout>
        } />
        
        <Route path="/settings/*" element={
          <AdminLayout title="Settings">
            <Routes>
              <Route path="/" element={<SettingsForm />} />
              <Route path="/profile" element={<SettingsForm />} />
              <Route path="/appearance" element={<SettingsForm />} />
            </Routes>
          </AdminLayout>
        } />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ProtectedRoute>
  );
}