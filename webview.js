'use strict';

var createCSS3D = require('gl-css3d');

module.exports = function(game, opts) {
  return new WebviewPlugin(game, opts);
};

module.exports.pluginInfo = {
  loadAfter: ['voxel-commands', 'voxel-shader']
};

function WebviewPlugin(game, opts)
{
  this.game = game;

  this.shader = game.plugins.get('voxel-shader');
  if (!this.shader) throw new Error('voxel-webview requires voxel-shader plugin');

  this.url = opts.url || 'http://browserify.org/';
  //this.url = opts.url || 'http://npmjs.org/'; // added X-Frame-Options: deny after security audit
  //this.url = opts.url || 'http://learningthreejs.com/'; // hits illegal return in embedded video player??
  //this.url = opts.url || 'https://news.ycombinator.com/'; // refuses to display since X-Frame-Options: DENY
  //this.url = opts.url || 'http://voxeljs.com/'; // also has embedded youtube video player
  //this.url = opts.url || 'http:/aol.com/'; // fails setting aol_devil_flag Uncaught SecurityError: Blocked a frame with origin "http://www.aol.com
  //this.url = opts.url || 'http://github.com/'; // also has X-Frame-Options: deny

  opts.planeWidth = opts.planeWidth || 10;
  opts.planeHeight = opts.planeHeight || 10;
  //this.elementWidth = opts.elementWidth || 1024; // TODO

  var iframe = document.createElement('iframe');
  iframe.src = this.url;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.id = 'voxel-webview';

  //opts.tint = opts.tint || [1,0,0,0];
  opts.flipX = false; // for some reason
  this.css3d = createCSS3D(iframe, opts);

  this.enable();
}

WebviewPlugin.prototype.enable = function() {

  if (this.game.shell.gl) {
    // gl is already initialized - we won't receive gl-init, or the first gl-resize
    // call it here (on-demand plugin loading) TODO: cleaner generic fix for plugins receiving init events too late
    this.ginit();
    this.updatePerspective();
  } else {
    this.game.shell.on('gl-init', this.onInit = this.ginit.bind(this));
  }

  this.shader.on('updateProjectionMatrix', this.onUpdatePerspective = this.updatePerspective.bind(this));
  this.game.shell.on('gl-render', this.onRender = this.render.bind(this));


  var self = this;

  window.addEventListener('click', this.onClick = function(ev) {
    // click anywhere outside of iframe to exit TODO: what if it fills the entire screen? (alternate escape hatch)
    // (we won't receive click events for the iframe here)
    // TODO: register on WebGL canvas element instead?
    //  tried this.game.view.renderer.domElement but didn't receive events
    
    if (document.getElementById('voxel-webview').parentElement.parentElement.style.zIndex === '0') {
      document.getElementById('voxel-webview').parentElement.parentElement.style.zIndex = '-1';
      self.game.interact.request();
    }
  });

  // commands for interacting TODO: replace with something in-game (survival), https://github.com/deathcap/voxel-webview/issues/3
  var commands = this.game.plugins.get('voxel-commands');
  if (commands) {
    commands.registerCommand('url',
        this.onURL = function(address) {
          if (!address || address.length === 0) {
            address = window.location.origin; // load self
          }

          if (address.indexOf('://') === -1) {
            address = 'http://' + address; // so example.com doesn't load relative path
          }

          document.getElementById('voxel-webview').src = address; // TODO: set url through .url setter?
        },
        'address',
        'loads URL into webview');

    commands.registerCommand('web',
        this.onWeb = function() {
          var z = document.getElementById('voxel-webview').parentElement.parentElement.style.zIndex;
          document.getElementById('voxel-webview').parentElement.parentElement.style.zIndex = {'-1':0, 0:-1}[z];
        },
        '',
        'interact with a webview');
  }
};

WebviewPlugin.prototype.disable = function() {
  window.removeEventListener('click', this.onClick);

  var commands = this.game.plugins.get('voxel-commands');
  if (commands) {
    commands.unregisterCommand('url', this.onURL);
    commands.unregisterCommand('web', this.onWeb);
  }

  this.game.shell.removeListener('gl-render', this.onRender);
  if (this.onInit) this.game.shell.removeListener('gl-init', this.onInit);
  this.shader.removeListener('updateProjectionMatrix', this.onUpdatePerspective);
};

WebviewPlugin.prototype.ginit = function(gl) {
  this.css3d.ginit(this.game.shell.gl);
};

WebviewPlugin.prototype.updatePerspective = function() {
  var cameraFOVradians = this.shader.cameraFOV * Math.PI/180;

  this.css3d.updatePerspective(cameraFOVradians, this.game.shell.width, this.game.shell.height);
};

WebviewPlugin.prototype.render = function() {
  this.css3d.render(this.shader.viewMatrix, this.shader.projectionMatrix);
};
