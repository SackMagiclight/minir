<template>
  <div>
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
                                <v-icon>title</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ headerData.name }}
                              </v-flex>
                            </v-layout>
                          </v-card>
                        </v-flex>
                        <v-flex xs12 mb-2>
                          <v-card flat>
                            <v-layout>
                              <v-flex xs2>
                                <v-icon>lock</v-icon>
                              </v-flex>
                              <v-flex xs10>
                                {{ headerData.constraints }}
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
          <div ref="songTable"></div>
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
import axios from "axios";
import Tabulator from "tabulator-tables";

export default {
  name: "Cource",
  watch: {
    $route(to, from) {
      this.getCourceData();
    },
    courceData:{
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
    msg: String
  },
  mounted: function() {
    this.getCourceData();
  },
  data() {
    return {
      table: null,
      songTable: null,
      progress: false,
      courceData: [],
      songData: [],
      headerData: {}
    };
  },
  methods: {
    getCourceHash: function() {
      return this.$route.params.courcehash;
    },
    getLnMode: function() {
      return this.$route.params.lnmode;
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
            align: "left",
            formatter: "progress",
            formatterParams: { min: 0, max: notes * 2, legend: true },
            headerSort: false,
            minWidth: 150,
            resizable: false
          },
          {
            title: "Combo",
            field: "combo",
            align: "left",
            formatter: "progress",
            formatterParams: {
              min: 0,
              max: notes,
              color: "orange",
              legend: true
            },
            headerSort: false,
            minWidth: 150,
            resizable: false
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
    getCourceData: function() {
      this.progress = true;
      const courcehash = this.getCourceHash();
      const lnmode = this.getLnMode();

      const self = this;

      AWS.config.update({
        accessKeyId: "AKIAIUNY56NANW7JGMTA",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      let lambda = new AWS.Lambda();
      let params = {
        FunctionName: "get_cource_data",
        Payload: JSON.stringify({
          songhash: courcehash + (lnmode ? "." + lnmode : ".0")
        })
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (!err) {
          const json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.createTable(json.IRDatas[0].notes);
            self.courceData = json.IRDatas;
            self.createSongTable();
            self.songData = json.CourceData.songs
            self.headerData = json.CourceData;
          }
        }
      });
    }
  }
};
</script>

