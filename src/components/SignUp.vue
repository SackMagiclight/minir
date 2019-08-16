<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-stepper v-model="e1">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1">Input New Account Data</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="e1 > 2" step="2">Verify Account</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
            <v-card>
                <v-card-title>
                    <span class="headline">Sign Up</span>
                </v-card-title>
                <v-card-text>
                    <small>Please fill in this form to create an account.</small>
                    <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12>
                            <v-alert
                            :value="errorMessage"
                            type="error"
                            >
                            {{errorMessage}}
                            </v-alert>
                        </v-flex>
                        <v-flex xs12>
                            <v-progress-linear :indeterminate="true" v-show="progress"></v-progress-linear>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                v-model="username"
                                :rules="[rules.required]"
                                label="IR UserName(Japanese OK)"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                v-model="email"
                                :rules="[rules.required, rules.email]"
                                label="E-mail"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                v-model="password"
                                :append-icon="show1 ? 'visibility_off' : 'visibility'"
                                :rules="[rules.required, rules.min]"
                                :type="show1 ? 'text' : 'password'"
                                name="input-10-1"
                                label="Password"
                                hint="At least 8 characters"
                                counter
                                @click:append="show1 = !show1"
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat @click.native="cancel()">Close</v-btn>
                    <v-btn color="primary" flat @click.native="signUp()" :disabled="!validate()">Continue</v-btn>
                </v-card-actions>
            </v-card>
        </v-stepper-content>
        <v-stepper-content step="2">
            <v-card>
                <v-card-title>
                    <span class="headline">Sign Up</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <p>Please click the link of authentication mail, please complete registration.</p>
                                <hr>
                                <p>認証メールを確認し、登録を完了させてください。</p>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat @click.native="cancel()">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-dialog>
</template>
<script>
import AWS from "aws-sdk";

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
    username: "",
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
        this.rules.required(this.username) == true &&
        this.rules.min(this.password) == true &&
        this.rules.email(this.email) == true
      );
    },
    signUp: function() {
      this.progress = true;
      this.errorMessage = null;
      let username = this.username;
      let email = this.email;
      let psw = this.password;
      AWS.config.update({
        accessKeyId: "AKIAJOOCVWQ675TN4WLQ",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      var lambda = new AWS.Lambda();
      var params = {
        FunctionName: "sign_up",
        Payload: JSON.stringify({
          username: username,
          email: email,
          password: psw
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          self.errorMessage = JSON.stringify(err, undefined, 1);
          return;
        } else {
          if (data.Payload != "true") {
            let json = JSON.parse(data.Payload.toString());
            if (json.errorMessage) {
              self.errorMessage = JSON.stringify(
                json.errorMessage,
                undefined,
                1
              );
              return;
            }
          } else {
            self.e1 = 2;
          }
        }
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
      this.username = "";
      this.e1 = 1;
      this.errorMessage = null;
    }
  }
};
</script>