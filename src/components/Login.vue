<template>
  <v-dialog v-model="dialog" :max-width="options.width">
      <v-card>
        <v-card-title>
            <span class="headline">Login</span>
        </v-card-title>
        <v-card-text>
            <v-container grid-list-md>
            <v-layout wrap>
                <v-flex xs12>
                    <v-alert
                      :value="errorMessage"
                      type="error"
                    >
                      Unable to login. <br>
                      Check your email or password.
                    </v-alert>
                </v-flex>
                <v-flex xs12>
                  <v-progress-linear :indeterminate="true" v-show="progress"></v-progress-linear>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        v-model="email"
                        name="email"
                        :rules="[rules.required, rules.email]"
                        label="UserID(E-mail address)"
                        autocomplete="username email"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        v-model="password"
                        :append-icon="show1 ? 'visibility_off' : 'visibility'"
                        :rules="[rules.required, rules.min]"
                        :type="show1 ? 'text' : 'password'"
                        name="password"
                        label="Password"
                        hint="At least 8 characters"
                        counter
                        autocomplete="new-password"
                        @click:append="show1 = !show1"
                    ></v-text-field>
                </v-flex>
            </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click.native="cancel()">Close</v-btn>
            <v-btn type="submit" color="primary" flat @click.native="login()" :disabled="!validate()">Login</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { AmplifyEventBus } from 'aws-amplify-vue';
import { Auth } from 'aws-amplify';

export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    e1: 1,
    options: {
      color: "primary",
      width: 400
    },
    email: "",
    password: "",
    errorMessage: null,
    show1: false,
    progress: false,
    rules: {
      required: value => !!value || "Required.",
      counter: value => value.length <= 20 || "Max 20 characters",
      min: v => v.length >= 8 || "Min 8 characters",
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      }
    }
  }),
  methods: {
    validate: function() {
      return (
        this.rules.required(this.email) == true &&
        this.rules.required(this.password) == true &&
        this.rules.min(this.password) == true &&
        this.rules.email(this.email) == true
      );
    },
    login: function() {
      this.progress = true;
      this.errorMessage = null;
      let email = this.email;
      let psw = this.password;
      const self = this;

      Auth.signIn(email, psw)
      .then(() => {
        self.progress = false;
        self.clearForm();
        self.dialog = false;
        AmplifyEventBus.$emit("authState", "signedIn");
        return;
      }).catch((err) => {
        self.progress = false;
        self.errorMessage = JSON.stringify(err, undefined, 1);
      });
    },
    open() {
      this.dialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
      this.clearForm();
      this.dialog = false;
    },
    cancel() {
      this.resolve(false);
      this.clearForm();
      this.dialog = false;
    },
    clearForm: function() {
      this.email = "";
      this.password = "";
      this.errorMessage = null;
    }
  }
};
</script>