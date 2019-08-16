<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <img width="80%" src="logo.png" alt="MinIR" class="mb-5">
      </v-layout>
    </v-slide-y-transition>
    <h1 class="text-xs-center">Update history</h1>
    <v-container text-xs-left>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card flat>
            <v-container fluid grid-list-lg>
              <v-layout row wrap>
                  <v-flex xs12 v-for="(item, i) in history" :key="i">
                    <v-card flat>
                      <v-layout>
                        <v-flex xs2>
                          <v-icon>{{ item.icon }}</v-icon>
                        </v-flex>
                        <v-flex xs10>
                          <div>{{ item.text }}</div>
                          <div>[{{ item.date }}]</div>
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
  </v-container>
</template>

<script>
import historyJson from '../assets/history.json'
export default {
  name: "Index",
  props: {
    msg: String
  },
  data() {
    return {
      history : historyJson,
      styleObject: {
        background: 'rgba(255,255,255,0)'
      }
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
