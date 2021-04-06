const { changeCells } = require("../brainf/index.js");
const { parsingError } = require("../parser/common.js");
const {types, dataType} = require("../parser/datatypes");

function compile(AST, optimized = false) {
	const variables = {},
		  tape = new Uint8Array(65536);

	let currentCell = 0;
	let brainF = "";

	function moveTo(cell) {
		if (currentCell < cell) {
			const diff = cell - currentCell;
			currentCell += diff;
			return ">".repeat(diff);
		} else {
			const diff = currentCell - cell;
			currentCell -= diff;
			return "<".repeat(diff);
		}
	}

	function getTakenCells() {
		const taken = [];
		for (const variableName in variables) {
			const {memoryLocation, size} = variables[variableName];
			taken.push([memoryLocation, memoryLocation + size]);
		}

		return taken;
	}

	function isCellFree(cellPos, givenTaken) {
		for (const [startPos, posAfterEnd] of givenTaken) {
			if (cellPos >= startPos && cellPos < posAfterEnd) {
				return false;
			}
		}

		return true;
	}

	function allocate(size) {
		const takenCells = getTakenCells();

		function check(start) {
			for (let current = start; current < start + size; current++) {
				if (!isCellFree(current, takenCells)) {
					return [false, current];
				}
			}

			return [true, null];
		}

		let positive = null,
			negative = null;

		// Check forwards
		for (let start = currentCell; start < tape.length; start++) {
			const [isAllFree, newPosition] = check(start);

			if (isAllFree) {
				positive = start;
				break;
			} else start = newPosition;
		}

		// Check backwards
		for (let start = currentCell; start >= size; start--) {
			const [isAllFree, newPosition] = check(start - size);

			if (isAllFree) {
				negative = start;
				break;
			} else start = newPosition - size;
		}

		const positiveDist = Math.abs(currentCell - positive),
			  negativeDist = Math.abs(currentCell - negative);

		if (positive === null && negative === null) {
			throw new Error(`Sorry, could not allocate ${size} cells!`);
		} else if (positive === null) {
			return negative;
		} else if (negative === null) {
			return positive;
		} else if (positiveDist >= negativeDist) {
			return positive;
		} else {
			return negative;
		}
	}

	function commentEndl(comment) {
		return optimized ? "" : " # " + comment + "\n";
	}

	// TODO: Fragment into multiple files
	for (const {type: NodeType, value: info} of AST) {
		if (NodeType === "DECLARATION") {
			const startingPosition = currentCell;
			const DataType = types[info.valueDataType];

			const theVariable = {
				value: info.value.value,
				DataType,
				size: DataType.size || info.value.size
			};

			// Allocate space for the variable
			const newLocation = allocate(theVariable.size);

			// Move to the new variable's future location
			brainF += moveTo(newLocation);
			brainF += commentEndl(`Move to allocated space for '${info.name}'`);

			theVariable.memoryLocation = newLocation;
			variables[info.name] = theVariable;

			// Get the current cells at the variable's location
			const existingCells = [];
			for (let i = newLocation; i < newLocation + theVariable.size; i++)
				existingCells.push(tape[i]);

			// Generate the code to change the existing cells to the new cells
			const newCells = DataType.toCells(theVariable.value),
			      getToCells = changeCells(existingCells, newCells);

			// Assign the allocated cells to the variable's value
			brainF += getToCells;
			for (let i = newLocation; i < newLocation + theVariable.size; i++) tape[i] = newCells[i];
			brainF += commentEndl(`Set '${info.name}' to '${info.value.value}'`);

			// Move away from the variable
			brainF += ">";
			brainF += commentEndl(`Move away from '${info.name}'`);
			currentCell += theVariable.size;

			brainF += moveTo(startingPosition);
			brainF += commentEndl(`Move back to starting position`);
		} else if (NodeType === "ASSIGNMENT") {
			const startingPosition = currentCell,
				  DataType = types[info.valueDataType];
			
			const theVariable = variables[info.name],
				  newVariable = {
					  value: info.value.value,
					  size: DataType.size || info.value.size
				  };

			// Check if we can't fit the new value
			if (newVariable.size > theVariable.size) {
				throw new Error(`New value for '${info.name}' is too large for allocated space!`);
			}

			// Internally assign the new value
			theVariable.value = newVariable.value;
			theVariable.size = newVariable.size;

			const pos = theVariable.memoryLocation;

			// Move to the variable
			brainF += moveTo(pos);
			brainF += commentEndl(`Move to '${info.name}'`);
			
			// Get the current cells at the variable's location
			const existingCells = [];
			for (let i = pos; i < pos + theVariable.size; i++) {
				existingCells.push(tape[i]);
			}

			// Generate the code to change the existing cells to the new cells
			const newCells = DataType.toCells(theVariable.value),
			      getToCells = changeCells(existingCells, newCells);

			// Assign cells to the new value
			brainF += getToCells;
			for (let i = pos; i < pos + theVariable.size; i++) {
				tape[i] = newCells[i];
			}

			brainF += commentEndl(`Set '${info.name}' to '${info.value.value}'`);

			// Move away from the variable
			brainF += ">";
			brainF += commentEndl(`Move away from '${info.name}'`);
			currentCell += theVariable.size;

			brainF += moveTo(startingPosition);
			brainF += commentEndl(`Move back to starting position`);
		} else if (NodeType === "INVOCATION") {
			const startingPosition = currentCell;
			// TODO: Multiple arguments
			const varName = info.args[0].value;
			if (!(varName in variables)) parsingError(`Unknown variable '${varName}'`);

			// Move to the variable
			brainF += moveTo(variables[varName].memoryLocation);
			brainF += commentEndl(`Move to '${varName}'`);

			if (info.keyword === "OUT") {
				const printAll = Array.from({length: variables[varName].size}, () => ".");
				brainF += printAll.join(">");
				brainF += commentEndl(`Output '${varName}'`);

				// Move away from the variable
				brainF += ">";
				brainF += commentEndl(`Move away from '${varName}'`);
				currentCell += variables[varName].size;
			}

			brainF += moveTo(startingPosition);
			brainF += commentEndl(`Move back to starting position`);
		}
	}

	return brainF;
}

module.exports = compile;