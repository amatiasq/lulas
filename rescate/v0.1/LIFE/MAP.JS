var Map = (function() {
	function printElements(array) {
		return "{ " +
			array.join(", ")
				.replace(/\[object \w*\] { id: /g, "")
				.replace(/ }/g, "") +
			" }";
	};

	function Range() {
		this.items = [];
	};
	Range.prototype.length = function() {
		return this.items.length;
	};
	Range.prototype.forEach = function(action) {
		for (var i=this.items.length; i--; )
			action(this.items[i], i);
	};
	Range.prototype.get = function(index) {
		return this.items[index];
	};
	Range.prototype.push = function(el) {
		this.items.push(el);
	};
	Range.prototype.remove = function(index) {
		if (typeof index !== 'number')
			index = this.items.indexOf(index);
		this.items.splice(index, 1);
		return this;
	};
	Range.prototype.merge = function(array) {
		for (var i=array.length; i--; )
			this.push(array[i]);
	};
	Range.prototype.toString = function() {
		return "[object Range] " + printElements(this.items);
	};
	
	function Cell(x, y) {
		this.location = new Phisics.Vector(x, y);
		this.byId = [];
		this.elements = [];
		this.smells = [];
		this.water = 0.5;
		this.nutrients = 1.0
		this.x = x;
		this.y = y;
	}
	Cell.property('elements', true);
	Cell.prototype.getX = function() {
		return this.location.x;
	};
	Cell.prototype.get = function(index) {
		return this.elements[index];
	};
	Cell.prototype.getWater = function() {
		var extract = this.water * 0.10;
		this.water -= extract;
		return extract;
	};
	Cell.prototype.getNutrients = function() {
		var extract = this.nutrients * 0.10;
		this.nutrients -= extract;
		return extract;
	};
	Cell.prototype.push = function(el) {
		if (!this.byId[el.getId()]) {
			this.elements.push(el);
			this.byId[el.getId()] = true;
		}
		return this;
	};
	Cell.prototype.remove = function(el) {
		if (this.byId[el.getId()]) {
			this.elements.splice(this.elements.indexOf(el), 1);
			this.byId[el.getId()] = false;
		}
		return this;
	};
	Cell.prototype.toString = function() {
		return "[object Cell] x: " + this.x + " y: " + this.y + " " + printElements(this.elements);
	};


	function Map(cols, rows) {
		this.cellSize = 10;
		this.colums = cols || 100;
		this.rows = rows || 100;

		this.items = [];
		this.map = [];
	}
	Map.property('cellSize');
	Map.property('columns');
	Map.property('rows');
	Map.prototype.calcCellNumber = function(value) {
		return Math.floor(value / this.cellSize);
	};
	Map.prototype.clear = function() {
		this.map = [];
		this.items = [];
		for (var range, i=this.columns; i--; ) {
			range = [];
			for (var j=this.rows; j--; )
				range.push(new Cell(this.columns- i, this.rows - j));
			this.map.push(range);
		}
		return this;
	};
	Map.prototype.getSize = function() {
		return new Phisics.Vector(
			this.columns * this.cellSize,
			this.rows * this.cellSize
		);
	};
 	Map.prototype.getCell = function(col, row) {
		return this.map[col][row];
	};
	Map.prototype.getCellAt = function(x, y) {
		return this.map[this.calcCellNumber(x)][this.calcCellNumber(y)];
	};
	Map.prototype.addElement = function(el) {
		var col = this.calcCellNumber(el.getX()),
			row = this.calcCellNumber(el.getY());
		this.map[col][row].push(el);
		this.updateLocation(el);
		return this;
	};
	Map.prototype.removeElement = function(el) {
		var lastLocation = this.items[el.getId()];
		if (lastLocation)
			this.map[lastLocation.x][lastLocation.y].remove(el);
		return this;
	};
	Map.prototype.updateLocation = function(el) {
		var lastLocation = this.items[el.getId()];
		var currentLocation = { x: this.calcCellNumber(el.getX()), y: this.calcCellNumber(el.getY()) };
		this.items[el.getId()] = currentLocation;
		if ((!lastLocation) || (
				lastLocation.x === currentLocation.x &&
				lastLocation.y === currentLocation.y
			))
			return;
		this.map[lastLocation.x][lastLocation.y].remove(el);
		this.map[currentLocation.x][currentLocation.y].push(el);
	};
	function insideRange(x, y) {
		return new Phisics.Vector(
			Math.max(Math.min(this.calcCellNumber(x), this.columns - 1), 0),
			Math.max(Math.min(this.calcCellNumber(y), this.rows - 1), 0)
		);
	}
	function negatives(x, y) {
		return new Phisics.Vector(
			x < 0 ? this.columns + this.calcCellNumber(x) : this.columns,
			y < 0 ? this.rows + this.calcCellNumber(y) : this.rows
		);
	}
	Map.prototype.getCellsAtZone = function(startX, startY, endX, endY) {
		var result = [];
		var start = insideRange.call(this, startX, startY);
		var end = insideRange.call(this, endX, endY);
		for (var i=start.x; i<=end.x; i++)
			for (var j=start.y; j<=end.y; j++)
				result.push(this.map[i][j]);
		start = negatives.call(this, startX, startY);
		end = negatives.call(this, endX, endY);
		alert(start + end);
		for (var i=start.x; i<end.x; i++)
			for (var j=start.y; j<end.y; j++)
				result.push(this.map[i][j]);
		return result;
	};
	Map.prototype.getRangeFromVectors = function(startX, startY, endX, endY) {
		var cells = this.getCellsAtZone(startX, startY, endX, endY),
			result = new Range();
		for (var i=cells.length; i--; )
			// ERROR: check error, sometimes cells[i] (120) is null when length is 121
			if (cells[i])
				result.merge(cells[i].getElements());
		return result;
	};
	Map.prototype.getElementCells = function(element) {
		return this.getCellsAtZone(
			element.getX(),
			element.getY(),
			element.getEndX(),
			element.getEndY()
		);
	};
	Map.prototype.getRangeFromElement = function(element, radio) {
		var range = this.getRangeFromVectors(
			element.getX() - radio,
			element.getY() - radio,
			element.getEndX() + radio,
			element.getEndY() + radio
		);
		for (var i=range.length(); i--; ) {
			if (element.distance(range.get(i)) > radio || range.get(i) === element)
				range.remove(i);
		}
		return range;
	};
	Map.prototype.getRange = function(arg) {
		if (typeof arg === 'number')
			return this.getRangeFromVectors.apply(this, arguments);
		else
			return this.getRangeFromElement.apply(this, arguments);
	};
	Map.prototype.print = function(parent) {
		var cell,
			container = Dom.create('div'),
			width = this.columns * this.cellSize - 1,
			height = this.rows * this.cellSize - 1;
		container.className = "Map";
		container.style.width = width;
		for (var i=Math.ceil(this.columns / 2); i--; ) {
			cell = Dom.create('div');
			cell.className = "MapCell MapCol";
			cell.style.width = this.cellSize - 1;
			cell.style.height = height;
			cell.style.left = i * 2 * this.cellSize;
			container.appendChild(cell);
		}
		for (var i=Math.ceil(this.rows / 2); i--; ) {
			cell = Dom.create('div');
			cell.className = "MapCell MapRow";
			cell.style.width = width;
			cell.style.height = this.cellSize - 1;
			cell.style.top = i * 2 * this.cellSize;
			container.appendChild(cell);
		}
		parent.appendChild(container);
	};
	Map.prototype.toString = function() {
		return "[object Map]";
	};

	Map.Range = Range;
	return Map;
})();
