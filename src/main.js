import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

import routes from './routes'
import VueRouter from 'vue-router'
Vue.use(VueRouter);
const router = new VueRouter({
  routes: routes
});

import VueYouTubeEmbed from 'vue-youtube-embed'
Vue.use(VueYouTubeEmbed);

import VueCookie from 'vue-cookie';
Vue.use(VueCookie);

import SocialSharing from "vue-social-sharing";
Vue.use(SocialSharing);

import VueAnalytics from 'vue-analytics';
Vue.use(VueAnalytics, {
  id: 'UA-83617244-2',
  router
});

import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false

import Amplify, * as AmplifyModules from 'aws-amplify';
import { AmplifyPlugin } from 'aws-amplify-vue';
Amplify.configure({
  Auth: {
      identityPoolId: 'us-east-1:2fd56666-2b4f-4aa2-a6c7-05f656731913', 
      region: 'us-east-1', 
      userPoolId: 'us-east-1_eKnHXAoPk',
      userPoolWebClientId: '6ajj9dvmultkvu5kdtbngokq3h', 
  },
  Analytics: {
    disabled: true
  }
});
Vue.use(AmplifyPlugin, AmplifyModules);

new Vue({
  render: h => h(App),
  router 
}).$mount('#app')
