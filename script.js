// PDF Cutter JavaScript Application
class PDFCutter {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.0;
        this.canvas = null;
        this.ctx = null;
        this.loadingTask = null;
        this.pageOrder = [];
        this.draggedElement = null;
        
        this.initializeEventListeners();
        this.setupPDFJS();
    }

    setupPDFJS() {
        // Set the worker source for PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    initializeEventListeners() {
        // File input handling
        const fileInput = document.getElementById('fileInput');
        const chooseFileBtn = document.getElementById('chooseFileBtn');
        const removeFileBtn = document.getElementById('removeFile');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        chooseFileBtn.addEventListener('click', () => fileInput.click());
        removeFileBtn.addEventListener('click', () => this.removeFile());

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // PDF navigation
        document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());

        // Page input controls
        document.getElementById('startPage').addEventListener('input', this.updatePageInputs.bind(this));
        document.getElementById('endPage').addEventListener('input', this.updatePageInputs.bind(this));

        // Split options
        document.querySelectorAll('input[name="splitOption"]').forEach(radio => {
            radio.addEventListener('change', this.handleSplitOptionChange.bind(this));
        });

        // Custom ranges
        document.getElementById('addRange').addEventListener('click', this.addCustomRange.bind(this));

        // Action buttons
        document.getElementById('splitBtn').addEventListener('click', this.splitPDF.bind(this));
        document.getElementById('resetBtn').addEventListener('click', this.resetApplication.bind(this));
        document.getElementById('startOverBtn').addEventListener('click', this.resetApplication.bind(this));

        // Canvas setup
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            this.loadPDF(files[0]);
        } else {
            this.showError('Please select a valid PDF file.');
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.loadPDF(file);
        } else {
            this.showError('Please select a valid PDF file.');
        }
    }

    async loadPDF(file) {
        try {
            this.showLoading(true);
            
            // Display file info
            this.displayFileInfo(file);
            
            // Convert file to array buffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Load PDF using PDF.js
            this.loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
            this.pdfDoc = await this.loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            
            // Initialize page order
            this.pageOrder = Array.from({length: this.totalPages}, (_, i) => i + 1);
            
            // Update UI
            this.updateUI();
            this.renderPage(1);
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Failed to load PDF. Please try again.');
            this.showLoading(false);
        }
    }

    displayFileInfo(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileInfo = document.getElementById('fileInfo');
        const uploadSection = document.getElementById('uploadArea');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        uploadSection.style.display = 'none';
        fileInfo.style.display = 'block';
    }

    updateUI() {
        // Show PDF section
        document.getElementById('pdfSection').style.display = 'block';
        document.getElementById('pdfSection').classList.add('fade-in');
        
        // Update page controls
        document.getElementById('pageCount').textContent = this.totalPages;
        document.getElementById('startPage').max = this.totalPages;
        document.getElementById('endPage').max = this.totalPages;
        document.getElementById('endPage').value = this.totalPages;
        
        this.updatePageDisplay();
    }

    async renderPage(pageNum) {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({scale: this.scale});
            
            // Set canvas dimensions
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            // Render page
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            this.currentPage = pageNum;
            this.updatePageDisplay();
            
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError('Failed to render PDF page.');
        }
    }

    updatePageDisplay() {
        document.getElementById('currentPageDisplay').textContent = 
            `Page ${this.currentPage} of ${this.totalPages}`;
        
        // Update navigation buttons
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= this.totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.renderPage(this.currentPage + 1);
        }
    }

    updatePageInputs() {
        const startPage = parseInt(document.getElementById('startPage').value);
        const endPage = parseInt(document.getElementById('endPage').value);
        
        // Validate inputs
        if (startPage > endPage) {
            document.getElementById('endPage').value = startPage;
        }
        
        if (startPage < 1) {
            document.getElementById('startPage').value = 1;
        }
        
        if (endPage > this.totalPages) {
            document.getElementById('endPage').value = this.totalPages;
        }
    }

    handleSplitOptionChange(e) {
        const customRanges = document.getElementById('customRanges');
        const reorderSection = document.getElementById('reorderSection');
        
        // Hide all sections first
        customRanges.style.display = 'none';
        reorderSection.style.display = 'none';
        
        if (e.target.value === 'custom') {
            customRanges.style.display = 'block';
        } else if (e.target.value === 'reorder') {
            reorderSection.style.display = 'block';
            this.renderPageThumbnails();
        }
    }

    addCustomRange() {
        const container = document.getElementById('rangesContainer');
        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'range-input';
        rangeDiv.innerHTML = `
            <input type="text" placeholder="e.g., 1-5, 8, 10-12" class="range-text">
            <button class="remove-range" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(rangeDiv);
    }

    async renderPageThumbnails() {
        if (!this.pdfDoc) return;
        
        const grid = document.getElementById('pagesGrid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.pageOrder.length; i++) {
            const pageNum = this.pageOrder[i];
            const thumbnail = await this.createPageThumbnail(pageNum, i);
            grid.appendChild(thumbnail);
        }
    }

    async createPageThumbnail(pageNum, index) {
        const page = await this.pdfDoc.getPage(pageNum);
        
        // Create thumbnail container
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'page-thumbnail';
        thumbnailDiv.draggable = true;
        thumbnailDiv.dataset.pageIndex = index;
        thumbnailDiv.dataset.pageNumber = pageNum;
        
        // Create canvas for page preview
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set scale for thumbnail
        const scale = 0.3;
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render page to canvas
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        // Create page number label
        const pageLabel = document.createElement('div');
        pageLabel.className = 'page-number';
        pageLabel.textContent = `Page ${pageNum}`;
        
        // Append elements
        thumbnailDiv.appendChild(canvas);
        thumbnailDiv.appendChild(pageLabel);
        
        // Add drag and drop event listeners
        this.addDragDropListeners(thumbnailDiv);
        
        return thumbnailDiv;
    }

    addDragDropListeners(element) {
        element.addEventListener('dragstart', (e) => {
            this.draggedElement = element;
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            if (this.draggedElement && this.draggedElement !== element) {
                this.reorderPages(this.draggedElement, element);
            }
        });

        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
            document.querySelectorAll('.page-thumbnail').forEach(thumb => {
                thumb.classList.remove('drag-over');
            });
            this.draggedElement = null;
        });
    }

    reorderPages(draggedElement, targetElement) {
        const draggedIndex = parseInt(draggedElement.dataset.pageIndex);
        const targetIndex = parseInt(targetElement.dataset.pageIndex);
        
        // Reorder the pageOrder array
        const movedPage = this.pageOrder.splice(draggedIndex, 1)[0];
        this.pageOrder.splice(targetIndex, 0, movedPage);
        
        // Re-render thumbnails with new order
        this.renderPageThumbnails();
    }

    async splitPDF() {
        if (!this.pdfDoc) {
            this.showError('Please load a PDF file first.');
            return;
        }

        try {
            this.showProgress(true);
            this.updateProgress(0, 'Preparing to split PDF...');

            const splitOption = document.querySelector('input[name="splitOption"]:checked').value;
            const originalArrayBuffer = await this.getOriginalPDFArrayBuffer();
            
            let splitResults = [];

            switch (splitOption) {
                case 'range':
                    splitResults = await this.splitByRange(originalArrayBuffer);
                    break;
                case 'single':
                    splitResults = await this.splitToSinglePages(originalArrayBuffer);
                    break;
                case 'custom':
                    splitResults = await this.splitByCustomRanges(originalArrayBuffer);
                    break;
                case 'reorder':
                    splitResults = await this.splitByReorder(originalArrayBuffer);
                    break;
            }

            this.showResults(splitResults);
            this.showProgress(false);

        } catch (error) {
            console.error('Error splitting PDF:', error);
            this.showError('Failed to split PDF. Please try again.');
            this.showProgress(false);
        }
    }

    async getOriginalPDFArrayBuffer() {
        // Get the original file from the file input
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        return await file.arrayBuffer();
    }

    async splitByRange(originalArrayBuffer) {
        const startPage = parseInt(document.getElementById('startPage').value);
        const endPage = parseInt(document.getElementById('endPage').value);
        
        this.updateProgress(25, 'Loading original PDF...');
        
        const pdfDoc = await PDFLib.PDFDocument.load(originalArrayBuffer);
        const newPdf = await PDFLib.PDFDocument.create();
        
        this.updateProgress(50, 'Extracting pages...');
        
        // Copy pages
        const pageIndices = [];
        for (let i = startPage - 1; i < endPage; i++) {
            pageIndices.push(i);
        }
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        this.updateProgress(75, 'Generating PDF...');
        
        const pdfBytes = await newPdf.save();
        
        this.updateProgress(100, 'Complete!');
        
        return [{
            name: `pages_${startPage}-${endPage}.pdf`,
            data: pdfBytes,
            pageCount: endPage - startPage + 1
        }];
    }

    async splitToSinglePages(originalArrayBuffer) {
        const pdfDoc = await PDFLib.PDFDocument.load(originalArrayBuffer);
        const results = [];
        
        for (let i = 0; i < this.totalPages; i++) {
            this.updateProgress((i / this.totalPages) * 100, `Processing page ${i + 1}...`);
            
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
            
            const pdfBytes = await newPdf.save();
            
            results.push({
                name: `page_${i + 1}.pdf`,
                data: pdfBytes,
                pageCount: 1
            });
        }
        
        return results;
    }

    async splitByCustomRanges(originalArrayBuffer) {
        const ranges = this.parseCustomRanges();
        if (ranges.length === 0) {
            throw new Error('Please specify valid page ranges.');
        }
        
        const pdfDoc = await PDFLib.PDFDocument.load(originalArrayBuffer);
        const results = [];
        
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            this.updateProgress((i / ranges.length) * 100, `Processing range ${i + 1}...`);
            
            const newPdf = await PDFLib.PDFDocument.create();
            const pageIndices = this.expandRange(range);
            
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            
            results.push({
                name: `range_${i + 1}.pdf`,
                data: pdfBytes,
                pageCount: pageIndices.length
            });
        }
        
        return results;
    }

    async splitByReorder(originalArrayBuffer) {
        this.updateProgress(25, 'Loading original PDF...');
        
        const pdfDoc = await PDFLib.PDFDocument.load(originalArrayBuffer);
        const newPdf = await PDFLib.PDFDocument.create();
        
        this.updateProgress(50, 'Reordering pages...');
        
        // Copy pages in the new order (convert to 0-based indices)
        const pageIndices = this.pageOrder.map(pageNum => pageNum - 1);
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        this.updateProgress(75, 'Generating reordered PDF...');
        
        const pdfBytes = await newPdf.save();
        
        this.updateProgress(100, 'Complete!');
        
        return [{
            name: `reordered_pages.pdf`,
            data: pdfBytes,
            pageCount: this.pageOrder.length
        }];
    }

    parseCustomRanges() {
        const rangeInputs = document.querySelectorAll('.range-text');
        const ranges = [];
        
        rangeInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                ranges.push(value);
            }
        });
        
        return ranges;
    }

    expandRange(rangeStr) {
        const pages = [];
        const parts = rangeStr.split(',');
        
        parts.forEach(part => {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= this.totalPages) {
                        pages.push(i - 1); // Convert to 0-based index
                    }
                }
            } else {
                const pageNum = parseInt(part);
                if (pageNum >= 1 && pageNum <= this.totalPages) {
                    pages.push(pageNum - 1); // Convert to 0-based index
                }
            }
        });
        
        // Remove duplicates and sort
        return [...new Set(pages)].sort((a, b) => a - b);
    }

    showResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContainer = document.getElementById('resultsContainer');
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Create download items
        results.forEach((result, index) => {
            const downloadItem = document.createElement('div');
            downloadItem.className = 'download-item';
            
            const blob = new Blob([result.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            downloadItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <h4>${result.name}</h4>
                <p>${result.pageCount} page${result.pageCount > 1 ? 's' : ''}</p>
                <a href="${url}" download="${result.name}" class="download-btn">
                    <i class="fas fa-download"></i> Download
                </a>
            `;
            
            resultsContainer.appendChild(downloadItem);
        });
        
        // Show results section
        document.getElementById('pdfSection').style.display = 'none';
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
    }

    showProgress(show) {
        const progressSection = document.getElementById('progressSection');
        const pdfSection = document.getElementById('pdfSection');
        
        if (show) {
            pdfSection.style.display = 'none';
            progressSection.style.display = 'block';
        } else {
            progressSection.style.display = 'none';
        }
    }

    updateProgress(percentage, text) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = text;
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        alert(message); // In a real app, you'd want a better error display
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile() {
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        // Hide file info and show upload area
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        
        // Hide PDF section
        document.getElementById('pdfSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        // Reset variables
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.pageOrder = [];
    }

    resetApplication() {
        // Reset everything to initial state
        this.removeFile();
        
        // Reset form values
        document.getElementById('startPage').value = 1;
        document.getElementById('endPage').value = 1;
        document.querySelector('input[value="range"]').checked = true;
        
        // Clear custom ranges
        const rangesContainer = document.getElementById('rangesContainer');
        rangesContainer.innerHTML = `
            <div class="range-input">
                <input type="text" placeholder="e.g., 1-5, 8, 10-12" class="range-text">
                <button class="remove-range" onclick="this.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        document.getElementById('customRanges').style.display = 'none';
        document.getElementById('reorderSection').style.display = 'none';
        
        // Clear page order
        this.pageOrder = [];
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PDFCutter();
});

// Add some utility functions for better UX
document.addEventListener('keydown', (e) => {
    // Allow Escape key to close any open dialogs or reset
    if (e.key === 'Escape') {
        // You can add escape key functionality here
    }
});

// Prevent default drag behaviors on the document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Add smooth scrolling for better navigation
window.addEventListener('scroll', () => {
    // You can add scroll-based animations here
});

// Add resize handling for responsive canvas
window.addEventListener('resize', () => {
    // You can add responsive canvas resizing here
});
