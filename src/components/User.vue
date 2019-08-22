<template>
  <div>
    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      :top="true"
    >
      {{snackbarText}}
    </v-snackbar>
    <v-container grid-list-md>
      <!-- No Login -->
      <v-layout row wrap v-if="!signedIn">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2>{{username}}</h2>
                <div :inner-html.prop="bio | nl2br | replaseURL"></div>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
      <!-- [Login] other user page  -->
      <v-layout row wrap v-if="signedIn && !isUserPage">
        <v-flex xs12 md8>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2>{{username}}</h2>
                <div :inner-html.prop="bio | nl2br | replaseURL"></div>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs12 md4>
          <v-card>
            <v-btn 
              :loading="addRivalLoading"
              :disabled="addRivalLoading"
              color="primary" 
              @click.native="addRival()">Add Rival</v-btn>
            <v-btn 
              :loading="removeRivalLoading"
              :disabled="removeRivalLoading"
              color="error" 
              @click.native="removeRival()">Remove Rival</v-btn>
          </v-card>
        </v-flex>
      </v-layout>
      <!-- [Login] user page  -->
      <v-layout row wrap v-if="signedIn && isUserPage">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2>{{username}}</h2>
                <h4>MinIR Unique ID : {{getUserId()}}</h4>
              </div>
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="bio"
                auto-grow
                box
                label="Bio"
              ></v-textarea>
              <v-btn 
                :loading="updateBioLoading"
                :disabled="updateBioLoading"
                color="primary" 
                @click.native="updateBio()">Update</v-btn>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-card-text>
              <h3>Rivals</h3>
              <div ref="rivalTable"></div>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-card-text>
              <h3>Contest</h3>
              <div ref="contestTable"></div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12>
          <v-dialog v-model="progress" persistent max-width="290">
            <v-card>
              <v-card-text>
                <v-progress-linear indeterminate></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-dialog>
          <div ref="table"></div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
/* eslint-disable */
import AWS from "aws-sdk";
import Tabulator from "tabulator-tables";
import { AmplifyEventBus } from 'aws-amplify-vue';
import Amplify, { Auth } from 'aws-amplify';
const decrypt = require("../decrypt");

export default {
  name: "User",
  props: {
    signedIn: Boolean
  },
  watch: {
    $route: async function(to, from) {
      await this.setIsUserPage();
      await this.getUserData();
      
    },
    signedIn: async function(newValue, oldValue) {
      await this.setIsUserPage();
      await this.getUserData();
      this.signedIn = newValue;
    },
    tableData:{
      handler: function (newData) {
        this.table.replaceData(newData);
      },
      deep: true,
    },
    rivalTableData:{
      handler: function (newData) {
        this.rivalTable.replaceData(newData);
      },
      deep: true,
    },
    contestTableData:{
      handler: function (newData) {
        this.contestTable.replaceData(newData);
      },
      deep: true,
    }
  },
  filters: {
    replaseURL: function(value) {
      if (typeof value === "undefined" || value === null) {
        return "";
      }
      const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      return value.replace(exp, "<a href='$1' target='_blank'>$1</a>");
    },
    nl2br: function(value) {
      if (typeof value === "undefined" || value === null) {
        return "";
      }
      const breakTag = "<br>";
      return (value + "").replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        "$1" + breakTag + "$2"
      );
    }
  },
  mounted: async function() {
    await this.setIsUserPage();
    await this.getUserData();
  },
  data() {
    return {
      isUserPage: false,
      snackbar: false,
      snackbarText: "",
      table: null,
      rivalTable: null,
      tableData: [],
      rivalTableData: [],
      contestTableData: [],
      progress: false,
      username: "",
      bio: "",
      addRivalLoading: false,
      removeRivalLoading: false,
      updateBioLoading: false,
      generateApiKeyLoading: false,
    };
  },
  methods: {
    setIsUserPage: async function(){
      try {
        this.isUserPage = (await this.getCurrentUser()).UserId == this.getUserId();
      } catch (err) {
        this.isUserPage = false;
      }
    },
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
    getUserId: function() {
      return this.$route.params.userid;
    },
    createTable: function(tabledata) {
      this.table = new Tabulator(this.$refs.table, {
        layout: "fitColumns",
        reactiveData:true,
        columns: [
        { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
        { formatter: "textarea", title: "Title", field: "title", minWidth: 200, headerSort: false, resizable: false },
        { formatter: "textarea",title: "Artist", field: "artist", minWidth: 200, headerSort: false, resizable: false },
          {
            title: "IR Links",
            field: "songhash",
            width: 80,
            formatter: function(cell, formatterParams) {
              let value = cell.getValue();
              let songhashArray = value.split(".");
              return `<a href="./#/viewer/song/${songhashArray[0]}/0">IR</a><br><a href="./#/viewer/song/${songhashArray[0]}/1">IR(CN)</a><br><a href="./#/viewer/song/${songhashArray[0]}/2">IR(HCN)</a>`;
            },
            headerSort: false,
            resizable: false
          }
        ]
      });
      this.tableData = tabledata;
    },
    createRivalTable: function(tabledata) {
      this.rivalTable = new Tabulator(this.$refs.rivalTable, {
        layout: "fitColumns",
        columns: [
          {
            title: "Name",
            field: "username",
            headerSort: false,
            formatter: function(cell, formatterParams) {
              let data = cell.getRow().getData();
              let username = cell.getValue();
              let userid = data.userid;
              return `<a href="./#/viewer/user/${userid}">${username}</a>`;
            }
          }
        ]
      });
      this.rivalTableData = tabledata;
    },
    createContestTable: function(tabledata) {
      // console.log(tabledata);
      const self = this;
      this.contestTable = new Tabulator(this.$refs.contestTable, {
        layout: "fitColumns",
        columns: [
          {
            title: "Name",
            field: "contestId",
            headerSort: false,
            formatter: function(cell, formatterParams) {
              let data = cell.getRow().getData();
              console.log(data);
              let contestId = cell.getValue();
              let contestName = data.contestName;
              return `<a href="./#/viewer/contest/${contestId}">${contestName}</a>`;
            }
          },
          {
            field: "contestId",
            headerSort: false,
            align:"center",
            width:180,
            formatter: function(cell, formatterParams) {
              if(self.isUserPage){
                return `<button type="button" class="v-btn theme--light error"><div class="v-btn__content">LEAVE CONTEST</div></button>`;
              }
              return ``;
            },
            cellClick: function(e, cell) {
              if(self.isUserPage){
                const data = cell.getRow().getData();
                self.leaveContest(data.contestId);
              }
            }
          },
        ]
      });
      this.contestTableData = tabledata;
    },
    getUserData: async function() {
      this.progress = true;
      let userid = this.getUserId();
      let loginUserId = this.userid;

      if (this.isUserPage) {
        this.getUserDataLogin();
        return;
      }

      const ks = decrypt.get("get_user_data").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_user_data",
        Payload: JSON.stringify({
          userId: userid
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.createTable(json.ScoreDatas);
            self.username = json.UserData.username;
            self.bio = json.UserData.bio;
          } else {
            return;
          }
        }
      });
    },
    getUserDataLogin: async function() {
      this.progress = true;
      let userid = this.getUserId();

      const ks = decrypt.get("get_user_data_login").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_user_data_login",
        Payload: JSON.stringify(await this.getCurrentUser())
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.createTable(json.ScoreDatas);
            self.createRivalTable(json.UserData.rivals);
            self.createContestTable(json.UserData.contest)
            self.username = json.UserData.username;
            self.bio = json.UserData.bio;
          } else {
            return;
          }
        }
      });
    },
    updateBio: async function() {
      this.updateBioLoading = true;
      let userData = await this.getCurrentUser();

      let bio = this.bio;
      const ks = decrypt.get("update_user_data").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "update_user_data",
        Payload: JSON.stringify({
          bio: bio,
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.updateBioLoading = false;
        if (err) {
          self.snackbarText = "Failed to update bio.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully updated bio.";
            self.snackbar = true;
          } else {
            self.snackbarText = "Failed to update bio.";
            self.snackbar = true;
            return;
          }
        }
      });
    },
    addRival: async function() {
      this.addRivalLoading = true;
      let userid = this.getUserId();
      let userData = await this.getCurrentUser();

      const ks = decrypt.get("add_rival").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "add_rival",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          rivalId: userid
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.addRivalLoading = false;
        if (err) {
          self.snackbarText = "Failed to add rival.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully added rival.";
            self.snackbar = true;
            return;
          } else {
            self.snackbarText = "Failed to add rival.";
            self.snackbar = true;
            return;
          }
        }
      });
    },
    removeRival: async function() {
      this.removeRivalLoading = true;
      let userid = this.getUserId();
      let userData = await this.getCurrentUser();

      const ks = decrypt.get("remove_rival").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "remove_rival",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          rivalId: userid
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.removeRivalLoading = false;
        if (err) {
          self.snackbarText = "Failed to remove rival.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully removed rival.";
            self.snackbar = true;
            return;
          } else {
            self.snackbarText = "Failed to remove rival.";
            self.snackbar = true;
            return;
          }
        }
      });
    },
    leaveContest: async function(contestId) {
      this.progress = true;
      let userData = await this.getCurrentUser();

      const ks = decrypt.get("leave_contest").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "leave_contest",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          contestId: contestId
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
          self.snackbarText = "Failed to leave Contest.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully leave Contest.";
            self.snackbar = true;
            self.contestTableData = self.contestTableData.filter((c) => {return c.contestId != contestId;});
            return;
          } else {
            self.snackbarText = "Failed to leave Contest.";
            self.snackbar = true;
            return;
          }
        }
      });
    }
  }
};
</script>

<style>
  @import '~tabulator-tables/dist/css/tabulator.min.css';
</style>