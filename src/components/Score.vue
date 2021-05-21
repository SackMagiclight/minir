<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-flex xs12>
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
                                <div style="overflow-wrap: anywhere;">{{ songData.genre }}</div>
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
                                <div style="overflow-wrap: anywhere;">{{ songData.title }}</div>
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
                                <div style="overflow-wrap: anywhere;">{{ songData.artist }}</div>
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
      </v-layout>
    </v-container>
    <v-container text-xs-center>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <v-card-text>
              <h1>{{ scoreData.username }}</h1>
              <h2>Score: {{ scoreData.score }} / {{ songData.notes * 2 }} ( {{ (Math.floor(scoreData.score / (songData.notes * 2) * 10000) / 10000) * 100 }} % ) </h2>
              <v-layout row wrap>
                <v-flex xs6>
                  <pie-chart :chart-data="tableData" />
                </v-flex>
                <v-flex xs6>
                  <pie-chart :chart-data="tableData2" />
                </v-flex>
                <v-flex xs6>
                  <pie-chart :chart-data="tableData3" />
                </v-flex>
                <v-flex xs6>
                  <pie-chart :chart-data="tableData4" />
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
/* eslint-disable */
import AWS from "aws-sdk";
import axios from "axios";
import { Auth } from 'aws-amplify';
const decrypt = require("../decrypt");
import PieChart from './chart/PieChart'

export default {
  name: "Song",
  components: {
    PieChart,
  },
  watch: {
    $route(to, from) {
      this.getSongData();
    },
    signedIn: async function(newValue, oldValue) {
      this.signedIn = newValue;
    },
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
      tableData: {},
      tableData2: {},
      tableData3: {},
      tableData4: {},
      progress: false,
      songData: {},
      stellaPath: null,
      videoId: "",
      enableVideoIdEditor: false,
      updateVideoIdLoading: false,
      scoreData: {}
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
        return returnData;
      } catch(err){
        // eslint-disable-next-line
        console.log(err);
        return {};
      }
    },
    getSongHash: function() {
      return this.$route.params.songhash;
    },
    getLnMode: function() {
      return this.$route.params.lnmode;
    },
    getUserid: function() {
      return this.$route.params.userid;
    },
    getSongData: function() {
      this.progress = true;
      const songhash = this.getSongHash();
      const lnmode = this.getLnMode();

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
          songhash: songhash + (lnmode ? "." + lnmode : ".0"),
          userid: self.getUserid()
        })
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (!err) {
          const json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.songData = json.SongData;
            self.scoreData = json.IRDatas.length ? json.IRDatas[0] : null;
            if(self.scoreData) {
              self.createTable(self.scoreData, self.songData);
            }
            self.getStellaPath();
          }
        }
      });
    },
    createTable: function(score, song) {
      const self = this;
      this.tableData = {
        labels: [ "PGREAT","GREAT" ],
        datasets: [
          {
            label: 'SCORE',
            backgroundColor: ["#ffd700", "#66cdaa"],
            data: [score.epg + score.lpg, score.egr + score.lgr]
          },
        ]
      }
      this.tableData2 = {
        labels: [ "E-PGREAT","E-GREAT","L-PGREAT","L-GREAT" ],
        datasets: [
          {
            label: 'DETAIL',
            backgroundColor: ["#4169e1", "#4682b4", "#ff7f50", "#ff6347"],
            data: [score.epg, score.egr, score.lpg, score.lgr]
          }
        ]
      }
      this.tableData3 = {
        labels: [ "E-PGREAT", "L-PGREAT"],
        datasets: [
          {
            label: 'DETAIL',
            backgroundColor: ["#4169e1", "#ff7f50"],
            data: [score.epg, score.lpg,]
          }
        ]
      }
      this.tableData4 = {
        labels: [ "E-GREAT", "L-GREAT"],
        datasets: [
          {
            label: 'DETAIL',
            backgroundColor: ["#4169e1", "#ff7f50"],
            data: [score.egr, score.lgr,]
          }
        ]
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
  #table .tabulator-row { height:150px;}
</style>
