var imgWidth = 1507;
var imgHeight = 943;

var mapStage = new Kinetic.Stage({
	container: 'container'
	, width: 600
	, height: 400
});

var legendStage = new Kinetic.Stage({
	container: 'legend'
	, width: 600
	, height: 150
});

var scale = mapStage.width() / imgWidth;

var mapLayer = new Kinetic.Layer();
var shapeLayer = new Kinetic.Layer();
var messageLayer = new Kinetic.Layer();
var legendLayer = new Kinetic.Layer();

var txtheader = new Kinetic.Text({
	x: 20 * scale
	, y: (imgHeight - 200) * scale
	, fontFamily: 'calibri'
	, fontSize: 24
	, text: ''
	, fill: 'black'
});
var txtmessage = new Kinetic.Text({
	x: 20 * scale
	, y: (imgHeight - 130) * scale
	, fontFamily: 'calibri'
	, fontSize: 18
	, text: ''
	, fill: 'black'
});

function writeMessage(header, message) {
	txtheader.setText(header);
	txtmessage.setText(message);
	messageLayer.draw();
}
function resetShapesLayer() {
	var shapes = shapeLayer.getChildren();
					
	for(var i = 0; i < shapes.length; i++) {
		var shape = shapes[i];
		shape.fill('#' + legendColor[shape["type"]][shape["subtype"]].normal);
		shape.anim.stop();
		shape.scale({x: 1, y: 1});
	}
	shapeLayer.draw();
}
function highlightShape(shape) {
	shape.fill('#' + legendColor[shape.type][shape.subtype].highlight);
	shape.anim.start();
	shapeLayer.draw();
}
var legendTexts;
$.getJSON($.relurl + 'data/legendText.json').done(function(data) {
	legendTexts = data;
});

var legendColor;
$.getJSON($.relurl + 'data/legendColor.json').done(function(data) {
	legendColor = data;
});

var blocks;
$.getJSON($.relurl + 'data/blocks.json').done(function(data) {
	blocks = data;
});

var imageObj = new Image();
imageObj.onload = function() {
	for(var i = 0; i < blocks.length; i++) {(function() {
			var block = blocks[i];
			
			var blockOverlay = new Kinetic.Rect({
				x: (block.x + block.width / 2) * scale
				, y : (block.y + block.height / 2) * scale
				, width : block.width * scale
				, height : block.height * scale
				, rotation : block.rotate
				, offset: {x: (block.width / 2) * scale, y: (block.height / 2) * scale}
				, fill : legendColor[block.type][block.subtype].normal
			});
			
			blockOverlay["type"] = block.type;
			blockOverlay["subtype"] = block.subtype;
			blockOverlay["name"] = block.name;
			
			blockOverlay["anim"] = new Kinetic.Animation(function(frame) {
				var scale = Math.sin(Date.now() * 2 * Math.PI / 1500) + 0.1;
				blockOverlay.scale({x: (scale < 1 ? 1 : scale), y: (scale < 1 ? 1 : scale)});
			}, shapeLayer);
			
			blockOverlay.on('mouseover', function() {
				var desc = '';
				if(block.address.length > 0) {
					desc += 'Spobjergvej ' + block.address + '\n';
				}
				desc += block.description;
				writeMessage(block.name, desc);
				highlightShape(this);
			});
			blockOverlay.on('mouseout', function() {
				writeMessage('', '');
				resetShapesLayer();
			});
			
			shapeLayer.add(blockOverlay);				
		}());
	}
	
	var legendIdx = 0;
	for(var l = 0; l < legendTexts.length; l++) {(function() {
			var legendText = legendTexts[l];
	
			var legendLabel = new Kinetic.Label({
				x : 0 + (Math.floor(legendIdx / 6) * 120)
				, y : 0 + ((legendIdx % 6) * 25)
			});
			legendLabel.add(new Kinetic.Text({
				text: legendText.text
				, fontFamily: 'Calibri'
				, fontSize: 12
				, fill: 'black'
			}));
			legendLabel.on('mouseover', function() {
				var shapes = shapeLayer.getChildren();
				
				for(var i = 0; i < legendText.match.length; i++) {
					var key = legendText.match[i].key;
					var val = legendText.match[i].value;
					
					for(var j = 0; j < shapes.length; j++) {
						var shape = shapes[j];
						if(shape["type"] == key 
							&& (shape["subtype"] == val)
								|| (shape["name"] == val)
							) {
							highlightShape(shape);
						}
					}
				}
				
			});
			legendLabel.on('mouseout', function() {
				resetShapesLayer();
			});
			
			legendLayer.add(legendLabel);
			legendIdx++;
		}());
	}
	
	messageLayer.add(txtheader);
	messageLayer.add(txtmessage);
	mapStage.add(mapLayer);
	mapStage.add(shapeLayer);
	mapStage.add(messageLayer);
	legendStage.add(legendLayer);
	
	var mapContext = mapLayer.getContext();
	mapContext.drawImage(imageObj, 0, 0, imgWidth * scale, imgHeight * scale);
};
imageObj.src = $.relurl + 'mapbackground.png';
