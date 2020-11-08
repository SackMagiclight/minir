<template>
  <v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step :complete="e1 > 1" step="1">Input Your email</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="e1 > 2" step="2">Reset Password</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="e1 > 3" step="3">Reset Complete</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
          <v-card>
              <v-card-title>
                  <span class="headline">Send reset code to your email</span>
              </v-card-title>
              <v-card-text>
                  <small>Please imput your email.</small>
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
                              v-model="email"
                              :rules="[rules.required, rules.email]"
                              label="E-mail"
                          ></v-text-field>
                      </v-flex>
                  </v-layout>
                  </v-container>
              </v-card-text>
              <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" flat @click.native="resetRequest()" :disabled="!validate()">Continue</v-btn>
              </v-card-actions>
          </v-card>
      </v-stepper-content>
      <v-stepper-content step="2">
          <v-card>
              <v-card-title>
                  <span class="headline">Reset Password</span>
              </v-card-title>
              <v-card-text>
                  <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12>
                            <v-text-field
                                v-model="verifyCode"
                                label="Verify Code"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs12>
                            <v-text-field
                                v-model="newPassword"
                                :append-icon="show1 ? 'visibility_off' : 'visibility'"
                                :rules="[rules.required, rules.min]"
                                :type="show1 ? 'text' : 'password'"
                                name="input-10-1"
                                label="New Password"
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
                  <v-btn color="primary" flat @click.native="reset()" :disabled="!validate()">Continue</v-btn>
              </v-card-actions>
          </v-card>
      </v-stepper-content>
      <v-stepper-content step="3">
          <v-card>
              <v-card-title>
                  <span class="headline">Reset Success</span>
              </v-card-title>
              <v-card-text>
                  <v-container grid-list-md>
                      <v-layout wrap>
                          <v-flex xs12>
                              <p>Please login to new Password.</p>
                              <hr>
                              <p>パスワードの設定が完了しました。</p>
                          </v-flex>
                      </v-layout>
                  </v-container>
              </v-card-text>
          </v-card>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>
<script>
import AWS from "aws-sdk";
const decrypt = require("../decrypt");

export default {
  data: () => ({
    resolve: null,
    reject: null,
    message: null,
    title: null,
    e1: 1,
    options: {
      color: "primary",
      width: 400
    },
    verifyCode: "",
    email: "",
    newPassword: "",
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
        this.rules.email(this.email) == true
      );
    },
    resetRequest: function() {
      this.progress = true;
      let email = this.email;

      const ks = decrypt.get("forget_password").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      var lambda = new AWS.Lambda();
      var params = {
        FunctionName: "forget_password",
        Payload: JSON.stringify({
          username: email
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          self.errorMessage = JSON.stringify(err, undefined, 1);
          return;
        } else {
          const json = JSON.parse(data.Payload.toString());
          if (json.message != "success") {
            self.errorMessage = JSON.stringify(
              json.errorMessage,
              undefined,
              1
            );
            return;
          } else {
            self.e1 = 2;
          }
        }
      });
    },
    reset: function() {
      this.progress = true;
      let verifyCode = this.verifyCode;
      let newPassword = this.newPassword;
      let email = this.email;

      const ks = decrypt.get("reset_password").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      var lambda = new AWS.Lambda();
      var params = {
        FunctionName: "reset_password",
        Payload: JSON.stringify({
          username: email,
          verifyCode,
          newPassword
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          self.errorMessage = JSON.stringify(err, undefined, 1);
          return;
        } else {
          const json = JSON.parse(data.Payload.toString());
          if (json.message != "success") {
            self.errorMessage = JSON.stringify(
              json.errorMessage,
              undefined,
              1
            );
            return;
          } else {
            self.e1 = 3;
          }
        }
      });
    },
    open() {
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
    },
    cancel() {
      this.resolve(false);
      this.clearForm();
    },
    clearForm: function() {
      this.email = "";
      this.newPassword = "";
      this.verifyCode = "";
      this.e1 = 1;
      this.errorMessage = null;
    }
  }
};
</script>