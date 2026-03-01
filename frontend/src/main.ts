import './assets/css/input.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

// internal imports
import PiniaConfig from './PiniaConfig';

const app = createApp(App);
const pinia = PiniaConfig.init();

app.use(pinia);
app.use(router);

app.mount('#app');
