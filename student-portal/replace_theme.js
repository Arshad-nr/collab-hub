const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  // Backgrounds
  'bg-dark-900': 'bg-cream-100',
  'bg-dark-800': 'bg-cream-50',
  'bg-dark-700': 'bg-cream-200',
  'bg-slate-800': 'bg-cream-50',
  'bg-slate-700': 'bg-cream-200',
  'bg-slate-900': 'bg-cream-100',
  
  // Text colors
  'text-white': 'text-royal-900',
  'text-gray-100': 'text-royal-800',
  'text-gray-200': 'text-royal-700',
  'text-gray-300': 'text-royal-600',
  'text-gray-400': 'text-royal-500',
  'text-gray-500': 'text-royal-400',
  'text-gray-600': 'text-gold-500', 
  
  // Borders
  'border-white/10': 'border-gold-300',
  'border-white/20': 'border-gold-400',
  'border-slate-700': 'border-gold-300',
  
  // Gradients and specific colors
  'from-primary-500': 'from-royal-600',
  'to-purple-600': 'to-royal-800',
  'to-primary-600': 'to-royal-800',
  'ring-primary-500': 'ring-gold-500',
  'bg-primary-500/10': 'bg-royal-500/10',
  'text-primary-400': 'text-royal-600',
  'text-primary-500': 'text-royal-700',
  
  // Hovers
  'hover:text-white': 'hover:text-royal-900',
  'hover:bg-dark-700': 'hover:bg-cream-200',
  'hover:border-primary-500': 'hover:border-gold-500',
};

function searchAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      searchAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [search, replace] of Object.entries(replacements)) {
        const regex = new RegExp(search.replace(/\//g, '\\/'), 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

searchAndReplace(directoryPath);
console.log('Theme replacement complete.');
