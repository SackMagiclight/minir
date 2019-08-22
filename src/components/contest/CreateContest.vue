<template>
<div>
  <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      :top="true"
    >
      {{snackbarText}}
    </v-snackbar>
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12>
          <v-text-field
            ref="contestName"
            v-model="contestName"
            :rules="[
              () => !!contestName || 'This field is required',
              () => contestName.length < 31 || '30 characters or less.'
            ]"
            label="Contest Name"
            required
            hint="At least 30 characters"
            counter="30"
          ></v-text-field>
        </v-flex>

        <v-flex xs12>
          <v-textarea
            v-model="description"
            auto-grow
            box
            label="Description (Optional)"
          ></v-textarea>
        </v-flex>

        <v-flex xs12>
          <v-text-field
            ref="password"
            v-model="password"
            label="Contest Password (Optional)"
          ></v-text-field>
        </v-flex>

        <v-flex xs12 lg6>
          <v-text-field
            v-model="startDateTime"
            label="Start DateTime"
            :rules="[
              () => !!startDateTime || 'This field is required',
              () => validateDateTime() || 'After than End DateTime.',
            ]"
            hint="YYYY/MM/DD HH:mm:ssZZ"
            required
          ></v-text-field>
        </v-flex>
        <v-flex xs12 lg6>
          <v-text-field
            v-model="endDateTime"
            label="End DateTime"
            :rules="[
              () => !!endDateTime || 'This field is required',
              () => validateDateTime() || 'Before than Start DateTime.',
              () => diffDateTime() || 'It is up to one month.',
            ]"
            hint="YYYY/MM/DD HH:mm:ssZZ"
            required
          ></v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            ref="addTargetSonghash"
            v-model="addTargetSonghash"
            label="Song Hash(sha256)"
            :error-messages="errorMessages"
          >
            <template v-slot:append-outer>
              <v-select
                v-model="selectLnMode"
                :items="lnmode"
                item-text="label"
                item-value="value"
                label="LNMODE"
                return-object
                solo
              ></v-select>
              <v-btn 
                icon
                ripple
                :loading="loading"
                :disabled="loading"
                @click="addSong()"
              >
                <v-icon color="lighten-1">playlist_add</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-flex>
        <v-flex xs12>
          <v-list two-line>
            <template v-for="(item, index) in items">
              <v-subheader
                v-if="item.header"
                :key="item.header"
              >
                {{ item.header }}
              </v-subheader>

              <v-list-tile
                v-else
                :key="item.songhash + '.' + item.lnmode"
                avatar
              >
                <v-list-tile-avatar>
                  <v-icon>audiotrack</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.title"></v-list-tile-title>
                  <v-list-tile-sub-title>{{item.songhash}} - {{ lnmode[item.lnmode].label }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn
                    icon 
                    ripple
                    @click="removeSong(index)"
                  >
                    <v-icon color="grey lighten-1">clear</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
        <v-flex xs12>
          <v-btn block color="success" :disabled="enableSubmitButton() || loading" @click="submit()">Create Contest</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
/* eslint-disable */
import AWS from "aws-sdk";
import moment from 'moment';
import jssha from "jssha";
import { AmplifyEventBus } from 'aws-amplify-vue';
import { Auth } from 'aws-amplify';
const decrypt = require("../../decrypt");

export default {
  name: "CreateContest",
  props: {
    signedIn: Boolean
  },
  watch: {
    signedIn: async function(newValue, oldValue) {
      this.signedIn = newValue;
    }
  },
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      loading: false,
      errorMessages: '',
      contestName: "",
      description: "",
      password: "",
      startDateTime: moment().format("YYYY/MM/DD HH:mm:ssZZ"),
      endDateTime: moment().add(1,"day").format("YYYY/MM/DD HH:mm:ssZZ"),
      addTargetSonghash: null,
      items: [
          { header: 'Songs' }
      ],
      lnmode: [
        { label: 'LN or Default', value: 0 },
        { label: 'CN', value: 1 },
        { label: 'HCN', value: 2 }
      ],
      selectLnMode: { label: 'LN or Default', value: 0 }
    };
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
        // eslint-disable-next-line
        console.log(returnData);
        return returnData;
      } catch(err){
        // eslint-disable-next-line
        console.log(err);
        return {};
      }
    },
    enableSubmitButton: function () {
      if(this.contestName.length > 30 || this.contestName.length < 1 || !this.startDateTime) {
        return true;
      }

      if(this.items.length < 2){
        return true;
      }

      if(!this.validateDateTime()){
        return true;
      }
      
      if(!this.diffDateTime()){
        return true;
      }

      return false;
    },
    validateDateTime: function(){
      if(!moment(this.startDateTime, "YYYY/MM/DD HH:mm:ssZZ").isValid() || !moment(this.endDateTime, "YYYY/MM/DD HH:mm:ssZZ").isValid()){
        return false;
      }
      const start = moment(this.startDateTime, "YYYY/MM/DD HH:mm:ssZZ");
      const end = this.endDateTime ? moment(this.endDateTime, "YYYY/MM/DD HH:mm:ssZZ") : null;
      if(end && (start.isAfter(end))){
        return false;
      }

      return true;
    },
    diffDateTime: function() {
      if(!this.startDateTime){
        return false;
      }
      const start = moment(this.startDateTime, "YYYY/MM/DD HH:mm:ssZZ");
      const end = this.endDateTime ? moment(this.endDateTime, "YYYY/MM/DD HH:mm:ssZZ") : null;
      if(end && end.diff(start, 'months') > 1){
        return false;
      }

      return true;
    },
    submit: async function() {
      this.loading = true;
      let userData = await this.getCurrentUser();
      let contestName = this.contestName;
      let description = this.description ? this.description : null;
      let password = null;
      if(this.password){
        let shaObj = new jssha('SHA-512', 'TEXT');
        shaObj.update(this.password);
        password = shaObj.getHash("HEX");
      }
      let startDateTime = moment(this.startDateTime, "YYYY/MM/DD HH:mm:ssZZ");
      let endDateTime = moment(this.endDateTime, "YYYY/MM/DD HH:mm:ssZZ");
      let songs = [];
      for(let item of this.items){
        if(!item.songhash){
          continue;
        }
        songs.push(item.songhash + "." + item.lnmode);
      }

      const ks = decrypt.get("create_contest").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "create_contest",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          contestName: contestName,
          description: description ? description : null,
          password: password ? password : null,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          songs: songs,
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        if(err){
          self.snackbarText = "Failed to create Contest.";
          self.snackbar = true;
        }
        let json = JSON.parse(data.Payload.toString());
        self.$router.push(`/viewer/contest/${json.contestId}`);
      });
    },
    addSong: function() {
      this.loading = true;
      const songhash = this.addTargetSonghash;
      const lnmode = this.selectLnMode.value;

      const songItem = this.items.find((element) => {
        return element.songhash && element.songhash == songhash && element.lnmode == lnmode;
      });

      if(songItem){
        this.loading = false;
        return;
      }

      const self = this;

      const ks = decrypt.get("get_song_data").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_song_data",
        Payload: JSON.stringify({
          songhash: songhash + "." + lnmode
        })
      };

      lambda.invoke(params, function(err, data) {
        self.loading = false;
        if (!err) {
          const json = JSON.parse(data.Payload.toString());
          if(!json.message){
            self.errorMessages = "Song not found";
            return;
          } else if (json.message == "success") {
            json.SongData.lnmode = lnmode;
            self.items.push(json.SongData);
            self.addTargetSonghash = "";
          }
        }
      });
    },
    removeSong: function(index) {
      this.items.splice(index, 1);
    }
  }
};
</script>

