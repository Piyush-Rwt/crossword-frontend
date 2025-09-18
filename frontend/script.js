// This is our hard-coded sample puzzle.
// Later, this data will come from your C backend.
const puzzleData = {
    gridSize: 10,
    clues: {
        across: [
            { number: 1, clue: "A domesticated feline", answer: "CAT", row: 0, col: 0 },
            { number: 4, clue: "Not old", answer: "NEW", row: 0, col: 4 },
            { number: 6, clue: "To perform on stage", answer: "ACT", row: 2, col: 1 },
            { number: 7, clue: "Opposite of stop", answer: "GO", row: 2, col: 5 },
            { number: 8, clue: "A large primate", answer: "APE", row: 4, col: 0 },
        ],
        down: [
            { number: 1, clue: "A vehicle", answer: "CAR", row: 0, col: 0 },
            { number: 2, clue: "A sticky substance from trees", answer: "SAP", row: 0, col: 2 },
            { number: 3, clue: "A small bed", answer: "COT", row: 0, col: 4 },
            { number: 5, clue: "What a dog wags", answer: "TAIL", row: 1, col: 6 },
        ]
    },
    // We use a solved grid to know where the black squares are.
    // '.' represents a black square.
    gridSolution: [
        ['C', 'A', 'T', '.', 'N', 'E', 'W', '.', '.', '.'],
        ['A', '.', 'A', '.', 'E', '.', 'A', '.', '.', '.'],
        ['R', 'C', 'T', '.', 'W', 'G', 'O', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', 'I', '.', '.', '.'],
        ['A', 'P', 'E', '.', '.', '.', 'L', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.']
    ]
};

// --- GAME STATE VARIABLES ---
let activeCell = { row: null, col: null };
let currentDirection = 'across'; // 'across' or 'down'

// --- Main script execution starts here ---

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('crossword-grid');
    const acrossCluesList = document.getElementById('across-clues');
    const downCluesList = document.getElementById('down-clues');

    // --- INITIALIZATION ---
    function initializeGame() {
        generateGrid();
        placeClueNumbers();
        displayClues();
        // Add global keyboard listener for arrow keys
        document.addEventListener('keydown', handleArrowNavigation);
    }
    
    // --- GRID GENERATION ---
    function generateGrid() {
        grid.style.setProperty('--grid-size', puzzleData.gridSize);
        for (let r = 0; r < puzzleData.gridSize; r++) {
            for (let c = 0; c < puzzleData.gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (puzzleData.gridSolution[r][c] === '.') {
                    cell.classList.add('black');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.classList.add('cell-input');
                    input.dataset.row = r;
                    input.dataset.col = c;
                    
                    // Add listeners for interaction
                    input.addEventListener('input', handleInput);
                    cell.addEventListener('click', () => handleCellClick(r, c));
                    cell.appendChild(input);
                }
                grid.appendChild(cell);
            }
        }
    }
    
    // --- INTERACTION HANDLERS ---
    function handleCellClick(row, col) {
        if (activeCell.row === row && activeCell.col === col) {
            // Toggle direction if the same cell is clicked again
            currentDirection = (currentDirection === 'across') ? 'down' : 'across';
        } else {
            activeCell = { row, col };
            // Default to 'across' unless it's not a valid start of an across word
            const acrossWord = findWordCells(row, col, 'across');
            if (acrossWord.length <= 1) {
                currentDirection = 'down';
            } else {
                currentDirection = 'across';
            }
        }
        updateHighlight();
        focusOnActiveCell();
    }
    
    function handleInput(e) {
        const input = e.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        // Auto-move to the next cell on input
        if (input.value) {
            const nextCell = getNextCell(row, col, currentDirection);
            if (nextCell) {
                activeCell = nextCell;
                // We don't need to call updateHighlight here, focusOnActiveCell will trigger the next click
                focusOnActiveCell();
            }
        }
    }

    function handleArrowNavigation(e) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        if (activeCell.row === null) return; // Do nothing if no cell is selected

        e.preventDefault(); // Stop the page from scrolling
        let { row, col } = activeCell;
        
        switch (e.key) {
            case 'ArrowUp': row--; break;
            case 'ArrowDown': row++; break;
            case 'ArrowLeft': col--; break;
            case 'ArrowRight': col++; break;
        }

        const nextCell = findNextValidCell(row, col, e.key);
        if (nextCell) {
            activeCell = nextCell;
            // When moving with arrows, if the new cell isn't part of a word in the current direction, toggle it
            const word = findWordCells(activeCell.row, activeCell.col, currentDirection);
            if(word.length <= 1) { 
                currentDirection = currentDirection === 'across' ? 'down' : 'across';
            }
            updateHighlight();
            focusOnActiveCell();
        }
    }
    
    // --- HELPER & UTILITY FUNCTIONS ---
    function updateHighlight() {
        // Remove all previous highlights
        document.querySelectorAll('.grid-cell').forEach(c => {
            c.classList.remove('highlight-word', 'highlight-active');
        });

        if (activeCell.row === null) return;
        
        const wordCells = findWordCells(activeCell.row, activeCell.col, currentDirection);
        wordCells.forEach(({ r, c }) => {
            const cell = grid.querySelector(`div[data-row='${r}'][data-col='${c}']`);
            if (cell) {
                cell.classList.add('highlight-word');
            }
        });

        // Highlight the single active cell more prominently
        const activeCellElement = grid.querySelector(`div[data-row='${activeCell.row}'][data-col='${activeCell.col}']`);
        if (activeCellElement) {
            activeCellElement.classList.add('highlight-active');
        }
    }
    
    function findWordCells(startRow, startCol, direction) {
        const word = [];
        let r = startRow, c = startCol;
        // Go to the beginning of the word
        while (r >= 0 && c >= 0 && puzzleData.gridSolution[r][c] !== '.') {
            if (direction === 'across') c--; else r--;
        }
        if (direction === 'across') c++; else r++;

        // Read through to the end of the word
        while (r < puzzleData.gridSize && c < puzzleData.gridSize && puzzleData.gridSolution[r][c] !== '.') {
            word.push({ r, c });
            if (direction === 'across') c++; else r++;
        }
        return word;
    }

    function getNextCell(row, col, direction) {
        if (direction === 'across') col++; else row++;
        if (row >= puzzleData.gridSize || col >= puzzleData.gridSize || puzzleData.gridSolution[row][col] === '.') {
            return null; // End of word or grid
        }
        return { row, col };
    }

    function findNextValidCell(row, col, key) {
        while(row >= 0 && row < puzzleData.gridSize && col >= 0 && col < puzzleData.gridSize) {
            if(puzzleData.gridSolution[row][col] !== '.') {
                return {row, col};
            }
            switch (key) {
                case 'ArrowUp': row--; break;
                case 'ArrowDown': row++; break;
                case 'ArrowLeft': col--; break;
                case 'ArrowRight': col++; break;
            }
        }
        return null;
    }
    
    function focusOnActiveCell() {
        if (activeCell.row !== null) {
            const activeInput = grid.querySelector(`input[data-row='${activeCell.row}'][data-col='${activeCell.col}']`);
            if (activeInput) {
                activeInput.focus();
                activeInput.select();
            }
        }
    }

    // --- Functions to set up the initial display ---
    function placeClueNumbers() {
        puzzleData.clues.across.forEach(clue => {
            const cell = grid.querySelector(`div[data-row='${clue.row}'][data-col='${clue.col}']`);
            const numberSpan = document.createElement('span');
            numberSpan.classList.add('clue-number');
            numberSpan.textContent = clue.number;
            cell.appendChild(numberSpan);
        });
        puzzleData.clues.down.forEach(clue => {
            const cell = grid.querySelector(`div[data-row='${clue.row}'][data-col='${clue.col}']`);
            if (!cell.querySelector('.clue-number')) {
                const numberSpan = document.createElement('span');
                numberSpan.classList.add('clue-number');
                numberSpan.textContent = clue.number;
                cell.appendChild(numberSpan);
            }
        });
    }
    function displayClues() {
        acrossCluesList.innerHTML = ''; // Clear existing clues
        downCluesList.innerHTML = '';   // Clear existing clues
        puzzleData.clues.across.forEach(clue => {
            const listItem = document.createElement('li');
            listItem.textContent = `${clue.number}. ${clue.clue}`;
            acrossCluesList.appendChild(listItem);
        });
        puzzleData.clues.down.forEach(clue => {
            const listItem = document.createElement('li');
            listItem.textContent = `${clue.number}. ${clue.clue}`;
            downCluesList.appendChild(listItem);
        });
    }
    
    // START THE GAME!
    initializeGame();
});