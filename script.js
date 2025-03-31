document.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('colorInput');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const cssOutput = document.getElementById('cssOutput');
  const jsonError = document.getElementById('jsonError');

  // Generate CSS when button is clicked
  generateBtn.addEventListener('click', () => {
    try {
      const colors = JSON.parse(colorInput.value);
      const modifiers = Array.from(document.querySelectorAll('.modifier-checkbox:checked'))
                            .map(el => el.value);
      
      let css = '/* Auto-generated Tailwind color classes */\n\n';
      
      // Generate all modifier combinations
      const modifierCombinations = generateModifierCombinations(modifiers);
      
      // Create CSS classes for each color and modifier
      Object.entries(colors).forEach(([colorName, shades]) => {
        Object.entries(shades).forEach(([shade, hex]) => {
          // Base class (e.g., .primary-500)
          css += `.${colorName}-${shade} {\n  background-color: ${hex};\n}\n\n`;
          
          // Modifier classes (e.g., .hover\:primary-500)
          modifierCombinations.forEach(mod => {
            css += `.${mod.replace(/:/g, '\\:')}-${colorName}-${shade} {\n  background-color: ${hex};\n}\n\n`;
          });
        });
      });
      
      cssOutput.value = css;
      downloadBtn.disabled = false;
      jsonError.classList.add('hidden');
    } catch (error) {
      jsonError.textContent = `Invalid JSON: ${error.message}`;
      jsonError.classList.remove('hidden');
    }
  });

  // Download CSS file
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([cssOutput.value], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailwind-colors.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Helper: Generate all valid modifier combinations
  function generateModifierCombinations(modifiers) {
    const combinations = [];
    
    // Single modifiers
    combinations.push(...modifiers);
    
    // Nested modifiers (e.g., 'dark:hover')
    if (modifiers.includes('dark')) {
      modifiers.filter(m => m !== 'dark').forEach(m => {
        combinations.push(`dark:${m}`);
      });
    }
    
    // Group modifiers (e.g., 'group-hover:hover')
    if (modifiers.includes('group-hover')) {
      modifiers.filter(m => m !== 'group-hover').forEach(m => {
        combinations.push(`group-hover:${m}`);
      });
    }
    
    return [...new Set(combinations)]; // Remove duplicates
  }

  // Enable generate button only when valid JSON and at least one modifier is selected
  colorInput.addEventListener('input', validateInputs);
  document.querySelectorAll('.modifier-checkbox').forEach(cb => {
    cb.addEventListener('change', validateInputs);
  });

  function validateInputs() {
    try {
      JSON.parse(colorInput.value);
      const hasModifiers = document.querySelectorAll('.modifier-checkbox:checked').length > 0;
      generateBtn.disabled = !hasModifiers;
    } catch {
      generateBtn.disabled = true;
    }
  }
});
