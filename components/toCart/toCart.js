Component({
  data: {
    finger: 0,
    linePos: []
  },
  methods: {
    start: function (params) {
      let proId = params.proid;
      let img = params.img;
      this.setData({
        'img':img
      })
      // params.position.linePos
      this.linePos = params.position.linePos;
      this.startAnimation();
    },
    startAnimation: function () {
      this.setData({
        hide_good_box: false
      })

      let index = 0,
        bezier_points = this.linePos['bezier_points'];
      let timeT = 0;
      var that = this;
      timeT = setInterval(function () {
        index++;
        if (index >= 30) {
          that.setData({
            hide_good_box: true,
            bus_x:1000,
            bus_y:1000
          })
          clearInterval(timeT);         
        }
        that.setData({
          bus_x: bezier_points[index]['x'],
          bus_y: bezier_points[index]['y']
        })
      }, 20);
      return false;
    },
  }
})