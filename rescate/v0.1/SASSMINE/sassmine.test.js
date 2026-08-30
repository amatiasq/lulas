describe("Testing Sassmine", function() {
	describe("The expectations", function() {
		describe("Method toBe", function() {
			it("must success if the values are same type and value", function() {
				expect(1).toBe(1);
			});
			it("FAIL should fail if the values are different", function() {
				expect(1).toBe(2);
			});
			it("FAIL should fail if the types are different", function() {
				expect(1).toBe("1");
			});
		});
		describe("Method toBeLike", function() {
			
		});
	});
	describe("Spies", function() {
		describe("When called many thimes", function() {
		});
	});
});