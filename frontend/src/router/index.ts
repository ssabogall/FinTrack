// author: all of us

// external imports
import { createRouter, createWebHistory } from 'vue-router';

// internal imports
import { AuthService } from '@/services/AuthService';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';
import AdminReportsView from '@/views/admin/AdminReportsView.vue';
import AdminUsersView from '@/views/admin/AdminUsersView.vue';
import CreateGoalView from '@/modules/goal/views/CreateView.vue';
import EditGoalView from '@/modules/goal/views/EditView.vue';
import HomeView from '@/views/home/HomeView.vue';
import IndexCategoryView from '@/views/categories/IndexView.vue';
import IndexGoalView from '@/modules/goal/views/IndexView.vue';
import IndexTransactionView from '@/views/transactions/IndexView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import ProfileView from '@/views/profile/ProfileView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home', requiresAuth: true },
    },

    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login', guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Register', guestOnly: true },
    },

    // Category routes
    {
      path: '/categories',
      name: 'category.index',
      component: IndexCategoryView,
      meta: { title: 'Categories', requiresAuth: true },
    },
    // Transaction routes
    {
      path: '/transactions',
      name: 'transaction.index',
      component: IndexTransactionView,
      meta: { title: 'Transactions', requiresAuth: true },
    },

    // Goals routes
    {
      path: '/goals',
      name: 'goal.index',
      component: IndexGoalView,
      meta: { title: 'Savings Goals', requiresAuth: true },
    },
    {
      path: '/goals/create',
      name: 'goal.create',
      component: CreateGoalView,
      meta: { title: 'New Savings Goal', requiresAuth: true },
    },
    {
      path: '/goals/:id/edit',
      name: 'goal.edit',
      component: EditGoalView,
      meta: { title: 'Edit Savings Goal', requiresAuth: true },
    },
    // Profile routes
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { title: 'Profile', requiresAuth: true },
    },

    // Admin routes
    {
      path: '/admin',
      name: 'admin.dashboard',
      component: AdminDashboardView,
      meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin.users',
      component: AdminUsersView,
      meta: { title: 'Users', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/reports',
      name: 'admin.reports',
      component: AdminReportsView,
      meta: { title: 'Reports', requiresAuth: true, requiresAdmin: true },
    },
  ],
});

// Navigation guards
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !AuthService.isAuthenticated()) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  if (to.meta.requiresAdmin && !AuthService.isAdmin()) {
    next({ name: 'home' });
    return;
  }

  if (to.meta.guestOnly && AuthService.isAuthenticated()) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
