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
	, y: (imgHeight - 100) * scale
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
		shape.fill(legendColor[shape["type"]][shape["subtype"]].normal);
		
	}
	shapeLayer.draw();
}

var legendTexts;
$.getJSON('legendText.json').done(function(data) {
	legendTexts = data;
});

var legendColor;
$.getJSON('legendColor.json').done(function(data) {
	legendColor = data;
});

var blocks;
$.getJSON('blocks.json').done(function(data) {
	blocks = data;
});

var imageObj = new Image();
imageObj.onload = function() {
	for(var pubKey in blocks) {(function() {
			var key = pubKey;
			var block = blocks[key];
			
			var blockOverlay = new Kinetic.Rect({
				x: block.x * scale
				, y : block.y * scale
				, width : block.width * scale
				, height : block.height * scale
				, rotation : block.rotate
				, fill : legendColor[block.type][block.subtype].normal
			});
			
			blockOverlay["type"] = block.type;
			blockOverlay["subtype"] = block.subtype;
			
			blockOverlay.on('mouseover', function() {
				writeMessage(block.name, 'test');
				this.fill(legendColor[block.type][block.subtype].highlight);
				shapeLayer.draw();
			});
			blockOverlay.on('mouseout', function() {
				writeMessage('', '');
				resetShapesLayer();
			});
			
			shapeLayer.add(blockOverlay);				
		}());
	}
	
	var legendIdx = 0;
	for(var pubKey in legendTexts) {(function() {
			var key = pubKey;
			var legendText = legendTexts[key];
	
			var legendLabel = new Kinetic.Label({
				x : 0
				, y : 0 + (legendIdx * 25)
			});
			legendLabel.add(new Kinetic.Text({
				text: legendText.text
				, fontFamily: 'Calibri'
				, fontSize: 12
				, fill: 'black'
			}));
			legendLabel.on('mouseover', function() {
				var shapes = shapeLayer.getChildren();
				
				for(var i = 0; i < shapes.length; i++) {
					var shape = shapes[i];
					if(shape["type"] == legendText.match.key && shape["subtype"] == legendText.match.value) {
						shape.fill(legendColor[shape["type"]][shape["subtype"]].highlight);
						shapeLayer.draw();
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
imageObj.src = 'mapbackground.png';
