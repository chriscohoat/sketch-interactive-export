
function saveJSON(obj, filePath) {
	obj = JSON.parse(JSON.stringify(obj));
	var data = NSJSONSerialization.dataWithJSONObject_options_error(obj, NSJSONWritingPrettyPrinted, nil),
		dataAsString = NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding);
	return dataAsString.writeToFile_atomically_encoding_error(filePath, true, NSUTF8StringEncoding, nil);
}

function nameToId(str) {
	log('Converting ' + str + ' to ' + str.replace(/\s/g, '_'));
	return str.replace(/\s/g, '-');
}

function getClassFromName(name) {
	return name.split('.').slice(1).join(' ');
}

function onExportSlices(context) {
	const exp = context.actionContext.exports;
	const document = context.actionContext.document;

	const layerNames = [];
	const idCache = {};
	const handleLayer = (layer) => {
		if (idCache[layer.name()]) {
			return;
		}
		idCache[layer.name()] = true;
		layerNames.push(layer.name());
		layer.children().forEach((c) => {
			handleLayer(c)
		});
	}
	document.pages().forEach((page) => {
		page.containedLayers().forEach((layer) => handleLayer(layer));
	});

	for (var i=0; i < exp.count(); i++) {
		var currentExport = exp.objectAtIndex(i)
		if (currentExport.request.format() == 'svg') {

			var path = currentExport.path;
			var svgString = "" + NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, nil);

			layerNames.forEach((layerName) => {
				var idString = nameToId(layerName);
				if (svgString.indexOf('id="' + idString + '"') > -1) {
					let className = getClassFromName(layerName);
					let newId = idString.replace(getClassFromName(layerName).split(' ').join('.'), '').replace('.', '');
					let replace = '';
					if (className) replace += 'class="' + className + '"';
					if (newId) replace += ' id="' + newId + '"';
					svgString = svgString.replace(new RegExp('id="' + idString + '"', 'g'), replace);
				}
			})

			svgString = svgString.replace(/svg width\=\"\d+px" height\=\"\d+px"/, 'svg ');
			NSString.stringWithString(svgString).writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, nil);
		}
	}

}

function run(context) {
}


export { run, run as onRun, onExportSlices, onExportSlices as exportSlices };
export default function(context) {
}