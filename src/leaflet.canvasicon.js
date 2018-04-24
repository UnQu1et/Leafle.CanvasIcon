'use strict';

(function (factory, window){
  // define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);

  // define a Common JS module that relies on 'leaflet'
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  }

  // attach your plugin to the global 'L' variable
  if (typeof window !== 'undefined' && window.L) {
    window.L.CanvasIcon = factory(L);
  }
}(function (L){
  L.Canvas.prototype._updateIcon = function (layer, drawing) {
    var self = this;
    if (!self._drawing && !drawing) { return; }

    if (!layer.canvas_img){
      layer.canvas_img = new Image();
      layer.canvas_img.src = layer.options.iconUrl;
      layer.canvas_img.onload = function() {
        self._updateIcon(layer, true);
      }
      return;
    }

    var ctx = this._ctx;
    var point = layer._point;
    var height = layer.options.height,
        width = layer.options.width,
        angle = layer.options.angle,
        iconUrl = layer.options.iconUrl;

    this._drawnLayers[layer._leaflet_id] = layer;

    if (angle) {
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(angle);
      ctx.drawImage(
        layer.canvas_img,
        -width / 2,
        -height / 2,
        width,
        height);
      ctx.restore();
    } else {
      ctx.drawImage(
        layer.canvas_img,
        point.x - width / 2,
        point.y - height / 2,
        width,
        height
      );
    }
  };

  var CanvasIcon = L.Path.extend({
    options: {
      iconUrl: 'https://freeiconshop.com/wp-content/uploads/edd/location-arrow-solid.png',
      width: 20,
      height: 20,
      angle: 0
    },

    initialize: function (latlng, options) {
      L.Util.setOptions(this, options);
      this._latlng = L.latLng(latlng);
    },

    // @method setLatLng(latLng: LatLng): this
    // Sets the position of a circle marker to a new location.
    setLatLng: function (latlng) {
      this._latlng = L.LatLng.toLatLng(latlng);
      this.redraw();
      return this.fire('move', {latlng: this._latlng});
    },

    // @method getLatLng(): LatLng
    // Returns the current geographical position of the circle marker
    getLatLng: function () {
      return this._latlng;
    },

    _updatePath: function () {
      this._renderer._updateIcon(this);
    },

    _project: function () {
      this._point = this._map.latLngToLayerPoint(this._latlng);
      this._updateBounds();
    },

    _update: function () {
      if (this._map) {
        this._updatePath();
      }
    },

    _updateBounds: function () {
      var width = this.options.width,
          height = this.options.height,
          // w = this._clickTolerance(),
          p = [width, height];
      this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
    },

    _containsPoint: function (p) {
      var width = this.options.width,
          height = this.options.height;
      return p.distanceTo(this._point) <= Math.max(width, height) + this._clickTolerance();
    },

    _clickTolerance: function () {
      // used when doing hit detection for Canvas layers
      return 0;
    },

    _updateOptions: function () {

    }
  });

  L.canvasIcon = function (latlng, options) {
    return new CanvasIcon(latlng, options);
  };
}, window));
