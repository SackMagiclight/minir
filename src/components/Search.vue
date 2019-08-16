<template>
  <v-container text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-container text-xs-left>
            <v-layout row wrap>
              <v-flex xs12>
                <h3>Search Restriction: Once a minute</h3>
              </v-flex>
              <v-flex xs12>
                <v-alert
                :value="errorMessage"
                type="error"
                >
                {{errorMessage}}
                </v-alert>
              </v-flex>
              <v-flex xs4>
                <v-subheader>Play Mode</v-subheader>
              </v-flex>
              <v-flex xs8>
                <v-select
                  v-model="mode"
                  :items="modes"
                  item-text="title"
                  item-value="key"
                  label="Select mode"
                  single-line
                ></v-select>
              </v-flex>
              <v-flex xs4>
                <v-subheader>Title Keyword</v-subheader>
              </v-flex>
              <v-flex xs8>
                <v-text-field
                    v-model="title"
                    :rules="[rules.required, rules.min]"
                    type="text"
                    name="input-10-1"
                    hint="At least 3 characters"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 class="text-xs-right">
                <v-btn 
                  outline 
                  flat
                  color="primary" 
                  @click.native="getSongData()" 
                  :disabled="!validate()"
                  :loading="loading">
                  Search
                  <span slot="loader">
                    <v-progress-circular
                      :rotate="-90"
                      :width="15"
                      :value="loadingValue"
                      color="primary"
                    ></v-progress-circular>
                  </span>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap style="margin-top:10px;">
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
</template>

<script>
/* eslint-disable */
import AWS from "aws-sdk";
import Tabulator from "tabulator-tables";

export default {
  name: "Search",
  watch: {
    tableData:{
      handler: function (newData) {
        this.table.replaceData(newData);
      },
      deep: true,
    }
  },
  props: {
    msg: String
  },
  mounted: function() {
    this.table = new Tabulator(this.$refs.table, {
      layout: "fitColumns",
      reactiveData:true,
      columns: [
        { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
        { formatter: "textarea", title: "Title", field: "title", minWidth: 200, headerSort: false, resizable: false },
        { formatter: "textarea", title: "Artist", field: "artist", minWidth: 200, headerSort: false, resizable: false },
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
  data() {
    return {
      errorMessage: null,
      table: null,
      tableData: [],
      progress: false,
      loading: false,
      loadingValue: 100,
      title: "",
      mode: "beat-7k",
      modes: [
        { title: "7KEYS", key: "beat-7k" },
        { title: "5KEYS", key: "beat-5k" },
        { title: "10KEYS", key: "beat-10k" },
        { title: "14KEYS", key: "beat-14k" },
        { title: "PMS 5KEYS", key: "popn-5k" },
        { title: "PMS 9KEYS", key: "popn-9k" },
        { title: "KM 24KEYS", key: "keyboard-24k" },
        { title: "KM 48KEYS", key: "keyboard-48k" }
      ],
      rules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 3 || "Min 3 characters."
      }
    };
  },
  methods: {
    validate: function() {
      return (
        this.rules.required(this.title) == true &&
        this.rules.min(this.title) == true
      );
    },
    getSongData: function() {
      const self = this;
      this.loading = true;
      if(this.interval){
        clearInterval(this.interval);
        this.interval = null;
      }
      this.interval = setInterval(() => {
        if (self.loadingValue < 0) {
          self.loadingValue = 100
          self.loading = false;
          clearInterval(self.interval);
          self.interval = null;
          return;
        }
        self.loadingValue -= 10/6
      }, 1000);

      
      this.errorMessage = null;
      this.progress = true;
      let mode = this.mode;
      this.tableData = [];

      AWS.config.update({
        accessKeyId: "AKIAIUNY56NANW7JGMTA",
        secretAccessKey: "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"
      });
      AWS.config.region = "us-east-1";
      var lambda = new AWS.Lambda();
      var params = {
        FunctionName: "search_song_data",
        Payload: JSON.stringify({
          mode: this.mode,
          title: this.title
        })
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
        } else {
          var json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            console.log(json.songDatas);
            self.tableData = json.songDatas;
          } else {
            if(json.errorMessage){
              self.errorMessage = json.errorMessage;
            } else if(json.message) {
              self.errorMessage = json.message;
            }
          }
        }
      });
    }
  }
};
</script>

