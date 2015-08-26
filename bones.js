var startWebGL = (function() {
	var gl;
	var res = {};

	function loadResources(res, listSrc, callback) {
		var list = [];

		jx.load(listSrc, function(data) {
			list = data;
			loadItems();
		}, 'json');

		function loadItems() {
			numItems = list.length;
			var itemsLeft = numItems;

			//Don't inline this, everything will break.
			//item will get updated before the callback occurs
			function get(item) {
				jx.load(item.src, function(data) {
					res[item.name] = data;
					itemsLeft--;
					if (itemsLeft === 0) callback();
				}, item.type);
			}

			for (var i=0; i<numItems; i++) {
				get(list[i]);
			}
		}
	}

	function tick() {
		requestAnimFrame(tick);

		//Clear the display
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	return function(canvasId) {
		var canvas = document.getElementById(canvasId);

		//Init WegGL
		gl = WebGLUtils.setupWebGL(canvas);

		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

		loadResources(res, 'res.json', function() {
			//Init Shaders

			//Init and compile vertex shader
			var vShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vShader, res.vertSrc);
			gl.compileShader(vShader);
			if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(vShader));
			}

			//Init and compile fragment shader
			var fShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fShader, res.fragSrc);
			gl.compileShader(fShader);
			if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(fShader));
			}

			//Init and link the shader program
			var shaderProg = gl.createProgram();
			gl.attachShader(shaderProg, vShader);
			gl.attachShader(shaderProg, fShader);
			gl.linkProgram(shaderProg);
			if (!gl.getProgramParameter(shaderProg, gl.LINK_STATUS)) {
				console.error('Could not inialise shaders');
			}

			gl.useProgram(shaderProg);

			//Set up the display
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);

			//Kick off the draw loop
			tick();
		});
	};
}());
