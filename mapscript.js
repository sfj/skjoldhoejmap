var imgWidth = 1507;
var imgHeight = 943;

var stage = new Kinetic.Stage({
	container: 'container'
	, width: 600
	, height: 400
});

var scale = stage.width() / imgWidth;

var mapLayer = new Kinetic.Layer();
var shapeLayer = new Kinetic.Layer();
var messageLayer = new Kinetic.Layer();
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

var legend = {
	blocks: {
		"A" : {
			highlight: "red"
			, normal: "orange"
		}
		, "B" : {
			highlight: "red"
			, normal: "gold"
		}
		, "C" : {
			highlight: "red"
			, normal: "blue"
		}
		, "D" : {
			highlight: "red"
			, normal: "green"
		}
	}
};

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
				, fill : legend.blocks[block.type].normal
			});
			
			blockOverlay.on('mouseover', function() {
				writeMessage(key, 'test');
				this.fill(legend.blocks[block.type].highlight);
				shapeLayer.draw();
			});
			blockOverlay.on('mouseout', function() {
				writeMessage('', '');
				this.fill(legend.blocks[block.type].normal);
				shapeLayer.draw();
			});
			
			shapeLayer.add(blockOverlay);				
		}());
	}
	messageLayer.add(txtheader);
	messageLayer.add(txtmessage);
	stage.add(mapLayer);
	stage.add(shapeLayer);
	stage.add(messageLayer);
	
	var mapContext = mapLayer.getContext();
	mapContext.drawImage(imageObj, 0, 0, imgWidth * scale, imgHeight * scale);
};
imageObj.src = 'mapbackground.png';
