window.addEventListener("load", function () {
    let allow = Cookies.get('cookiestatus');
    if (allow == "allow") {
      return;
    }
    window.cookieconsent.initialise({
      "palette": {
        "popup": {
          "background": "#efefef",
          "text": "#404040"
        },
        "button": {
          "background": "#8ec760",
          "text": "#ffffff"
        }
      },
      "theme": "edgeless",
      "type": "opt-in",
      "onStatusChange": function (status) {
        Cookies.set("cookiestatus", status, { path: '/minir/' });
      },
    })
  });