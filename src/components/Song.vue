<template>
  <div>
    <v-container>
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
                                <v-icon>music_note</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ songData.genre }}
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout>
                              <v-flex xs2>
                                <v-icon>title</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ songData.title }}
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
                                {{ songData.artist }}
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout>
                              <v-flex xs2>
                                <v-icon>fast_forward</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ songData.maxbpm == songData.minbpm ? songData.maxbpm : songData.minbpm + "-" + songData.maxbpm }}
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout>
                              <v-flex xs2>
                                <v-icon>stars</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                ☆{{ songData.level }}
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout>
                              <v-flex xs2>
                                <v-icon>assessment</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ songData.notes }} Notes&nbsp;/&nbsp;{{ songData.total }}&nbsp;total
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2 v-if="!progress">
                          <v-card flat>
                            <v-layout justify-start row>
                              <v-flex xs12 v-if="stellaPath">
                                <v-layout>
                                  <v-btn
                                    block
                                    color="#001529" 
                                    :href="stellaPath" target="_blank">
                                      <span style="color: white; text-transform: none;" >Stella / Satellite</span>
                                  </v-btn>
                                </v-layout>
                              </v-flex>
                              <v-flex xs12>
                                <v-layout>
                                  <v-btn
                                    block
                                    color="#75491E" 
                                    :href="getMochaURL" target="_blank">
                                      <span style="color: white; text-transform: none;" >Mocha</span>
                                  </v-btn>
                                </v-layout>
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout justify-start row>
                              <v-flex xs12>
                                <social-sharing :url="getHref"
                                          :title="`[MinIR SongPage] ${songData.title}`"
                                          inline-template>
                                  <v-layout>
                                    <network network="twitter">
                                      <v-btn block color="#1b95e0">
                                        <v-icon color="white">fab fa-twitter</v-icon>
                                        <span style="color: white; text-transform: none;" >tweet</span>
                                      </v-btn>
                                    </network>
                                  </v-layout>
                                </social-sharing>
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                      </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex xs12 md6>
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
              <v-flex xs12 v-if="videoId" v-show="!$vuetify.breakpoint.xs">
                <youtube :video-id="videoId" player-width="560" player-height="345"></youtube>
                <v-card v-if="signedIn">
                  <v-card-text>
                    <v-layout row>
                      <v-flex p>
                        <v-switch
                          v-model="enableVideoIdEditor"
                          color="primary"
                        ></v-switch>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          :disabled="!enableVideoIdEditor"
                          v-model="videoId"
                        ></v-text-field>
                      </v-flex>
                      <v-flex p>
                        <v-btn 
                          :loading="updateVideoIdLoading"
                          :disabled="!enableVideoIdEditor || updateVideoIdLoading"
                          color="primary" 
                          @click.native="updateVideoId()">Update Video ID</v-btn>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 v-if="!videoId" v-show="!$vuetify.breakpoint.xs">
                <v-layout justify-center column fill-height>
                  <v-card>
                    <v-card-title primary-title>
                      <div>
                        <h3 class="headline mb-0">Nothing Video</h3>
                        <div>Please add Youtube video.<span v-if="!signedIn">(Need to login.)</span></div>
                      </div>
                    </v-card-title>
                    <v-card-text v-if="signedIn">
                      <v-layout row>
                        <v-flex p>
                          <v-switch
                            v-model="enableVideoIdEditor"
                            color="primary"
                          ></v-switch>
                        </v-flex>
                        <v-flex xs12>
                          <v-text-field
                            :disabled="!enableVideoIdEditor"
                            v-model="videoId"
                          ></v-text-field>
                        </v-flex>
                        <v-flex p>
                          <v-btn 
                            :loading="updateVideoIdLoading"
                            :disabled="!enableVideoIdEditor ||updateVideoIdLoading"
                            color="primary" 
                            @click.native="updateVideoId()">Update Video ID</v-btn>
                        </v-flex>
                      </v-layout>
                    </v-card-text>
                  </v-card>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container text-xs-center>
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
import axios from "axios";
import Tabulator from "tabulator-tables";
import { AmplifyEventBus } from 'aws-amplify-vue';
import Amplify, { Auth } from 'aws-amplify';

export default {
  name: "Song",
  watch: {
    $route(to, from) {
      this.getSongData();
    },
    signedIn: async function(newValue, oldValue) {
      this.signedIn = newValue;
    },
    tableData:{
      handler: function (newData) {
        this.table.replaceData(newData);
      },
      deep: true,
    }
  },
  props: {
    signedIn: Boolean
  },
  mounted: function() {
    this.getSongData();
  },
  data() {
    return {
      table: null,
      tableData: [],
      progress: false,
      songData: {},
      stellaPath: null,
      videoId: "",
      enableVideoIdEditor: false,
      updateVideoIdLoading: false,
    };
  },
  computed: {
    getHref : function() {
      return location.href;
    },
    getMochaURL : function() {
      return `https://mocha-repository.info/song.php?sha256=${this.getSongHash()}&lnmode=${(Number(this.getLnMode())+1)}`;
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
    getYoutubeId: function(songData) {
      this.videoId = songData.video ? songData.video.videoid : "";
    },
    getSongHash: function() {
      return this.$route.params.songhash;
    },
    getLnMode: function() {
      return this.$route.params.lnmode;
    },
    createTable: function(notes) {
      this.table = new Tabulator(this.$refs.table, {
        layout: "fitColumns",
        pagination:"local",
        paginationSize: 30,
        rowFormatter: function(row) {
          if (row.getData().novalidate) {
            row.getElement().style.backgroundColor = "#A6A6DF";
          }
        },
        columns: [
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
          },
          {
            title: "Score",
            field: "score",
            minWidth: 150,
            resizable: false,
            align: "left",
            formatter: "progress",
            formatterParams: { min: 0, max: notes * 2, legend: true },
            headerSort: false
          },
          {
            title: "Combo",
            field: "combo",
            minWidth: 150,
            resizable: false,
            align: "left",
            formatter: "progress",
            formatterParams: {
              min: 0,
              max: notes,
              color: "orange",
              legend: true
            },
            headerSort: false
          },
          {
            title: "Clear",
            field: "clear",
            align: "center",
            width: 150,
            resizable: false,
            headerSort: false,
            formatter: function(cell, formatterParams) {
              switch (cell.getValue()) {
                case 0:
                  cell.getElement().style.backgroundColor =
                    "rgb(255, 255, 255)";
                  return "NoPlay";
                case 1:
                  cell.getElement().style.backgroundColor =
                    "rgb(192, 192, 192)";
                  return "Failed";
                case 2:
                  cell.getElement().style.backgroundColor =
                    "rgb(149, 149, 255)";
                  return "AssistEasy";
                case 3:
                  cell.getElement().style.backgroundColor =
                    "rgb(149, 149, 255)";
                  return "LightAssistEasy";
                case 4:
                  cell.getElement().style.backgroundColor =
                    "rgb(152, 251, 152)";
                  return "Easy";
                case 5:
                  cell.getElement().style.backgroundColor =
                    "rgb(152, 251, 152)";
                  return "Normal";
                case 6:
                  cell.getElement().style.backgroundColor = "rgb(255, 99, 71)";
                  return "Hard";
                case 7:
                  cell.getElement().style.backgroundColor = "rgb(255, 217, 0)";
                  return "ExHard";
                case 8:
                  cell.getElement().style.backgroundColor = "rgb(255, 140, 0)";
                  return "FullCombo";
                case 9:
                  cell.getElement().style.backgroundColor = "rgb(255, 140, 0)";
                  return "Perfect";
                case 10:
                  cell.getElement().style.backgroundColor = "rgb(255, 140, 0)";
                  return "Max";
              }
            }
          }
        ]
      });
    },
    getSongData: function() {
      this.progress = true;
      const songhash = this.getSongHash();
      const lnmode = this.getLnMode();

      const self = this;

      AWS.config.update({
        accessKeyId: "AKIAIUNY56NANW7JGMTA",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_song_data",
        Payload: JSON.stringify({
          songhash: songhash + (lnmode ? "." + lnmode : ".0")
        })
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (!err) {
          const json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.songData = json.SongData;
            self.createTable(json.SongData.notes);
            self.tableData = json.IRDatas;
            self.getYoutubeId(json.SongData);
            self.getStellaPath();
          }
        }
      });
    },
    updateVideoId: async function() {
      this.updateVideoIdLoading = true;
      let userData = await this.getCurrentUser();
      let Songhash = this.getSongHash();
      let VideoId = this.videoId;

      AWS.config.update({
        accessKeyId: "AKIAJGA7ZWB5TQNJMNCA",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "update_song_data",
        Payload: JSON.stringify({
          AccessToken: userData.AccessToken,
          RefreshToken: userData.RefreshToken,
          Songhash: Songhash,
          VideoId: VideoId,
        })
      };

      const self = this;
      try{
        const data = await lambda.invoke(params).promise();
        self.updateVideoIdLoading = false;
        self.enableVideoIdEditor = false;
        self.updateVideoIdLoading = false;
        self.getSongData();
      } catch (err){
        // error
      }
    },
    getStellaPath: function() {
      const self = this;
      axios.get(`https://stellabms.xyz/sha256/${this.getSongHash()}`,{
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        }
      })
      .then((val) => {
        console.log(val);
        if(val.status != 404){
          self.stellaPath = `https://stellabms.xyz/sha256/${self.getSongHash()}`;
        } else {
          self.stellaPath = null;
        }
      }).catch((err) => {
        self.stellaPath = null;
      });
    }
  }
};
</script>

<style>
  @import '~tabulator-tables/dist/css/tabulator.min.css';
</style>