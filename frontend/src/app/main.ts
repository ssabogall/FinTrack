// author: all of us
import '../assets/css/input.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

// internal imports
import PiniaInit from './PiniaInit';

const app = createApp(App);
const pinia = PiniaInit.init();

app.use(pinia);
app.use(router);

app.mount('#app');
