<template>
  <v-layout align-center justify-center row fill-height>
  <v-card>
        <v-card-title>
            <span class="headline">Service Authorize</span>
        </v-card-title>
        <v-card-text>
          <h3>Authorize "{{getServiceName()}}" to use your account?</h3>
            <v-container grid-list-md>
            <v-layout wrap>
                <v-flex xs12>
                    <v-alert
                      :value="errorMessage"
                      type="error"
                    >
                      * Check your email or password.
                      * If the problem persists please contact the "{{getServiceName()}}" administrator.
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
            <v-btn color="primary" flat @click.native="login()" :disabled="!validate()">Confilm</v-btn>
            <v-btn flat @click.native="cancel()">Cancel</v-btn>
        </v-card-actions>
    </v-card>
    </v-layout>
</template>
<script>
import AWS from "aws-sdk";

export default {
  data: () => ({
    title: null,
    e1: 1,
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
  mounted: function() {
    if(!this.getServiceToken()){
      this.$router.push({ path: "/" });
    }
  },
  methods: {
    getServiceName: function() {
      return this.$route.params.serviceName;
    },
    getServiceToken: function() {
      return decodeURIComponent(this.$route.params.serviceToken);
    },
    validate: function() {
      return (
        this.rules.required(this.email) == true &&
        this.rules.required(this.password) == true &&
        this.rules.min(this.password) == true &&
        this.rules.email(this.email) == true
      );
    },
    login: function() {
      const self = this;
      this.progress = true;
      this.errorMessage = null;
      let email = this.email;
      let psw = this.password;
      AWS.config.update({
        accessKeyId: "AKIAIRK5MFBNK6PWYPRQ",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "auth_service",
        Payload: JSON.stringify({
          username: email,
          password: psw,
          serviceToken: this.getServiceToken(),
          serviceName: this.getServiceName()
        })
      };
      
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          self.errorMessage = JSON.stringify(err, undefined, 1);
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.errorMessage) {
            self.errorMessage = JSON.stringify(json.errorMessage, undefined, 1);
            return;
          }

          let url = json.ReturnObj.Url;
          url += ("?userid=" + json.UserId);
          if(json.ReturnObj.QueryParams){
            url += "&";
            url += self.encodeQueryData(json.ReturnObj.QueryParams);
          }
          document.location = url;
        }
      });
    },
    cancel: function() {
      this.$router.push({ path: "/" });
    },
    encodeQueryData: function(data) {
      const ret = [];
      for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
      return ret.join('&');
    }
  }
};
</script>