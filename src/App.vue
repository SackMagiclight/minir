<template>
  <v-app>
    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      :top="true"
    >
      Logout.
    </v-snackbar>
    <v-navigation-drawer
      clipped-left
      fixed
      app
      v-model="drawer"
    >
      <v-list>

        <v-list-tile
          :to="'/'"
        >
          <v-list-tile-title class="title">
            {{ title }}
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          :to="'/about'"
        >
          <v-list-tile-action>
            <v-icon>bubble_chart</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>About</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
          :href="'https://drive.google.com/open?id=1wYVNufrfiVAWUkYTVdGl0Q0PqrhkHZBo'"
          target="_blank"
        >
          <v-list-tile-action>
            <v-icon>get_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Download API</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile
          :to="'/privacy'"
        >
          <v-list-tile-action>
            <v-icon>lock</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>PrivacyPolicy</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>
        <v-list-tile
          :to="'/search'"
        >
          <v-list-tile-action>
            <v-icon>search</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Search Music</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-subheader>Contest</v-subheader>
        <v-list-tile
          :to="'/viewer/contest-latest'"
        >
          <v-list-tile-action>
            <v-icon>queue_music</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contest List</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          :to="'/viewer/contest-create'"
          v-if="signedIn"
        >
          <v-list-tile-action>
            <v-icon>playlist_add</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Create Contest</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>
        
        <v-subheader>Latest 100 played</v-subheader>
        <v-list-tile
          v-for="(item, i) in played"
          :key="i"
          :to="'/viewer/latest/'+item.key"
        >
          <v-list-tile-action>
            <v-icon>library_music</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile
          :to="'/viewer/cource-latest/'"
        >
          <v-list-tile-action>
            <v-icon>library_music</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Cource</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn v-if="!signedIn" flat @click="onSignUpOpen"><v-icon>person_add</v-icon>Sign Up</v-btn> 
        <v-btn v-if="!signedIn" flat @click="onLoginOpen"><v-icon>computer</v-icon>Login</v-btn> 
        <v-btn v-if="signedIn" flat @click="logout"><v-icon>exit_to_app</v-icon>Logout</v-btn>
        <v-btn v-if="signedIn" flat @click="onSettingPage"><v-icon>settings</v-icon>Setting</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <SignUp ref="SignUp"></SignUp>
    <Login ref="Login"></Login>
    <v-content>
      <router-view :signedIn="signedIn"></router-view>
    </v-content>
  </v-app>
</template>

<script>
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { AmplifyEventBus } from 'aws-amplify-vue';
import { Auth } from 'aws-amplify';

export default {
  name: "App",
  components: {
    SignUp,
    Login
  },
  data() {
    return {
      signedIn: false,
      snackbar: false,
      drawer: false,
      played: [
        { title: "7KEYS", key: "beat-7k" },
        { title: "5KEYS", key: "beat-5k" },
        { title: "10KEYS", key: "beat-10k" },
        { title: "14KEYS", key: "beat-14k" },
        { title: "PMS 5KEYS", key: "popn-5k" },
        { title: "PMS 9KEYS", key: "popn-9k" },
        { title: "KM 24KEYS", key: "keyboard-24k" },
        { title: "KM 48KEYS", key: "keyboard-48k" }
      ],
      title: "MinIR"
    };
  },
  mounted: function() {
  },
  created: async function() {
    try {
      await Auth.currentAuthenticatedUser()
      this.signedIn = true;
    } catch (err) {
      this.signedIn = false;
    }
    AmplifyEventBus.$on('authState', info => {
      // eslint-disable-next-line
      console.log(info);
      if (info === 'signedIn') {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    }); 
  },
  methods: {
    getCurrentUser: async function(){
      try{
        const data = await Auth.currentAuthenticatedUser();
        const returnData = {
            AccessToken: data.signInUserSession.accessToken.jwtToken,
            RefreshToken: data.signInUserSession.refreshToken.token,
            UserId: data.signInUserSession.idToken.payload.sub
        };
        return returnData;
      } catch(err){
        // eslint-disable-next-line
        console.log(err);
        return {};
      }
    },
    onSettingPage: async function(){
      const userData = await this.getCurrentUser();
      this.$router.push({ path: `/viewer/user/${userData.UserId}`});
    },
    onSignUpOpen: async function() {
      await this.$refs.SignUp.open();
    },
    onLoginOpen: async function() {
      await this.$refs.Login.open();
    },
    logout: async function() {
      await Auth.signOut();
      AmplifyEventBus.$emit("authState", "signedOut");
      this.snackbar = true;
    }
  }
};
</script>
