// ==UserScript==
// @name         GitHub Raw Code Syntax Highlighter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Apply syntax highlighting to GitHub raw code pages
// @author       You
// @match        https://raw.githubusercontent.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';
  
  // Only run on GitHub raw pages
  if (!window.location.href.startsWith('https://raw.githubusercontent.com/')) {
      return;
  }
  
  // Add highlight.js CSS by creating a style link element
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
  document.head.appendChild(linkElement);
  
  // Add custom styles for better readability
  GM_addStyle(`
      body {
          background-color: #f8f8f8;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: monospace;
      }
      pre {
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: auto;
      }
  `);
  
  // Get the file extension from the URL to determine language
  function getLanguageFromURL(url) {
      const path = url.split('/').pop();
      const extension = path.split('.').pop().toLowerCase();
      
      const extensionMap = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'rb': 'ruby',
          'java': 'java',
          'html': 'html',
          'css': 'css',
          'php': 'php',
          'go': 'go',
          'c': 'c',
          'cpp': 'cpp',
          'cs': 'csharp',
          'sh': 'bash',
          'md': 'markdown',
          'json': 'json',
          'xml': 'xml',
          'yaml': 'yaml',
          'yml': 'yaml'
      };
      
      return extensionMap[extension] || 'javascript'; // Default to JavaScript as requested
  }
  
  // Create control panel for font size and line height adjustment
  function createControlPanel() {
      // Create container for controls
      const controlPanel = document.createElement('div');
      controlPanel.className = 'code-controls';
      
      // Font size controls
      const fontSizeLabel = document.createElement('div');
      fontSizeLabel.textContent = 'Font Size';
      fontSizeLabel.className = 'control-label';
      
      const fontSizeControls = document.createElement('div');
      fontSizeControls.className = 'control-buttons';
      
      const decreaseFontBtn = document.createElement('button');
      decreaseFontBtn.textContent = '-';
      decreaseFontBtn.addEventListener('click', () => adjustFontSize(-1));
      
      const increaseFontBtn = document.createElement('button');
      increaseFontBtn.textContent = '+';
      increaseFontBtn.addEventListener('click', () => adjustFontSize(1));
      
      fontSizeControls.appendChild(decreaseFontBtn);
      fontSizeControls.appendChild(increaseFontBtn);
      
      // Line height controls
      const lineHeightLabel = document.createElement('div');
      lineHeightLabel.textContent = 'Line Height';
      lineHeightLabel.className = 'control-label';
      
      const lineHeightControls = document.createElement('div');
      lineHeightControls.className = 'control-buttons';
      
      const decreaseLineBtn = document.createElement('button');
      decreaseLineBtn.textContent = '-';
      decreaseLineBtn.addEventListener('click', () => adjustLineHeight(-0.1));
      
      const increaseLineBtn = document.createElement('button');
      increaseLineBtn.textContent = '+';
      increaseLineBtn.addEventListener('click', () => adjustLineHeight(0.1));
      
      lineHeightControls.appendChild(decreaseLineBtn);
      lineHeightControls.appendChild(increaseLineBtn);
      
      // Append all elements to control panel
      controlPanel.appendChild(fontSizeLabel);
      controlPanel.appendChild(fontSizeControls);
      controlPanel.appendChild(lineHeightLabel);
      controlPanel.appendChild(lineHeightControls);
      
      // Style the control panel
      GM_addStyle(`
          .code-controls {
              position: fixed;
              right: 20px;
              top: 20px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              z-index: 1000;
          }
          .control-label {
              font-weight: bold;
              margin-top: 10px;
              margin-bottom: 5px;
          }
          .control-buttons {
              display: flex;
              gap: 5px;
          }
          .control-buttons button {
              width: 30px;
              height: 30px;
              font-size: 16px;
              cursor: pointer;
              background: #f0f0f0;
              border: 1px solid #ccc;
              border-radius: 3px;
          }
          .control-buttons button:hover {
              background: #e0e0e0;
          }
      `);
      
      return controlPanel;
  }
  
  // Function to adjust font size
  function adjustFontSize(change) {
      const codeElement = document.querySelector('pre code');
      if (!codeElement) return;
      
      // Get current font size and calculate new size
      const style = window.getComputedStyle(codeElement);
      let currentSize = parseInt(style.fontSize);
      
      // If can't parse, use default of 14px
      if (isNaN(currentSize)) currentSize = 14;
      
      // Apply new font size (minimum 10px, maximum 24px)
      const newSize = Math.max(10, Math.min(24, currentSize + change));
      
      // Apply to the code element
      codeElement.style.fontSize = `${newSize}px`;
      
      // Save preference
      localStorage.setItem('github-raw-font-size', newSize);
  }
  
  // Function to adjust line height
  function adjustLineHeight(change) {
      const codeElement = document.querySelector('pre code');
      if (!codeElement) return;
      
      // Get current line height and calculate new height
      const style = window.getComputedStyle(codeElement);
      let currentHeight = parseFloat(style.lineHeight);
      
      // If can't parse or it's 'normal', use default of 1.5
      if (isNaN(currentHeight) || style.lineHeight === 'normal') currentHeight = 1.5;
      
      // Apply new line height (minimum 1.0, maximum 2.5)
      const newHeight = Math.max(1.0, Math.min(2.5, currentHeight + change)).toFixed(1);
      
      // Apply to the code element
      codeElement.style.lineHeight = newHeight;
      
      // Save preference
      localStorage.setItem('github-raw-line-height', newHeight);
  }
  
  // Load saved preferences
  function loadPreferences() {
      const codeElement = document.querySelector('pre code');
      if (!codeElement) return;
      
      // Load font size preference
      const savedFontSize = localStorage.getItem('github-raw-font-size');
      if (savedFontSize) {
          codeElement.style.fontSize = `${savedFontSize}px`;
      }
      
      // Load line height preference
      const savedLineHeight = localStorage.getItem('github-raw-line-height');
      if (savedLineHeight) {
          codeElement.style.lineHeight = savedLineHeight;
      }
  }
  
  // Main function to apply syntax highlighting
  function applyHighlighting() {
      const preElement = document.querySelector('body > pre');
      
      if (preElement) {
          const code = preElement.textContent;
          const language = getLanguageFromURL(window.location.href);
          
          // Create new elements for highlighting
          const newPre = document.createElement('pre');
          const newCode = document.createElement('code');
          newCode.className = `hljs language-${language}`;
          newCode.textContent = code;
          
          // Apply highlighting
          hljs.highlightElement(newCode);
          
          // Replace the content
          newPre.appendChild(newCode);
          preElement.replaceWith(newPre);
          
          // Add title with detected language
          const titleDiv = document.createElement('div');
          titleDiv.style.marginBottom = '10px';
          titleDiv.style.fontSize = '14px';
          titleDiv.style.color = '#555';
          titleDiv.textContent = `Language detected: ${language}`;
          newPre.parentNode.insertBefore(titleDiv, newPre);
          
          // Add the control panel to the page
          document.body.appendChild(createControlPanel());
          
          // Load saved preferences
          setTimeout(loadPreferences, 100); // Small delay to ensure the code element is ready
      }
  }
  
  // Apply highlighting when the page is loaded
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyHighlighting);
  } else {
      applyHighlighting();
  }
})();
