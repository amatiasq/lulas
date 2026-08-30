describe("Map class", function() {
	var map;
	beforeEach(function() {
		map = new Map();
	});

	describe("Reset method", function() {
		it("should create a two-dimensions array depending columns and rows properties", function() {
			map.setColumns(5);
			map.setRows(7);
			map.clear();
			expect(map.map.length).toBe(5);
			for (var i=5; i--; )
				expect(map.map[i].length).toBe(7);
		});
	});
	describe("AddElement method", function() {
		beforeEach(function() {
			map.setColumns(5);
			map.setRows(5);
			map.clear();
		});

		it("should be able to recive any instance of subclass of Phisics and locate it depending its location", function() {
			var phi = new Phisics();
			phi.setX(5);
			phi.setY(15);
			map.addElement(phi);

			phi.setX(40);
			phi.setY(30);
			map.addElement(phi);
			expect(map.getCell(4, 3).get(0)).toBe(phi);
		});
	});

	function fillMap(map) {
		var elements = [
			new Phisics(0, 0),	// 26
			new Phisics(2, 2),	// 27
			new Phisics(4, 4),	// 28
			new Phisics(6, 6),	// 29
			new Phisics(8, 8)	// 30
		];
		for (var i=elements.length; i--; )
			map.addElement(elements[i]);
		return elements;
	}
	function configureMap() {
		map.setCellSize(2);
		map.setColumns(5);
		map.setRows(5);
		map.clear();
	}
	describe("getCellsAtZone method", function() {
		beforeEach(configureMap);
		function test(x1, y1, x2, y2, result) {
			var cells = map.getCellsAtZone(x1, y1, x2, y2);
			expect(cells.length).toBe(result.length);
			for (var i=cells.length; i--; )
				expect(cells[i]).toBe(result[i]);
		}
		it("should return the cells than matches given zone", function() {
			test(0, 0, 0, 0, [
				map.getCell(0,0)
			]);
			test(0, 0, 2, 2, [
				map.getCell(0,0),
				map.getCell(0,1),
				map.getCell(1,0),
				map.getCell(1,1)
			]);
		});
		it("should return cells from end when some zone values are negative", function() {
			test(-2, -2, -1, -1, [
				map.getCell(4,4),
			]);
		});
	});
	xdescribe("GetRange method", function() {
		beforeEach(configureMap);
		it("should return empty array if there are no elements", function() {
			var range = map.getRange(1, 1, 3, 3);
			expect(range).toBeInstanceOf(Map.Range);
			expect(range.length()).toBe(0);
		});
		it("should return all elements inside given vectors", function() {
			var elements = fillMap(map);
			var range = map.getRange(2, 2, 5, 5);
			expect(range.length()).toBe(2);
			expect(range.get(0)).toBe(elements[2]);
			expect(range.get(1)).toBe(elements[1]);
			expect(range.get(2)).toBe(elements[2]);

			range = map.getRange(0, 0, 0, 0);
			expect(range.length()).toBe(1);
			expect(range.get(0)).toBe(elements[0]);
		});
		it("should return all elements inside radio area", function() {
			var elements = fillMap(map);
			range = map.getRange(elements[1], 3);
			expect(range.length()).toBe(2);
			expect(range.get(0)).toBe(elements[2]);
			expect(range.get(1)).toBe(elements[0]);
		});
	});
});