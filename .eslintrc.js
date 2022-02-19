module.exports = {
  "parserOptions": {
    "ecmaVersion": 10
  },
  "env": {
    "browser": true,    // Include browser globals
    "jquery": true      // Include jQuery and $
  },
  "globals": {
    "_": true,          // underscore.js
    "Clipboard": true,  // clipboard.js
    "anchors": true     // anchor.js
  }
};
