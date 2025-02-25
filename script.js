class Game {
    constructor() {
        this.grid = Array(16).fill(0);
        this.score = 0;
        this.setupGrid();
        this.setupEventListeners();
        this.addNewNumber();
        this.addNewNumber();
        this.touchStartX = null;
        this.touchStartY = null;
    }

    setupGrid() {
        const gridContainer = document.querySelector('.grid');
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gridContainer.appendChild(cell);
        }
        this.updateDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('new-game').addEventListener('click', () => {
            this.grid = Array(16).fill(0);
            this.score = 0;
            this.addNewNumber();
            this.addNewNumber();
            this.updateDisplay();
        });

        // タッチイベントの追加
        const grid = document.querySelector('.grid');
        grid.addEventListener('touchstart', this.handleTouchStart.bind(this));
        grid.addEventListener('touchmove', this.handleTouchMove.bind(this));
        grid.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // リフレッシュボタンのクリックイベントを追加
        document.getElementById('refresh-icon').addEventListener('click', () => {
            location.reload();
        });
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        let moved = false;

        // キーの判定を修正し、デバッグ用のログを追加
        if (key === 'arrowup' || key === 'w') {
            console.log('Move Up');
            moved = this.moveUp();
        } else if (key === 'arrowdown' || key === 's') {
            console.log('Move Down');
            moved = this.moveDown();
        } else if (key === 'arrowleft' || key === 'a') {
            console.log('Move Left');
            moved = this.moveLeft();
        } else if (key === 'arrowright' || key === 'd') {
            console.log('Move Right');
            moved = this.moveRight();
        } else {
            console.log('Invalid Key:', key);
        }

        if (moved) {
            this.addNewNumber();
            this.updateDisplay();
            if (this.isGameOver()) {
                alert('Game Over! Score: ' + this.score);
            }
        }
    }

    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        event.preventDefault();
    }

    handleTouchMove(event) {
        event.preventDefault();
    }

    handleTouchEnd(event) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // 最小スワイプ距離（ピクセル）
        const minSwipeDistance = 50;
        
        let moved = false;

        // 水平方向と垂直方向のスワイプを判定
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平スワイプ
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    moved = this.moveRight();
                } else {
                    moved = this.moveLeft();
                }
            }
        } else {
            // 垂直スワイプ
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    moved = this.moveDown();
                } else {
                    moved = this.moveUp();
                }
            }
        }

        if (moved) {
            this.addNewNumber();
            this.updateDisplay();
            if (this.isGameOver()) {
                alert('Game Over! Score: ' + this.score);
            }
        }

        // タッチ位置をリセット
        this.touchStartX = null;
        this.touchStartY = null;
    }

    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowStart = row * 4;
            const currentRow = this.grid.slice(rowStart, rowStart + 4);
            const { line: newRow } = this.mergeLine(currentRow);
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[rowStart + i] !== newRow[i]) {
                    moved = true;
                    this.grid[rowStart + i] = newRow[i];
                }
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const rowStart = row * 4;
            const currentRow = this.grid.slice(rowStart, rowStart + 4).reverse();
            const { line: newRow } = this.mergeLine(currentRow);
            newRow.reverse();  // 修正: newRowに対してreverseを呼び出す
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[rowStart + i] !== newRow[i]) {
                    moved = true;
                    this.grid[rowStart + i] = newRow[i];
                }
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const column = [
                this.grid[col],
                this.grid[col + 4],
                this.grid[col + 8],
                this.grid[col + 12]
            ];
            const { line: newColumn } = this.mergeLine(column);
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[col + i * 4] !== newColumn[i]) {
                    moved = true;
                    this.grid[col + i * 4] = newColumn[i];
                }
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const column = [
                this.grid[col + 12],
                this.grid[col + 8],
                this.grid[col + 4],
                this.grid[col]
            ];
            const { line: newColumn } = this.mergeLine(column);
            newColumn.reverse();  // 修正: newColumnに対してreverseを呼び出す
            
            for (let i = 0; i < 4; i++) {
                if (this.grid[col + i * 4] !== newColumn[i]) {
                    moved = true;
                    this.grid[col + i * 4] = newColumn[i];
                }
            }
        }
        return moved;
    }

    mergeLine(line) {
        const newLine = line.filter(x => x !== 0);
        const mergedPositions = [];
        
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                this.score += newLine[i];
                newLine.splice(i + 1, 1);
                mergedPositions.push(i);
            }
        }
        while (newLine.length < 4) {
            newLine.push(0);
        }
        return { line: newLine, mergedPositions };
    }

    addNewNumber() {
        const emptyCells = this.grid.reduce((acc, curr, idx) => {
            if (curr === 0) acc.push(idx);
            return acc;
        }, []);

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    isGameOver() {
        if (this.grid.includes(0)) return false;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i * 4 + j];
                if (
                    (j < 3 && current === this.grid[i * 4 + j + 1]) ||
                    (i < 3 && current === this.grid[(i + 1) * 4 + j])
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        const oldGrid = [...this.grid];
        
        cells.forEach((cell, index) => {
            cell.className = 'cell';
            const value = this.grid[index];
            cell.textContent = value || '';
            cell.setAttribute('data-value', value);

            // 新しい数字が追加された場合
            if (value !== 0 && oldGrid[index] === 0) {
                cell.classList.add('new');
            }
            // マージされた場合
            else if (value !== 0 && value !== oldGrid[index] && oldGrid[index] !== 0) {
                cell.classList.add('merge');
            }
        });

        document.getElementById('score').textContent = this.score;
    }
}

new Game();
