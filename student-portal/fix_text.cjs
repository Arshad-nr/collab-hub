const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function fixTextInGradients(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixTextInGradients(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix dark text inside royal gradients
      const newContent = content.replace(/(from-royal-600 to-royal-800[^"]*)text-royal-900/g, '$1text-gold-500');
      
      // Fix rings in dark-800
      const newContent2 = newContent.replace(/ring-dark-800/g, 'ring-cream-50');

      if (content !== newContent2) {
        fs.writeFileSync(fullPath, newContent2, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixTextInGradients(directoryPath);
