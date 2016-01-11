//绘制地图

var features0 = [{
    flag: 0,
    type: "Polygon",
    name: "中华恐龙园",
    desc: "中华恐龙园总区域",
    strokeWeight: 2,
    strokeColor: "#19A4EB",
    strokeOpacity: 0.8,
    fillColor: "#1791fc", //填充色
    fillOpacity: 0.2, //填充透明度
    lnglat: [{
        lng: 119.996667,
        lat: 31.825083
    }, {
        lng: 119.99922,
        lat: 31.828292
    }, {
        lng: 120.005207,
        lat: 31.825247
    }, {
        lng: 120.005701,
        lat: 31.824828
    }, {
        lng: 120.004928,
        lat: 31.824153
    }, {
        lng: 120.004199,
        lat: 31.823205
    }, {
        lng: 120.003705,
        lat: 31.822075
    }, {
        lng: 120.002804,
        lat: 31.821255
    }, {
        lng: 120.001924,
        lat: 31.820853
    }, {
        lng: 120.000572,
        lat: 31.820598
    }, {
        lng: 119.999564,
        lat: 31.820434
    }, {
        lng: 119.999285,
        lat: 31.820434
    }, {
        lng: 119.998384,
        lat: 31.821966
    }, {
        lng: 119.998062,
        lat: 31.823096
    }, {
        lng: 119.997697,
        lat: 31.823789
    }, {
        lng: 119.996731,
        lat: 31.824846
    }, {
        lng: 119.996667,
        lat: 31.825083
    }]
}];

var features1 = [{
        type: "Polygon",
        name: "鲁布拉",
        desc: "",
        strokeWeight: 2,
        strokeColor: "red",
        strokeOpacity: 0.8,
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.2, //填充透明度

        lnglat: [{
            lng: 120.002214,
            lat: 31.824915
        }, {
            lng: 120.002455,
            lat: 31.82476
        }, {
            lng: 120.002578,
            lat: 31.824632
        }, {
            lng: 120.002648,
            lat: 31.824518
        }, {
            lng: 120.002702,
            lat: 31.824404
        }, {
            lng: 120.002739,
            lat: 31.82424
        }, {
            lng: 120.002729,
            lat: 31.824081
        }, {
            lng: 120.002659,
            lat: 31.823871
        }, {
            lng: 120.002536,
            lat: 31.823684
        }, {
            lng: 120.002605,
            lat: 31.823657
        }, {
            lng: 120.002729,
            lat: 31.823657
        }, {
            lng: 120.002815,
            lat: 31.823679
        }, {
            lng: 120.002884,
            lat: 31.823689
        }, {
            lng: 120.002959,
            lat: 31.823679
        }, {
            lng: 120.003045,
            lat: 31.823679
        }, {
            lng: 120.003126,
            lat: 31.823675
        }, {
            lng: 120.003233,
            lat: 31.823657
        }, {
            lng: 120.003319,
            lat: 31.823629
        }, {
            lng: 120.003689,
            lat: 31.82352
        }, {
            lng: 120.003946,
            lat: 31.823515
        }, {
            lng: 120.004236,
            lat: 31.823538
        }, {
            lng: 120.004445,
            lat: 31.82357
        }, {
            lng: 120.004746,
            lat: 31.823976
        }, {
            lng: 120.004998,
            lat: 31.824236
        }, {
            lng: 120.005186,
            lat: 31.824473
        }, {
            lng: 120.005411,
            lat: 31.824691
        }, {
            lng: 120.005658,
            lat: 31.824956
        }, {
            lng: 120.005384,
            lat: 31.825147
        }, {
            lng: 120.004998,
            lat: 31.825398
        }, {
            lng: 120.003147,
            lat: 31.826332
        }, {
            lng: 120.002224,
            lat: 31.824906
        }, {
            lng: 120.002241,
            lat: 31.824906
        }]
    }, {
        type: "Polygon",
        name: "中华恐龙馆",
        desc: "",
        strokeWeight: 2,
        strokeColor: "blue",
        strokeOpacity: 0.8,
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.2, //填充透明度
        lnglat: [{
            lng: 120.00223,
            lat: 31.824901
        }, {
            lng: 120.00246,
            lat: 31.824755
        }, {
            lng: 120.002573,
            lat: 31.824628
        }, {
            lng: 120.002659,
            lat: 31.8245
        }, {
            lng: 120.002713,
            lat: 31.824359
        }, {
            lng: 120.002739,
            lat: 31.824208
        }, {
            lng: 120.002718,
            lat: 31.824049
        }, {
            lng: 120.002648,
            lat: 31.823844
        }, {
            lng: 120.002482,
            lat: 31.823638
        }, {
            lng: 120.002246,
            lat: 31.823442
        }, {
            lng: 120.002031,
            lat: 31.823274
        }, {
            lng: 120.00179,
            lat: 31.823164
        }, {
            lng: 120.001602,
            lat: 31.823114
        }, {
            lng: 120.001307,
            lat: 31.823091
        }, {
            lng: 120.001055,
            lat: 31.823105
        }, {
            lng: 120.000873,
            lat: 31.823164
        }, {
            lng: 120.000733,
            lat: 31.823283
        }, {
            lng: 120.000529,
            lat: 31.823616
        }, {
            lng: 120.000722,
            lat: 31.823693
        }, {
            lng: 120.000873,
            lat: 31.82383
        }, {
            lng: 120.00098,
            lat: 31.823962
        }, {
            lng: 120.001017,
            lat: 31.824144
        }, {
            lng: 120.000991,
            lat: 31.824678
        }, {
            lng: 120.000996,
            lat: 31.82476
        }, {
            lng: 120.001076,
            lat: 31.824883
        }, {
            lng: 120.001098,
            lat: 31.824978
        }, {
            lng: 120.001119,
            lat: 31.825225
        }, {
            lng: 120.001811,
            lat: 31.825147
        }, {
            lng: 120.002235,
            lat: 31.824896
        }]
    },   {
        type: "Polygon",
        name: "库克苏克",
        desc: "",
        strokeWeight: 2,
        strokeColor: "yellow",
        strokeOpacity: 0.8,
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.2, //填充透明度
        lnglat: [{
            lng: 120.001076,
            lat: 31.82311
        }, {
            lng: 120.000808,
            lat: 31.822868
        }, {
            lng: 120.000739,
            lat: 31.822772
        }, {
            lng: 120.000728,
            lat: 31.822636
        }, {
            lng: 120.00083,
            lat: 31.822221
        }, {
            lng: 120.001103,
            lat: 31.822171
        }, {
            lng: 120.001243,
            lat: 31.822143
        }, {
            lng: 120.001409,
            lat: 31.822061
        }, {
            lng: 120.00142,
            lat: 31.82182
        }, {
            lng: 120.001447,
            lat: 31.82171
        }, {
            lng: 120.001715,
            lat: 31.821637
        }, {
            lng: 120.002021,
            lat: 31.821592
        }, {
            lng: 120.002375,
            lat: 31.821619
        }, {
            lng: 120.002659,
            lat: 31.821843
        }, {
            lng: 120.003029,
            lat: 31.821925
        }, {
            lng: 120.003206,
            lat: 31.821993
        }, {
            lng: 120.003281,
            lat: 31.822139
        }, {
            lng: 120.003254,
            lat: 31.822339
        }, {
            lng: 120.003598,
            lat: 31.822604
        }, {
            lng: 120.003887,
            lat: 31.822722
        }, {
            lng: 120.00414,
            lat: 31.822959
        }, {
            lng: 120.004268,
            lat: 31.823406
        }, {
            lng: 120.004268,
            lat: 31.82347
        }, {
            lng: 120.003909,
            lat: 31.823588
        }, {
            lng: 120.003421,
            lat: 31.823638
        }, {
            lng: 120.003356,
            lat: 31.823643
        }, {
            lng: 120.003313,
            lat: 31.823652
        }, {
            lng: 120.003292,
            lat: 31.823657
        }, {
            lng: 120.002841,
            lat: 31.823684
        }, {
            lng: 120.002525,
            lat: 31.823684
        }, {
            lng: 120.002096,
            lat: 31.823324
        }, {
            lng: 120.001844,
            lat: 31.823178
        }, {
            lng: 120.001591,
            lat: 31.823123
        }, {
            lng: 120.00127,
            lat: 31.823091
        }, {
            lng: 120.001152,
            lat: 31.823096
        }, {
            lng: 120.001071,
            lat: 31.82311
        }]
    },

    {
        type: "Polygon",
        name: "",
        desc: "",
        strokeWeight: 2,
        strokeColor: "block",
        strokeOpacity: 0.8,
        fillColor: "#1791fc", //填充色
        fillOpacity: 0.2, //填充透明度
        lnglat: [{
            lng: 120.002208,
            lat: 31.824915
        }, {
            lng: 120.001822,
            lat: 31.825138
        }, {
            lng: 120.00142,
            lat: 31.825179
        }, {
            lng: 120.001109,
            lat: 31.825215
        }, {
            lng: 120.001093,
            lat: 31.824933
        }, {
            lng: 120.001023,
            lat: 31.824782
        }, {
            lng: 120.000991,
            lat: 31.824714
        }, {
            lng: 120.001007,
            lat: 31.824295
        }, {
            lng: 120.001007,
            lat: 31.824081
        }, {
            lng: 120.000953,
            lat: 31.823921
        }, {
            lng: 120.000819,
            lat: 31.823771
        }, {
            lng: 120.000717,
            lat: 31.823693
        }, {
            lng: 120.000524,
            lat: 31.823616
        }, {
            lng: 120.000653,
            lat: 31.823397
        }, {
            lng: 120.000819,
            lat: 31.823215
        }, {
            lng: 120.000958,
            lat: 31.823123
        }, {
            lng: 120.001312,
            lat: 31.823091
        }, {
            lng: 120.001715,
            lat: 31.823132
        }, {
            lng: 120.001844,
            lat: 31.823183
        }, {
            lng: 120.002053,
            lat: 31.823287
        }, {
            lng: 120.002203,
            lat: 31.823401
        }, {
            lng: 120.002337,
            lat: 31.823534
        }]
    }
];

var feature_walk1 = [{
    flag: 1,
    type: "Marker",
    name: "取货点A",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.967957,
        lat: 31.81748
    }
}];
var feature_walk2 = [{
    flag: 2,
    type: "Marker",
    name: "取货点B",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.968928,
        lat: 31.817503
    }
}];

var feature_walk3 = [{
    flag: 3,
    type: "Marker",
    name: "取货点C",
    desc: "",
    color: "red",
    icon: "cir",
    offset: {
        x: -9,
        y: -31
    },
    lnglat: {
        lng: 119.968536,
        lat: 31.816988
    }
}];


var flag = 1;

function loadFeatures(features) {
    for (var feature, data, i = 0, len = features.length, j, jl, path; i < len; i++) {
        data = features[i];
        flag = data.flag;
        switch (data.type) {
            case "Marker":
                feature = new AMap.Marker({
                    map: map,
                    position: new AMap.LngLat(data.lnglat.lng, data.lnglat.lat),
                    zIndex: 3,
                    extData: data,
                    offset: new AMap.Pixel(data.offset.x, data.offset.y),
                    title: data.name,
                    content: '<div class="icon icon-' + data.icon + ' icon-' + data.icon + '-' + data.color + '"></div>'
                });
                break;
            case "Polygon":
                for (j = 0, jl = data.lnglat.length, path = []; j < jl; j++) {
                    path.push(new AMap.LngLat(data.lnglat[j].lng, data.lnglat[j].lat));
                }
                feature = new AMap.Polygon({
                    map: map,
                    path: path,
                    extData: data,
                    zIndex: 1,
                    strokeWeight: data.strokeWeight,
                    strokeColor: data.strokeColor,
                    strokeOpacity: data.strokeOpacity,
                    fillColor: data.fillColor,
                    fillOpacity: data.fillOpacity
                });
                //判断是否在园内
                if (flag == 0) {
                    if (localStorage.lat_mine != null && localStorage.lat_mine != '') {
                        localStorage.isInFeature = feature.contains(new AMap.LngLat(localStorage.lng_mine, localStorage.lat_mine));
                        // alert(localStorage.isInFeature);
                    }
                }
                break;
            default:
                feature = null;
        }
        if (feature) {
            AMap.event.addListener(feature, "click", mapFeatureClick);
        }
    }
}

function mapFeatureClick(e) {
  

}