'use strict';

var loadCSS3DRenderer = require('./CSS3DRenderer.js');

module.exports = function(game, opts) {
  return new WebviewPlugin(game, opts);
};

function WebviewPlugin(game, opts)
{
  this.game = game;

  this.enable();
}

WebviewPlugin.prototype.enable = function() {
  var THREE = this.game.THREE;

  loadCSS3DRenderer(THREE); // adds CSS3DObject, CSS3DSprite, CSS3DRenderer to THREE

  // see http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
  // and https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/CSS3D.html
  var planeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide});
  var planeWidth = 360;
  var planeHeight = 120;
  var planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.position.y += planeHeight / 2;

  // add to the WebGL scene
  this.game.scene.add(planeMesh);

  // create a new scene to hold CSS
  var sceneCSS = new THREE.Scene();

  var element = document.createElement('iframe');
  element.src = 'http://learningthreejs.com/';
  var elementWidth = 1024;
  var aspectRatio = planeHeight / planeWidth;
  var elementHeight = elementWidth * aspectRatio;
  element.style.width = elementWidth + 'px';
  element.style.height = elementHeight + 'px';

  var cssObject = new THREE.CSS3DObject(element);
  cssObject.position = planeMesh.position;
  cssObject.rotation = planeMesh.rotation;
  var percentBorder = 0.05;
  cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
  cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
  cssScene.add(cssObject);

  var rendererCSS = new THREE.CSS3DRenderer();
  rendererCSS.setSize(window.innerWidth, window.innerHeight);
  rendererCSS.domElement.style.position = 'absolute';
  rendererCSS.domElement.style.top = '0';
  rendererCSS.domElement.style.margin = '0';
  rendererCSS.domElement.style.padding = '0';
  document.body.appendChild(rendererCSS.domElement);
  //THREEx.WindowResize(rendererCSS, camera);

  // make sure the WebGL renderer appears on top of the CSS renderer
  this.game.view.renderer.domElement.style.zIndex = 1;
  rendererCSS.domElement.appendChild(this.game.view.renderer.domElement);

  console.log('rendererCSS',rendererCSS);
};

WebviewPlugin.prototype.disable = function() {
};

