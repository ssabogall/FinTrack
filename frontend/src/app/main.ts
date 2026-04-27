// author: all of us
import '../assets/css/input.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

// internal imports
import { AuthService } from '@/modules/auth/services/AuthService';
import PiniaInit from './PiniaInit';
import { TransactionService } from '@/modules/transaction/services/TransactionService';

const app = createApp(App);
const pinia = PiniaInit.init();

app.use(pinia);
app.use(router);

await AuthService.bootstrap();
if (AuthService.isAuthenticated()) {
	await TransactionService.loadAll();
}
app.mount('#app');
