# PDF Cutter - Modern PDF Splitting Tool

A beautiful, modern web application for splitting PDF files into smaller documents. Built with vanilla JavaScript, HTML5, and CSS3 with a clean, responsive design.

## Features

✨ **Modern Interface**: Clean, gradient-based design with smooth animations
📄 **PDF Preview**: View PDF pages before splitting
🎯 **Multiple Split Options**:
- Extract specific page ranges
- Split into individual pages
- Custom page range splitting
📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
🎨 **Drag & Drop**: Easy file upload with drag and drop support
⚡ **Fast Processing**: Client-side PDF processing using PDF-lib
🔒 **Privacy Focused**: All processing happens in your browser

## How to Use

### 1. Upload Your PDF
- Click "Choose File" or drag and drop your PDF onto the upload area
- Supported format: PDF files only
- File size: Recommended under 50MB for optimal performance

### 2. Preview and Navigate
- View your PDF pages in the preview section
- Use navigation arrows to browse through pages
- Check the total page count

### 3. Choose Split Option

#### Page Range
- Set start and end page numbers
- Perfect for extracting specific sections

#### Single Pages
- Splits PDF into individual page files
- Great for separating each page

#### Custom Split
- Define multiple custom ranges
- Use format: "1-5, 8, 10-12"
- Add multiple ranges as needed

### 4. Split and Download
- Click "Split PDF" to process your file
- Monitor progress in the progress bar
- Download individual files from the results section

## Technical Features

### Built With
- **HTML5**: Semantic markup with modern elements
- **CSS3**: Flexbox, Grid, custom properties, and animations
- **JavaScript ES6+**: Modern JavaScript with async/await
- **PDF.js**: For PDF rendering and preview
- **PDF-lib**: For PDF manipulation and splitting

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance
- Client-side processing (no server required)
- Memory efficient PDF handling
- Optimized for large files
- Progressive loading and rendering

## File Structure

```
pdf-cutter/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript application logic
└── README.md           # This file
```

## Installation

### Option 1: Direct Use
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. Start using the PDF cutter immediately

### Option 2: Local Server (Recommended)
1. Install a local server like Live Server (VS Code extension)
2. Open the project folder
3. Start the live server
4. Access via `http://localhost:5500` (or your server's URL)

### Option 3: Deploy to Web
Upload all files to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Your own web server

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, or layout
- CSS custom properties make theming easy
- Responsive breakpoints can be adjusted

### Functionality
- Extend `script.js` to add new split options
- Modify file naming conventions
- Add new export formats

### Branding
- Update the logo and title in `index.html`
- Change color scheme in CSS variables
- Customize footer and header content

## Troubleshooting

### Common Issues

**PDF Won't Load**
- Ensure the file is a valid PDF
- Check file size (large files may take time)
- Try a different PDF file

**Split Function Not Working**
- Verify page numbers are within valid range
- Check custom range format (e.g., "1-5, 8")
- Ensure start page ≤ end page

**Download Issues**
- Allow pop-ups in your browser
- Check browser download settings
- Try right-click and "Save As"

### Browser Requirements
- JavaScript must be enabled
- Local file access may be restricted (use local server)
- Pop-up blocker should allow downloads

## Security and Privacy

🔒 **Your Privacy Matters**
- All PDF processing happens locally in your browser
- No files are uploaded to any server
- No data is stored or transmitted
- Works completely offline after initial load

## Development

### Adding New Features
1. Fork or download the project
2. Modify the JavaScript in `script.js`
3. Update styles in `styles.css`
4. Test across different browsers

### Contributing
- Report bugs via issues
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Credits

- **PDF.js** - Mozilla's PDF rendering library
- **PDF-lib** - PDF manipulation library
- **Font Awesome** - Icons
- **Google Fonts** - Inter font family

## Version History

- **v1.0.0** - Initial release with core functionality
- Modern UI with gradient design
- Multiple split options
- Responsive layout
- Drag and drop support

## Support

For support or questions:
1. Check the troubleshooting section
2. Review browser compatibility
3. Ensure all files are properly loaded
4. Test with a simple PDF file first

---

**Enjoy splitting your PDFs with style! 🎉**
