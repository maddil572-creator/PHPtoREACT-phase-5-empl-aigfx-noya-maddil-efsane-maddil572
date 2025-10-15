<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adil GFX Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-50">
    <div x-data="adminApp()" x-cloak class="min-h-screen">
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="text-center">
                    <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Admin Panel</h2>
                    <p class="mt-2 text-sm text-gray-600">Sign in to manage Adil GFX</p>
                </div>
                <form @submit.prevent="login" class="mt-8 space-y-6">
                    <div>
                        <label for="email" class="sr-only">Email address</label>
                        <input x-model="loginForm.email" type="email" required 
                               class="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                               placeholder="Email address">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input x-model="loginForm.password" type="password" required
                               class="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                               placeholder="Password">
                    </div>
                    <div x-show="loginError" class="text-red-600 text-sm" x-text="loginError"></div>
                    <button type="submit" :disabled="loginLoading"
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                        <span x-show="!loginLoading">Sign in</span>
                        <span x-show="loginLoading">Signing in...</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- Admin Dashboard -->
        <div x-show="isAuthenticated" class="flex h-screen bg-gray-100">
            <!-- Sidebar -->
            <div class="hidden md:flex md:w-64 md:flex-col">
                <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
                    <div class="flex items-center flex-shrink-0 px-4">
                        <h1 class="text-xl font-bold text-gray-900">Adil GFX Admin</h1>
                    </div>
                    <div class="mt-5 flex-grow flex flex-col">
                        <nav class="flex-1 px-2 pb-4 space-y-1">
                            <a @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-chart-line mr-3"></i>
                                Dashboard
                            </a>
                            <a @click="currentView = 'blogs'" :class="currentView === 'blogs' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-blog mr-3"></i>
                                Blogs
                            </a>
                            <a @click="currentView = 'portfolio'" :class="currentView === 'portfolio' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-images mr-3"></i>
                                Portfolio
                            </a>
                            <a @click="currentView = 'services'" :class="currentView === 'services' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-cogs mr-3"></i>
                                Services
                            </a>
                            <a @click="currentView = 'testimonials'" :class="currentView === 'testimonials' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-star mr-3"></i>
                                Testimonials
                            </a>
                            <a @click="currentView = 'users'" :class="currentView === 'users' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-users mr-3"></i>
                                Users
                            </a>
                            <a @click="currentView = 'contacts'" :class="currentView === 'contacts' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-envelope mr-3"></i>
                                Contact Forms
                            </a>
                        </nav>
                    </div>
                    <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <button @click="logout" class="flex-shrink-0 w-full group block">
                            <div class="flex items-center">
                                <i class="fas fa-sign-out-alt mr-3 text-gray-400"></i>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Logout</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main content -->
            <div class="flex flex-col w-0 flex-1 overflow-hidden">
                <!-- Top bar -->
                <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <div class="flex-1 px-4 flex justify-between">
                        <div class="flex-1 flex">
                            <div class="w-full flex md:ml-0">
                                <div class="relative w-full text-gray-400 focus-within:text-gray-600">
                                    <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                        <i class="fas fa-search h-5 w-5"></i>
                                    </div>
                                    <input x-model="searchQuery" @input="handleSearch"
                                           class="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                                           placeholder="Search..." type="search">
                                </div>
                            </div>
                        </div>
                        <div class="ml-4 flex items-center md:ml-6">
                            <span class="text-sm text-gray-700" x-text="'Welcome, ' + (user?.name || 'Admin')"></span>
                        </div>
                    </div>
                </div>

                <!-- Page content -->
                <main class="flex-1 relative overflow-y-auto focus:outline-none">
                    <!-- Dashboard View -->
                    <div x-show="currentView === 'dashboard'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
                            
                            <!-- Stats Grid -->
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div class="bg-white overflow-hidden shadow rounded-lg">
                                    <div class="p-5">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-users text-gray-400 text-2xl"></i>
                                            </div>
                                            <div class="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                    <dd class="text-lg font-medium text-gray-900" x-text="stats.totalUsers"></dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-white overflow-hidden shadow rounded-lg">
                                    <div class="p-5">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-blog text-gray-400 text-2xl"></i>
                                            </div>
                                            <div class="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt class="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                                                    <dd class="text-lg font-medium text-gray-900" x-text="stats.totalBlogs"></dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-white overflow-hidden shadow rounded-lg">
                                    <div class="p-5">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-envelope text-gray-400 text-2xl"></i>
                                            </div>
                                            <div class="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt class="text-sm font-medium text-gray-500 truncate">Contact Forms</dt>
                                                    <dd class="text-lg font-medium text-gray-900" x-text="stats.totalContacts"></dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-white overflow-hidden shadow rounded-lg">
                                    <div class="p-5">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-coins text-gray-400 text-2xl"></i>
                                            </div>
                                            <div class="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt class="text-sm font-medium text-gray-500 truncate">Tokens Issued</dt>
                                                    <dd class="text-lg font-medium text-gray-900" x-text="stats.totalTokens"></dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Activity -->
                            <div class="bg-white shadow rounded-lg">
                                <div class="px-4 py-5 sm:p-6">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                                    <div class="space-y-3">
                                        <template x-for="activity in recentActivity" :key="activity.id">
                                            <div class="flex items-center space-x-3">
                                                <div class="flex-shrink-0">
                                                    <i :class="activity.icon" class="text-gray-400"></i>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-sm text-gray-900" x-text="activity.description"></p>
                                                    <p class="text-xs text-gray-500" x-text="activity.time"></p>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Blogs Management -->
                    <div x-show="currentView === 'blogs'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div class="flex justify-between items-center mb-6">
                                <h1 class="text-2xl font-semibold text-gray-900">Blog Management</h1>
                                <button @click="showBlogModal = true; editingBlog = null"
                                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                                    <i class="fas fa-plus mr-2"></i>Add New Blog
                                </button>
                            </div>

                            <!-- Blogs Table -->
                            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul class="divide-y divide-gray-200">
                                    <template x-for="blog in blogs" :key="blog.id">
                                        <li class="px-6 py-4">
                                            <div class="flex items-center justify-between">
                                                <div class="flex-1">
                                                    <h3 class="text-sm font-medium text-gray-900" x-text="blog.title"></h3>
                                                    <p class="text-sm text-gray-500" x-text="blog.category + ' • ' + blog.date"></p>
                                                    <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                        <span x-text="blog.views + ' views'"></span>
                                                        <span x-text="blog.likes + ' likes'"></span>
                                                        <span x-show="blog.featured" class="bg-red-100 text-red-800 px-2 py-1 rounded">Featured</span>
                                                    </div>
                                                </div>
                                                <div class="flex space-x-2">
                                                    <button @click="editBlog(blog)" class="text-blue-600 hover:text-blue-900">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button @click="deleteBlog(blog.id)" class="text-red-600 hover:text-red-900">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    </template>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Other views would be implemented similarly -->
                </main>
            </div>
        </div>

        <!-- Blog Modal -->
        <div x-show="showBlogModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4" x-text="editingBlog ? 'Edit Blog' : 'Add New Blog'"></h3>
                    <form @submit.prevent="saveBlog">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input x-model="blogForm.title" type="text" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Category</label>
                                <select x-model="blogForm.category" required
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                    <option value="">Select Category</option>
                                    <option value="Design Tips">Design Tips</option>
                                    <option value="YouTube Growth">YouTube Growth</option>
                                    <option value="Branding">Branding</option>
                                    <option value="Case Studies">Case Studies</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Excerpt</label>
                                <textarea x-model="blogForm.excerpt" rows="3" required
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Content</label>
                                <textarea x-model="blogForm.content" rows="10" required
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Featured Image URL</label>
                                <input x-model="blogForm.featured_image" type="url" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                                <input x-model="blogForm.tags" type="text"
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            </div>
                            <div class="flex items-center">
                                <input x-model="blogForm.featured" type="checkbox" id="featured"
                                       class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                <label for="featured" class="ml-2 block text-sm text-gray-900">Featured Post</label>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showBlogModal = false" type="button"
                                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
                                Cancel
                            </button>
                            <button type="submit" :disabled="blogSaving"
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50">
                                <span x-show="!blogSaving" x-text="editingBlog ? 'Update' : 'Create'"></span>
                                <span x-show="blogSaving">Saving...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        function adminApp() {
            return {
                isAuthenticated: false,
                user: null,
                currentView: 'dashboard',
                searchQuery: '',
                
                // Login
                loginForm: { email: '', password: '' },
                loginLoading: false,
                loginError: '',
                
                // Data
                stats: {},
                recentActivity: [],
                blogs: [],
                
                // Blog management
                showBlogModal: false,
                editingBlog: null,
                blogForm: {
                    title: '',
                    category: '',
                    excerpt: '',
                    content: '',
                    featured_image: '',
                    tags: '',
                    featured: false
                },
                blogSaving: false,

                init() {
                    this.checkAuth();
                },

                async checkAuth() {
                    const token = localStorage.getItem('admin_token');
                    if (!token) return;

                    try {
                        const response = await fetch('../api/auth.php/verify', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            if (data.user?.role === 'admin') {
                                this.isAuthenticated = true;
                                this.user = data.user;
                                this.loadDashboardData();
                            }
                        }
                    } catch (error) {
                        console.error('Auth check failed:', error);
                    }
                },

                async login() {
                    this.loginLoading = true;
                    this.loginError = '';

                    try {
                        const response = await fetch('../api/auth.php/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(this.loginForm)
                        });

                        const data = await response.json();

                        if (response.ok && data.user?.role === 'admin') {
                            localStorage.setItem('admin_token', data.token);
                            this.isAuthenticated = true;
                            this.user = data.user;
                            this.loadDashboardData();
                        } else {
                            this.loginError = data.error || 'Invalid admin credentials';
                        }
                    } catch (error) {
                        this.loginError = 'Login failed. Please try again.';
                    } finally {
                        this.loginLoading = false;
                    }
                },

                logout() {
                    localStorage.removeItem('admin_token');
                    this.isAuthenticated = false;
                    this.user = null;
                    this.currentView = 'dashboard';
                },

                async loadDashboardData() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        
                        // Load stats
                        const statsResponse = await fetch('../api/admin/stats.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (statsResponse.ok) {
                            this.stats = await statsResponse.json();
                        }

                        // Load recent activity
                        const activityResponse = await fetch('../api/admin/activity.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (activityResponse.ok) {
                            this.recentActivity = await activityResponse.json();
                        }

                        // Load blogs if on blogs view
                        if (this.currentView === 'blogs') {
                            this.loadBlogs();
                        }
                    } catch (error) {
                        console.error('Failed to load dashboard data:', error);
                    }
                },

                async loadBlogs() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/admin/blogs.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            this.blogs = await response.json();
                        }
                    } catch (error) {
                        console.error('Failed to load blogs:', error);
                    }
                },

                editBlog(blog) {
                    this.editingBlog = blog;
                    this.blogForm = {
                        title: blog.title,
                        category: blog.category,
                        excerpt: blog.excerpt,
                        content: blog.content,
                        featured_image: blog.featuredImage,
                        tags: blog.tags.join(', '),
                        featured: blog.featured
                    };
                    this.showBlogModal = true;
                },

                async saveBlog() {
                    this.blogSaving = true;
                    
                    try {
                        const token = localStorage.getItem('admin_token');
                        const url = this.editingBlog 
                            ? `../api/admin/blogs.php/${this.editingBlog.id}`
                            : '../api/admin/blogs.php';
                        
                        const method = this.editingBlog ? 'PUT' : 'POST';
                        
                        const formData = {
                            ...this.blogForm,
                            tags: this.blogForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                        };

                        const response = await fetch(url, {
                            method,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(formData)
                        });

                        if (response.ok) {
                            this.showBlogModal = false;
                            this.loadBlogs();
                            this.resetBlogForm();
                        } else {
                            const error = await response.json();
                            alert('Error: ' + (error.error || 'Failed to save blog'));
                        }
                    } catch (error) {
                        alert('Error: Failed to save blog');
                    } finally {
                        this.blogSaving = false;
                    }
                },

                async deleteBlog(id) {
                    if (!confirm('Are you sure you want to delete this blog?')) return;

                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch(`../api/admin/blogs.php/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            this.loadBlogs();
                        } else {
                            alert('Failed to delete blog');
                        }
                    } catch (error) {
                        alert('Error: Failed to delete blog');
                    }
                },

                resetBlogForm() {
                    this.blogForm = {
                        title: '',
                        category: '',
                        excerpt: '',
                        content: '',
                        featured_image: '',
                        tags: '',
                        featured: false
                    };
                },

                handleSearch() {
                    // Implement search functionality
                    console.log('Searching for:', this.searchQuery);
                }
            }
        }
    </script>
</body>
</html>