<template>
  <v-container text-xs-center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-container text-xs-left>
            <v-layout row wrap>
              <v-flex xs12>
                <v-alert
                :value="errorMessage"
                type="error"
                >
                {{errorMessage}}
                </v-alert>
              </v-flex>
              <v-flex xs4>
                <v-subheader>Keyword</v-subheader>
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
import axios from "axios";
import Tabulator from "tabulator-tables";
const decrypt = require("../decrypt");

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
          field: "sha256",
          width: 80,
          formatter: function(cell, formatterParams) {
            let value = cell.getValue();
            return `<a href="./#/viewer/song/${value}/0" target="_blank">IR</a><br><a href="./#/viewer/song/${value}/1" target="_blank">IR(CN)</a><br><a href="./#/viewer/song/${value}/2" target="_blank">IR(HCN)</a>`;
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
      axios.get(`https://jdfts1v0wmdeklb-bms.adb.us-ashburn-1.oraclecloudapps.com/ords/bmsquery/bms_text/de6bd8b08c60?text=${this.title}`,{
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        }
      })
      .then((val) => {
        if (val.data) {
          self.tableData = val.data.items
        }
      }).catch((err) => {
        self.tableData = []
      }).finally(() => {
        self.loading = false
      });
    }
  }
};
</script>

