import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Asset Lokal Tabler (Bootstrap 5)
import './assets/css/tabler.min.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
