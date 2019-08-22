<template>
  <v-container text-xs-center>
      <v-layout align-space-between justify-center row fill-height v-resize="onResize">
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
const decrypt = require("../decrypt");

export default {
  name: "CourceLatest",
  watch: {
    $route(to, from) {
      this.getLatestData();
    },
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
      height: this.tableHeight(),
      reactiveData:true,
      columns: [
        { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
        { formatter: "textarea", title: "Cource Name", field: "name", headerSort: false, resizable: false },
        {
          title: "IR Links",
          field: "courcehash",
          width: 80,
          formatter: function(cell, formatterParams) {
            let value = cell.getValue();
            return `<a href="./#/viewer/cource/${value}/0">IR</a><br><a href="./#/viewer/cource/${value}/1">IR(CN)</a><br><a href="./#/viewer/cource/${value}/2">IR(HCN)</a>`;
          },
          headerSort: false, 
          resizable: false
        }
      ]
    });

    this.getLatestData();
  },
  data() {
    return {
      table: null,
      progress: false,
      tableData: []
    };
  },
  methods: {
    onResize () {
      if(this.table){
        this.table.setHeight(this.tableHeight());
        this.table.redraw();
      }
    },
    tableHeight: function () {
      return window.innerHeight -100 + "px";
    },
    getMode: function() {
      return this.$route.params.mode;
    },
    getLatestData: function() {
      this.progress = true;
      let mode = this.getMode();
      const self = this;
      this.tableData = [];

      const ks = decrypt.get("get_cource_played_100").split(",");
      AWS.config.update({
        accessKeyId: ks[0],
        secretAccessKey: ks[1]
      });
      AWS.config.region = 'us-east-1';
      var lambda = new AWS.Lambda();
      var params = {
          FunctionName: 'get_cource_played_100'
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
        } else {
          var json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            self.tableData = json.courceDatas;
          } else {
          }
        }
      });
    }
  }
};
</script>

