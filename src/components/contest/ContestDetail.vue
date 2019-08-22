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
        <v-flex xs12 md6>
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
              <v-flex xs12>
                <v-card>
                  <v-container
                    fluid
                    grid-list-lg
                  >
                    <v-layout row wrap>
                      <v-flex xs12 mb-2>
                        <v-card flat>
                          <v-layout>
                            <v-flex xs2>
                              <v-icon>search</v-icon>
                            </v-flex>
                            <v-flex xs10>
                              {{ headerData.contestId }}
                            </v-flex>
                          </v-layout>
                        </v-card>
                      </v-flex>
                      <v-flex xs12 mb-2>
                        <v-card flat>
                          <v-layout>
                            <v-flex xs2>
                              <v-icon v-if="headerData.password">lock</v-icon>
                              <v-icon v-else>title</v-icon>
                            </v-flex>
                            <v-flex xs10>
                              {{ headerData.contestName }}
                            </v-flex>
                          </v-layout>
                        </v-card>
                      </v-flex>
                      <v-flex xs12 mb-2>
                        <v-card flat>
                          <v-layout>
                            <v-flex xs2>
                              <v-icon>schedule</v-icon>
                            </v-flex>
                            <v-flex xs10>
                              {{ headerData.startDateTime | moment }} - {{ headerData.endDateTime | moment}}
                            </v-flex>
                          </v-layout>
                        </v-card>
                      </v-flex>
                      <v-flex xs12 mb-2>
                        <v-card flat>
                          <v-layout>
                            <v-flex xs2>
                              <v-icon>person</v-icon>
                            </v-flex>
                            <v-flex xs10>
                              {{ headerData.createUserName }}
                            </v-flex>
                          </v-layout>
                        </v-card>
                      </v-flex>
                      <v-flex xs12 mb-2>
                        <social-sharing :url="getHref"
                                        :title="`[MinIR Contest] ${headerData.contestName}\n`"
                                        inline-template>
                          <v-layout row justify-center>
                            <network network="twitter">
                              <v-btn color="#1b95e0">
                                <v-icon color="white">fab fa-twitter</v-icon>
                                <span style="color: white;" >tweet</span>
                              </v-btn>
                            </network>
                          </v-layout>
                        </social-sharing>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
              <v-flex xs12 text-xs-left v-if="!!headerData.description">
                <v-card >
                  <v-card-title primary-title>
                    <div>
                      <div :inner-html.prop="headerData.description | nl2br | replaseURL"></div>
                    </div>
                  </v-card-title>
                </v-card>
              </v-flex>
              <v-flex xs12 mb-2 v-if="signedIn">
                <v-card>
                  <v-card-title primary-title v-if="!!headerData.password">
                    <v-text-field
                      label="Join Password"
                      prepend-inner-icon="lock"
                      ref="password"
                      v-model="password"
                      :rules="[
                        () => !!password || 'This field is required',
                        () => enableJoinButton() || 'Invalid password.'
                      ]"
                    ></v-text-field>
                  </v-card-title>
                  <v-btn 
                    :loading="joinContestLoading"
                    :disabled="!enableJoinButton() || joinContestLoading"
                    color="primary" 
                    v-if="getNowDate.isBefore(getEndDate)"
                    @click.native="joinContest()">Join Contest</v-btn>
                  <v-btn 
                    :loading="leaveContestLoading"
                    :disabled="leaveContestLoading"
                    color="error" 
                    @click.native="leaveContest()">Leave Contest</v-btn>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex xs12 md6>
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
              <v-flex xs12>
                <div ref="songTable"></div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container text-xs-center>
      <v-layout row wrap>
        <v-flex xs12>
          <v-progress-circular
            :size="50"
            color="primary"
            indeterminate
            v-show="progress"
          ></v-progress-circular>
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
import moment from 'moment';
import jssha from "jssha";
import { AmplifyEventBus } from 'aws-amplify-vue';
import { Auth } from 'aws-amplify';
const decrypt = require("../../decrypt");

export default {
  name: "ContestDetail",
  filters: {
    moment: function (date) {
      if(!date || !moment(date).isValid()){
        return "";
      }
      return moment(date).format('YYYY/MM/DD HH:mm:ssZZ');
    },
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
  watch: {
    $route(to, from) {
      this.getContestData();
    },
    signedIn: async function(newValue, oldValue) {
      this.signedIn = newValue;
    },
    contestScoreData:{
      handler: function (newData) {
        this.table.replaceData(newData);
      },
      deep: true,
    },
    songData:{
      handler: function (newData) {
        this.songTable.replaceData(newData);
      },
      deep: true,
    }
  },
  props: {
    signedIn: Boolean
  },
  mounted: function() {
    this.getContestData();
  },
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      table: null,
      songTable: null,
      progress: false,
      contestScoreData: [],
      songData: [],
      headerData: {},
      joinContestLoading: false,
      leaveContestLoading: false,
      twitterUrl: "",
      password: ""
    };
  },
  computed: {
    getNowDate: function() {
      return moment();
    },
    getEndDate: function() {
      return moment(this.headerData.endDateTime);
    },
    getHref : function() {
      return location.href;
    }
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
    enableJoinButton: function () {
      if(!this.headerData.password) {
        return true;
      }

      if(!this.password || this.password === "") {
        return false;
      }

      let shaObj = new jssha('SHA-512', 'TEXT');
      shaObj.update(this.password);
      let password = shaObj.getHash("HEX");

      if(this.headerData.password == password){
        return true;
      }

      return false;
    },
    getContestId: function() {
      return this.$route.params.contestId;
    },
    createSongTable: function() {
      this.songTable = new Tabulator(this.$refs.songTable, {
        layout: "fitColumns",
        columns: [
          { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
          { formatter: "textarea", title: "SongTitle", field: "title", minWidth: 200, headerSort: false, resizable: false },
          {
            title: "IR Links",
            field: "songhash",
            width: 80,
            formatter: function(cell, formatterParams) {
              let value = cell.getValue();
              return `<a href="./#/viewer/song/${value}/0">IR</a><br><a href="./#/viewer/song/${value}/1">IR(CN)</a><br><a href="./#/viewer/song/${value}/2">IR(HCN)</a>`;
            },
            headerSort: false, 
            resizable: false
          }
        ]
      });
    },
    createTable: function(contestData, songDatas) {
      const columns = [
        { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
        {
          title: "Name",
          field: "username",
          resizable: false,
          minWidth: 150,
          headerSort: false,
          formatter: function(cell, formatterParams) {
            let data = cell.getRow().getData();
            let userid = data.userid;
            return `<a href="./#/viewer/user/${userid}">${cell.getValue()}</a>`;
          }
        }
      ];

      let totalMaxExScore = 0;
      for(let songhash of contestData.songs){
        const sh = songhash.split(".")[0];
        const ln = songhash.split(".")[1];
        const lnString = ln == 0 ? "LN or Default" : ln == 1 ? "CN" : "HCN";
        const songData = songDatas.find((element) => { return element.songhash == sh; });
        const cl = {
          title: songData.title + `<br>(LNMode: ${lnString})`,
          field: sh + "-" + ln,
          align: "left",
          formatter: "progress",
          formatterParams: { min: 0, max: songData.notes * 2, legend: true },
          headerSort: false,
          minWidth: 150,
          resizable: false
        };
        totalMaxExScore = totalMaxExScore + (songData.notes * 2);
        columns.push(cl);
      }

      columns.push({
        title: "Total Score",
        field: "total",
        align: "left",
        formatter: "progress",
        formatterParams: {
          min: 0,
          max: totalMaxExScore,
          color: "orange",
          legend: true
        },
        headerSort: false,
        minWidth: 150,
        resizable: false
      });

      // console.log(columns);

      this.table = new Tabulator(this.$refs.table, {
        layout: "fitColumns",
        pagination:"local",
        paginationSize: 30,
        columns: columns
      });
    },
    getContestData: function() {
      this.progress = true;
      const contestId = this.getContestId();

      const self = this;

      const ks = decrypt.get("get_contest").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_contest",
        Payload: JSON.stringify({
          contestId: contestId
        })
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (!err) {
          const json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.createTable(json.contestData, json.contestSongDatas);
            self.contestScoreData = self.createScoreDataView(json.contestData, json.contestSongDatas, json.contestScoreDatas);
            self.createSongTable();
            self.songData = json.contestSongDatas
            self.headerData = json.contestData;
          }
        }
      });
    },
    createScoreDataView: function(contestData, songDatas, scoreDatas) {
      const scores = [];
      
      for(let score of scoreDatas){
        const userData = {};
        userData.username = score.username;
        userData.userid = score.userid;

        let totalExScore = 0;
        for(let songhash of contestData.songs){
          const sh = songhash.split(".")[0];
          const ln = songhash.split(".")[1];
          const songScore = score.scores.find((element) => { return element.songhash == songhash; });
          if(!songScore){
            userData[sh + "-" + ln] = 0;
            continue;
          } else {
            userData[sh + "-" + ln] = songScore.score;
            totalExScore = totalExScore + songScore.score;
          }
        }
        
        
        userData.total = totalExScore;
        // console.log(userData);
        scores.push(userData);
      }

      
      scores.sort((a,b) => {return b.total - a.total;});
      return scores;
    },
    joinContest: async function() {
      this.joinContestLoading = true;
      let userData = await this.getCurrentUser();

      const ks = decrypt.get("join_contest").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "join_contest",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          contestId: this.getContestId()
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.joinContestLoading = false;
        if (err) {
          self.snackbarText = "Failed to join Contest.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully join Contest.";
            self.snackbar = true;
            return;
          }if (json.message == "join_limit") {
            self.snackbarText = "Join Limit. Please leave other Contest.";
            self.snackbar = true;
            return;
          } else {
            self.snackbarText = "Failed to join Contest.";
            self.snackbar = true;
            return;
          }
        }
      });
    },
    leaveContest: async function() {
      this.leaveContestLoading = true;
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
          contestId: this.getContestId()
        })
      };

      const self = this;
      lambda.invoke(params, function(err, data) {
        self.leaveContestLoading = false;
        if (err) {
          self.snackbarText = "Failed to leave Contest.";
          self.snackbar = true;
          return;
        } else {
          let json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.snackbarText = "Successfully leave Contest.";
            self.snackbar = true;
            return;
          } else {
            self.snackbarText = "Failed to leave Contest.";
            self.snackbar = true;
            return;
          }
        }
      });
    },
    getTwitterUrl : function(){
      // 現在のurlをエンコード
    	const url = encodeURIComponent(location.href);
    	// ページ文言(タイトルとかdescription) ここではdescriptionを使用
    	const txt = encodeURIComponent("MinIR contest - " + headerData.contestName + "-");
    	// Twitter用のurl作成 ハッシュタグもtxtを使用
    	this.twUrl = 'https://twitter.com/intent/tweet?text=' + txt + '&url=' + url;
    }
  }
};
</script>

