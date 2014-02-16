
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

  // see http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
  var material = new THREE.MeshBasicMaterial({wireframe: true});
  var geometry = new THREE.PlaneGeometry();
  var planeMesh = new THERE.Mesh(geometry, material);

  this.game.scene.add(planeMesh);

  var element = document.createElement('iframe');
  element.src = 'https://news.ycombinator.com/';

  var cssObject = new THREE.CSS3DObject(element);
  cssObject.position = planeMesh.position;
  cssObject.rotation = planeMesh.rotation;
  //cssScene. // TODO?
};

WebviewPlugin.prototype.disable = function() {
};

