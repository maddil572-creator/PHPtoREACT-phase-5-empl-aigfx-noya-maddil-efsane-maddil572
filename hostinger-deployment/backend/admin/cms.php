<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adil GFX CMS - Advanced Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        [x-cloak] { display: none !important; }
        .drag-handle { cursor: grab; }
        .drag-handle:active { cursor: grabbing; }
        .sortable-ghost { opacity: 0.5; }
    </style>
</head>
<body class="bg-gray-50">
    <div x-data="cmsApp()" x-cloak class="min-h-screen">
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="text-center">
                    <h2 class="mt-6 text-3xl font-extrabold text-gray-900">CMS Admin Panel</h2>
                    <p class="mt-2 text-sm text-gray-600">Advanced Content Management System</p>
                </div>
                <form @submit.prevent="login" class="mt-8 space-y-6">
                    <div>
                        <input x-model="loginForm.email" type="email" required 
                               class="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                               placeholder="Email address">
                    </div>
                    <div>
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

        <!-- CMS Dashboard -->
        <div x-show="isAuthenticated" class="flex h-screen bg-gray-100">
            <!-- Enhanced Sidebar -->
            <div class="hidden md:flex md:w-64 md:flex-col">
                <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
                    <div class="flex items-center flex-shrink-0 px-4">
                        <h1 class="text-xl font-bold text-gray-900">Adil GFX CMS</h1>
                    </div>
                    <div class="mt-5 flex-grow flex flex-col">
                        <nav class="flex-1 px-2 pb-4 space-y-1">
                            <!-- Dashboard -->
                            <a @click="currentView = 'dashboard'" :class="currentView === 'dashboard' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-chart-line mr-3"></i>
                                Dashboard
                            </a>

                            <!-- Global Settings -->
                            <a @click="currentView = 'settings'" :class="currentView === 'settings' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-cog mr-3"></i>
                                Global Settings
                            </a>

                            <!-- Page Management -->
                            <a @click="currentView = 'pages'" :class="currentView === 'pages' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-file-alt mr-3"></i>
                                Page Management
                            </a>

                            <!-- Carousel Management -->
                            <a @click="currentView = 'carousels'" :class="currentView === 'carousels' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-images mr-3"></i>
                                Carousels
                            </a>

                            <!-- Content Management -->
                            <div class="mt-4">
                                <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</h3>
                                <a @click="currentView = 'blogs'" :class="currentView === 'blogs' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                    <i class="fas fa-blog mr-3"></i>
                                    Blogs
                                </a>
                                <a @click="currentView = 'portfolio'" :class="currentView === 'portfolio' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                    <i class="fas fa-briefcase mr-3"></i>
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
                            </div>

                            <!-- User Management -->
                            <div class="mt-4">
                                <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</h3>
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
                            </div>

                            <!-- Media -->
                            <a @click="currentView = 'media'" :class="currentView === 'media' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-50'"
                               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                                <i class="fas fa-photo-video mr-3"></i>
                                Media Library
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

            <!-- Main Content Area -->
            <div class="flex flex-col w-0 flex-1 overflow-hidden">
                <!-- Top Navigation -->
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

                <!-- Page Content -->
                <main class="flex-1 relative overflow-y-auto focus:outline-none">
                    <!-- Global Settings View -->
                    <div x-show="currentView === 'settings'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 class="text-2xl font-semibold text-gray-900 mb-6">Global Settings</h1>
                            
                            <!-- Settings Tabs -->
                            <div class="bg-white shadow rounded-lg">
                                <div class="border-b border-gray-200">
                                    <nav class="-mb-px flex space-x-8 px-6">
                                        <template x-for="category in settingsCategories" :key="category">
                                            <button @click="activeSettingsTab = category"
                                                    :class="activeSettingsTab === category ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize"
                                                    x-text="category">
                                            </button>
                                        </template>
                                    </nav>
                                </div>
                                
                                <div class="p-6">
                                    <!-- Branding Settings -->
                                    <div x-show="activeSettingsTab === 'branding'" class="space-y-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Brand Identity</h3>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
                                                <div class="flex items-center space-x-4">
                                                    <img x-show="settings.branding?.site_logo?.value" 
                                                         :src="settings.branding?.site_logo?.value" 
                                                         class="h-12 w-auto" alt="Current logo">
                                                    <input type="file" @change="handleFileUpload($event, 'site_logo')" 
                                                           accept="image/*" class="text-sm">
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                                <input type="color" 
                                                       x-model="settings.branding.primary_color.value"
                                                       @change="updateSetting('primary_color', $event.target.value)"
                                                       class="h-10 w-20 border border-gray-300 rounded-md">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Contact Settings -->
                                    <div x-show="activeSettingsTab === 'contact'" class="space-y-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                <input type="email" 
                                                       x-model="settings.contact?.contact_email?.value"
                                                       @blur="updateSetting('contact_email', $event.target.value)"
                                                       class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                <input type="tel" 
                                                       x-model="settings.contact?.contact_phone?.value"
                                                       @blur="updateSetting('contact_phone', $event.target.value)"
                                                       class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Social Media Settings -->
                                    <div x-show="activeSettingsTab === 'social'" class="space-y-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                                        
                                        <div class="space-y-4">
                                            <template x-for="(setting, key) in settings.social" :key="key">
                                                <div class="flex items-center space-x-4">
                                                    <label class="w-24 text-sm font-medium text-gray-700 capitalize" x-text="key.replace('social_', '')"></label>
                                                    <input type="url" 
                                                           x-model="setting.value"
                                                           @blur="updateSetting(key, $event.target.value)"
                                                           class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                    <!-- Feature Toggles -->
                                    <div x-show="activeSettingsTab === 'features'" class="space-y-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Feature Controls</h3>
                                        
                                        <div class="space-y-4">
                                            <template x-for="(setting, key) in settings.features" :key="key">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <label class="text-sm font-medium text-gray-700 capitalize" x-text="key.replace('enable_', '').replace('_', ' ')"></label>
                                                        <p class="text-xs text-gray-500" x-text="setting.description"></p>
                                                    </div>
                                                    <label class="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" 
                                                               x-model="setting.value"
                                                               @change="updateSetting(key, $event.target.checked)"
                                                               class="sr-only peer">
                                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                                    </label>
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                    <!-- Analytics & Integrations -->
                                    <div x-show="activeSettingsTab === 'integrations'" class="space-y-6">
                                        <h3 class="text-lg font-medium text-gray-900 mb-4">Analytics & Integrations</h3>
                                        
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                                                <input type="text" 
                                                       x-model="settings.analytics?.google_analytics_id?.value"
                                                       @blur="updateSetting('google_analytics_id', $event.target.value)"
                                                       placeholder="G-XXXXXXXXXX"
                                                       class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">Mailchimp API Key</label>
                                                <input type="password" 
                                                       x-model="settings.integrations?.mailchimp_api_key?.value"
                                                       @blur="updateSetting('mailchimp_api_key', $event.target.value)"
                                                       class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Page Management View -->
                    <div x-show="currentView === 'pages'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div class="flex justify-between items-center mb-6">
                                <h1 class="text-2xl font-semibold text-gray-900">Page Management</h1>
                                <button @click="showPageModal = true; editingPage = null"
                                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                                    <i class="fas fa-plus mr-2"></i>Add New Page
                                </button>
                            </div>

                            <!-- Pages Table -->
                            <div class="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul class="divide-y divide-gray-200">
                                    <template x-for="page in pages" :key="page.id">
                                        <li class="px-6 py-4">
                                            <div class="flex items-center justify-between">
                                                <div class="flex-1">
                                                    <div class="flex items-center space-x-3">
                                                        <div class="drag-handle text-gray-400 hover:text-gray-600">
                                                            <i class="fas fa-grip-vertical"></i>
                                                        </div>
                                                        <div>
                                                            <h3 class="text-sm font-medium text-gray-900" x-text="page.title"></h3>
                                                            <p class="text-sm text-gray-500">
                                                                <span x-text="'/' + page.slug"></span>
                                                                <span x-show="page.showInNav" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    In Navigation
                                                                </span>
                                                                <span x-show="page.status === 'draft'" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Draft
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flex space-x-2">
                                                    <button @click="editPage(page)" class="text-blue-600 hover:text-blue-900">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button @click="deletePage(page.id)" class="text-red-600 hover:text-red-900">
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

                    <!-- Carousel Management View -->
                    <div x-show="currentView === 'carousels'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div class="flex justify-between items-center mb-6">
                                <h1 class="text-2xl font-semibold text-gray-900">Carousel Management</h1>
                                <button @click="showSlideModal = true; editingSlide = null"
                                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                                    <i class="fas fa-plus mr-2"></i>Add New Slide
                                </button>
                            </div>

                            <!-- Carousels List -->
                            <div class="space-y-6">
                                <template x-for="carousel in carousels" :key="carousel.name">
                                    <div class="bg-white shadow rounded-lg">
                                        <div class="px-6 py-4 border-b border-gray-200">
                                            <h3 class="text-lg font-medium text-gray-900 capitalize" x-text="carousel.name + ' Carousel'"></h3>
                                            <p class="text-sm text-gray-500" x-text="carousel.slideCount + ' slides'"></p>
                                        </div>
                                        <div class="p-6">
                                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <template x-for="slide in carousel.slides" :key="slide.id">
                                                    <div class="border border-gray-200 rounded-lg p-4">
                                                        <img x-show="slide.imageUrl" :src="slide.imageUrl" :alt="slide.title" class="w-full h-32 object-cover rounded-md mb-3">
                                                        <h4 class="font-medium text-gray-900 mb-1" x-text="slide.title"></h4>
                                                        <p class="text-sm text-gray-500 mb-3" x-text="slide.subtitle"></p>
                                                        <div class="flex space-x-2">
                                                            <button @click="editSlide(slide)" class="text-blue-600 hover:text-blue-900 text-sm">
                                                                <i class="fas fa-edit mr-1"></i>Edit
                                                            </button>
                                                            <button @click="deleteSlide(slide.id)" class="text-red-600 hover:text-red-900 text-sm">
                                                                <i class="fas fa-trash mr-1"></i>Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Media Library View -->
                    <div x-show="currentView === 'media'" class="py-6">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <div class="flex justify-between items-center mb-6">
                                <h1 class="text-2xl font-semibold text-gray-900">Media Library</h1>
                                <div class="flex space-x-3">
                                    <input type="file" @change="uploadMedia($event)" multiple accept="image/*,video/*" 
                                           class="hidden" id="media-upload">
                                    <label for="media-upload" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer">
                                        <i class="fas fa-upload mr-2"></i>Upload Media
                                    </label>
                                </div>
                            </div>

                            <!-- Media Grid -->
                            <div class="bg-white shadow rounded-lg p-6">
                                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <template x-for="media in mediaLibrary" :key="media.id">
                                        <div class="relative group border border-gray-200 rounded-lg overflow-hidden">
                                            <img :src="media.url" :alt="media.altText" class="w-full h-32 object-cover">
                                            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button @click="deleteMedia(media.id)" class="text-white hover:text-red-300">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                            <div class="p-2">
                                                <p class="text-xs text-gray-600 truncate" x-text="media.originalName"></p>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Page Modal -->
        <div x-show="showPageModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4" x-text="editingPage ? 'Edit Page' : 'Add New Page'"></h3>
                    <form @submit.prevent="savePage">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Page Title</label>
                                <input x-model="pageForm.title" type="text" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Status</label>
                                    <select x-model="pageForm.status" required
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Show in Navigation</label>
                                    <select x-model="pageForm.showInNav"
                                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Meta Description</label>
                                <textarea x-model="pageForm.metaDescription" rows="3"
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Page Sections (JSON)</label>
                                <textarea x-model="pageForm.sections" rows="6" placeholder='[{"type": "hero", "title": "Welcome", "content": "..."}]'
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 font-mono text-sm"></textarea>
                                <p class="text-xs text-gray-500 mt-1">Define page sections as JSON array</p>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showPageModal = false" type="button"
                                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
                                Cancel
                            </button>
                            <button type="submit" :disabled="pageSaving"
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50">
                                <span x-show="!pageSaving" x-text="editingPage ? 'Update' : 'Create'"></span>
                                <span x-show="pageSaving">Saving...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Slide Modal -->
        <div x-show="showSlideModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4" x-text="editingSlide ? 'Edit Slide' : 'Add New Slide'"></h3>
                    <form @submit.prevent="saveSlide">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Carousel Name</label>
                                <select x-model="slideForm.carouselName" required
                                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                    <option value="hero">Hero Carousel</option>
                                    <option value="services">Services Carousel</option>
                                    <option value="testimonials">Testimonials Carousel</option>
                                    <option value="portfolio">Portfolio Carousel</option>
                                </select>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Title</label>
                                    <input x-model="slideForm.title" type="text"
                                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Subtitle</label>
                                    <input x-model="slideForm.subtitle" type="text"
                                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Description</label>
                                <textarea x-model="slideForm.description" rows="3"
                                          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input x-model="slideForm.imageUrl" type="url"
                                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">CTA Text</label>
                                    <input x-model="slideForm.ctaText" type="text"
                                           class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">CTA URL</label>
                                <input x-model="slideForm.ctaUrl" type="url"
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showSlideModal = false" type="button"
                                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">
                                Cancel
                            </button>
                            <button type="submit" :disabled="slideSaving"
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50">
                                <span x-show="!slideSaving" x-text="editingSlide ? 'Update' : 'Create'"></span>
                                <span x-show="slideSaving">Saving...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        function cmsApp() {
            return {
                isAuthenticated: false,
                user: null,
                currentView: 'dashboard',
                searchQuery: '',
                
                // Login
                loginForm: { email: '', password: '' },
                loginLoading: false,
                loginError: '',
                
                // Settings
                settings: {},
                settingsCategories: ['branding', 'contact', 'social', 'analytics', 'integrations', 'features'],
                activeSettingsTab: 'branding',
                
                // Pages
                pages: [],
                showPageModal: false,
                editingPage: null,
                pageForm: {
                    title: '',
                    status: 'draft',
                    showInNav: true,
                    metaDescription: '',
                    sections: '[]'
                },
                pageSaving: false,
                
                // Carousels
                carousels: [],
                showSlideModal: false,
                editingSlide: null,
                slideForm: {
                    carouselName: 'hero',
                    title: '',
                    subtitle: '',
                    description: '',
                    imageUrl: '',
                    ctaText: '',
                    ctaUrl: ''
                },
                slideSaving: false,
                
                // Media
                mediaLibrary: [],

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
                                this.loadInitialData();
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
                            this.loadInitialData();
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

                async loadInitialData() {
                    await Promise.all([
                        this.loadSettings(),
                        this.loadPages(),
                        this.loadCarousels(),
                        this.loadMediaLibrary()
                    ]);
                },

                async loadSettings() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/settings.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            this.settings = await response.json();
                        }
                    } catch (error) {
                        console.error('Failed to load settings:', error);
                    }
                },

                async updateSetting(key, value) {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch(`../api/settings.php/${key}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ value })
                        });

                        if (response.ok) {
                            console.log(`Setting ${key} updated successfully`);
                        }
                    } catch (error) {
                        console.error('Failed to update setting:', error);
                    }
                },

                async loadPages() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/pages.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            this.pages = await response.json();
                        }
                    } catch (error) {
                        console.error('Failed to load pages:', error);
                    }
                },

                async loadCarousels() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/carousel.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            this.carousels = await response.json();
                        }
                    } catch (error) {
                        console.error('Failed to load carousels:', error);
                    }
                },

                async loadMediaLibrary() {
                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/uploads.php', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.mediaLibrary = data.data;
                        }
                    } catch (error) {
                        console.error('Failed to load media library:', error);
                    }
                },

                editPage(page) {
                    this.editingPage = page;
                    this.pageForm = {
                        title: page.title,
                        status: page.status,
                        showInNav: page.showInNav,
                        metaDescription: page.metaDescription || '',
                        sections: JSON.stringify(page.sections || [], null, 2)
                    };
                    this.showPageModal = true;
                },

                async savePage() {
                    this.pageSaving = true;
                    
                    try {
                        const token = localStorage.getItem('admin_token');
                        const url = this.editingPage 
                            ? `../api/pages.php/${this.editingPage.id}`
                            : '../api/pages.php';
                        
                        const method = this.editingPage ? 'PUT' : 'POST';
                        
                        const formData = {
                            ...this.pageForm,
                            sections: JSON.parse(this.pageForm.sections || '[]')
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
                            this.showPageModal = false;
                            this.loadPages();
                            this.resetPageForm();
                        } else {
                            const error = await response.json();
                            alert('Error: ' + (error.error || 'Failed to save page'));
                        }
                    } catch (error) {
                        alert('Error: Failed to save page');
                    } finally {
                        this.pageSaving = false;
                    }
                },

                async deletePage(id) {
                    if (!confirm('Are you sure you want to delete this page?')) return;

                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch(`../api/pages.php/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            this.loadPages();
                        } else {
                            alert('Failed to delete page');
                        }
                    } catch (error) {
                        alert('Error: Failed to delete page');
                    }
                },

                resetPageForm() {
                    this.pageForm = {
                        title: '',
                        status: 'draft',
                        showInNav: true,
                        metaDescription: '',
                        sections: '[]'
                    };
                },

                editSlide(slide) {
                    this.editingSlide = slide;
                    this.slideForm = { ...slide };
                    this.showSlideModal = true;
                },

                async saveSlide() {
                    this.slideSaving = true;
                    
                    try {
                        const token = localStorage.getItem('admin_token');
                        const url = this.editingSlide 
                            ? `../api/carousel.php/${this.editingSlide.id}`
                            : '../api/carousel.php';
                        
                        const method = this.editingSlide ? 'PUT' : 'POST';

                        const response = await fetch(url, {
                            method,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(this.slideForm)
                        });

                        if (response.ok) {
                            this.showSlideModal = false;
                            this.loadCarousels();
                            this.resetSlideForm();
                        } else {
                            const error = await response.json();
                            alert('Error: ' + (error.error || 'Failed to save slide'));
                        }
                    } catch (error) {
                        alert('Error: Failed to save slide');
                    } finally {
                        this.slideSaving = false;
                    }
                },

                async deleteSlide(id) {
                    if (!confirm('Are you sure you want to delete this slide?')) return;

                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch(`../api/carousel.php/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            this.loadCarousels();
                        } else {
                            alert('Failed to delete slide');
                        }
                    } catch (error) {
                        alert('Error: Failed to delete slide');
                    }
                },

                resetSlideForm() {
                    this.slideForm = {
                        carouselName: 'hero',
                        title: '',
                        subtitle: '',
                        description: '',
                        imageUrl: '',
                        ctaText: '',
                        ctaUrl: ''
                    };
                },

                async uploadMedia(event) {
                    const files = event.target.files;
                    if (!files.length) return;

                    const token = localStorage.getItem('admin_token');
                    
                    for (let file of files) {
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                            const response = await fetch('../api/uploads.php', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                            });

                            if (response.ok) {
                                console.log('File uploaded successfully');
                            }
                        } catch (error) {
                            console.error('Upload failed:', error);
                        }
                    }
                    
                    this.loadMediaLibrary();
                    event.target.value = ''; // Reset file input
                },

                async deleteMedia(id) {
                    if (!confirm('Are you sure you want to delete this media file?')) return;

                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch(`../api/uploads.php/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            this.loadMediaLibrary();
                        } else {
                            alert('Failed to delete media');
                        }
                    } catch (error) {
                        alert('Error: Failed to delete media');
                    }
                },

                handleSearch() {
                    console.log('Searching for:', this.searchQuery);
                },

                async handleFileUpload(event, settingKey) {
                    const file = event.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        const token = localStorage.getItem('admin_token');
                        const response = await fetch('../api/uploads.php', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                        });

                        if (response.ok) {
                            const data = await response.json();
                            await this.updateSetting(settingKey, data.file.url);
                            this.loadSettings();
                        }
                    } catch (error) {
                        console.error('File upload failed:', error);
                    }
                }
            }
        }
    </script>
</body>
</html>