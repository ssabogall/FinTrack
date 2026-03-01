// external imports
import { createRouter, createWebHistory } from 'vue-router';

// internal imports
import HomeView from '@/views/home/HomeView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import ProfileView from '@/views/profile/ProfileView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import { AuthService } from '@/services/AuthService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' },
    },
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
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { title: 'Profile', requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !AuthService.isAuthenticated()) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  if (to.meta.guestOnly && AuthService.isAuthenticated()) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
