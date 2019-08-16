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
const moment = require('moment');
window.moment = moment;

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
    let self = this;
    this.table = new Tabulator(this.$refs.table, {
      layout: "fitColumns",
      height: this.tableHeight(),
      reactiveData:true,
      rowClick:function(e, row){
          self.$router.push(`/viewer/contest/${row.getData().contestId}`);
          //window.open(`./#/viewer/contest/${row.getData().contestId}`);
      },
      columns: [
        { formatter: "rownum", align: "center", width: 40, headerSort: false, resizable: false },
        { formatter: "textarea", title: "Contest Name", minWidth: 150, field: "contestName", headerSort: false, resizable: false },
        { formatter: "datetime", title: "Start Datetime", width: 200, field: "startDateTime", headerSort: false, resizable: false, 
          formatterParams:{ inputFormat: "YYYY-MM-DDTHH:mm:ssZ", outputFormat: "YYYY/MM/DD HH:mm:ssZZ", invalidPlaceholder:"(invalid date)",}},
        { formatter: "datetime", title: "End Datetime", width: 200, field: "endDateTime", headerSort: false, resizable: false, 
          formatterParams:{ inputFormat: "YYYY-MM-DDTHH:mm:ssZ", outputFormat: "YYYY/MM/DD HH:mm:ssZZ", invalidPlaceholder:"(invalid date)",}}
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

      AWS.config.update({
            accessKeyId: 'AKIAIUNY56NANW7JGMTA',
            secretAccessKey: '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'
      });
      AWS.config.region = 'us-east-1';
      var lambda = new AWS.Lambda();
      var params = {
          FunctionName: 'get_contests_100'
      };

      lambda.invoke(params, function(err, data) {
        self.progress = false;
        if (err) {
        } else {
          var json = JSON.parse(data.Payload.toString());
          if (json.message == "success") {
            // console.log(json.contestDatas);
            self.tableData = json.contestDatas;
          } else {
          }
        }
      });
    }
  }
};
</script>

