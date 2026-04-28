// author: all of us
import '../assets/css/input.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

// internal imports
import { AuthService } from '@/modules/auth/services/AuthService';
import PiniaInit from './PiniaInit';

const app = createApp(App);
const pinia = PiniaInit.init();

app.use(pinia);

await AuthService.bootstrap();
app.use(router);
app.mount('#app');
