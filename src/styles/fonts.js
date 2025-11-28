// Font Family Options
export const fonts = {
    'times-new-roman': {
        name: 'Times New Roman',
        family: '"Times New Roman", Times, serif',
        description: 'Classic serif font, ideal for academic and formal documents',
    },
    'georgia': {
        name: 'Georgia',
        family: 'Georgia, serif',
        description: 'Elegant serif font with excellent readability',
    },
    'arial': {
        name: 'Arial',
        family: 'Arial, Helvetica, sans-serif',
        description: 'Clean and modern sans-serif font',
    },
    'helvetica': {
        name: 'Helvetica',
        family: 'Helvetica, Arial, sans-serif',
        description: 'Professional sans-serif font',
    },
    'courier-new': {
        name: 'Courier New',
        family: '"Courier New", Courier, monospace',
        description: 'Monospace font for technical content',
    },
    'verdana': {
        name: 'Verdana',
        family: 'Verdana, Geneva, sans-serif',
        description: 'Highly legible sans-serif font',
    },
    'palatino': {
        name: 'Palatino',
        family: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
        description: 'Elegant serif font with Renaissance origins',
    },
    'garamond': {
        name: 'Garamond',
        family: 'Garamond, "Hoefler Text", "Times New Roman", serif',
        description: 'Classic old-style serif font',
    },
    'trebuchet': {
        name: 'Trebuchet MS',
        family: '"Trebuchet MS", "Lucida Grande", sans-serif',
        description: 'Humanist sans-serif font',
    },
    'inter': {
        name: 'Inter',
        family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        description: 'Modern sans-serif optimized for screens',
        googleFont: 'Inter:wght@300;400;500;600;700;800',
    },
    'roboto': {
        name: 'Roboto',
        family: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        description: 'Google\'s signature sans-serif font',
        googleFont: 'Roboto:wght@300;400;500;700;900',
    },
    'open-sans': {
        name: 'Open Sans',
        family: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        description: 'Friendly and neutral sans-serif',
        googleFont: 'Open+Sans:wght@300;400;600;700;800',
    },
    'lora': {
        name: 'Lora',
        family: '"Lora", Georgia, "Times New Roman", serif',
        description: 'Contemporary serif with calligraphic roots',
        googleFont: 'Lora:wght@400;500;600;700',
    },
    'merriweather': {
        name: 'Merriweather',
        family: '"Merriweather", Georgia, serif',
        description: 'Designed for pleasant reading on screens',
        googleFont: 'Merriweather:wght@300;400;700;900',
    },
    'source-sans-pro': {
        name: 'Source Sans Pro',
        family: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Adobe\'s sans-serif, excellent for small print',
        googleFont: 'Source+Sans+Pro:wght@300;400;600;700',
    },
    'noto-sans': {
        name: 'Noto Sans',
        family: '"Noto Sans", Arial, sans-serif',
        description: 'Google\'s universal font, highly legible at small sizes',
        googleFont: 'Noto+Sans:wght@300;400;500;600;700',
    },
    'fira-sans': {
        name: 'Fira Sans',
        family: '"Fira Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Designed for Firefox OS, great clarity at small sizes',
        googleFont: 'Fira+Sans:wght@300;400;500;600;700',
    },
    'pt-sans': {
        name: 'PT Sans',
        family: '"PT Sans", Arial, sans-serif',
        description: 'Optimized for Cyrillic, excellent small print legibility',
        googleFont: 'PT+Sans:wght@400;700',
    },
    'cabin': {
        name: 'Cabin',
        family: '"Cabin", Arial, sans-serif',
        description: 'Humanist sans-serif, compact and clear for dense layouts',
        googleFont: 'Cabin:wght@400;500;600;700',
    },
    'nunito-sans': {
        name: 'Nunito Sans',
        family: '"Nunito Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Rounded sans-serif, friendly and readable at small sizes',
        googleFont: 'Nunito+Sans:wght@300;400;600;700;800',
    },
    // 手写体 / Handwriting Fonts
    'caveat': {
        name: 'Caveat',
        family: '"Caveat", cursive',
        description: 'Casual handwriting font, perfect for notes and annotations',
        googleFont: 'Caveat:wght@400;500;600;700',
    },
    'dancing-script': {
        name: 'Dancing Script',
        family: '"Dancing Script", cursive',
        description: 'Elegant script font with flowing letters',
        googleFont: 'Dancing+Script:wght@400;500;600;700',
    },
    'pacifico': {
        name: 'Pacifico',
        family: '"Pacifico", cursive',
        description: 'Retro surf-style script font',
        googleFont: 'Pacifico',
    },
    // 等宽字体 / Monospace Fonts
    'fira-code': {
        name: 'Fira Code',
        family: '"Fira Code", "Courier New", monospace',
        description: 'Modern monospace with programming ligatures',
        googleFont: 'Fira+Code:wght@300;400;500;600;700',
    },
    'jetbrains-mono': {
        name: 'JetBrains Mono',
        family: '"JetBrains Mono", "Courier New", monospace',
        description: 'Developer-focused monospace font',
        googleFont: 'JetBrains+Mono:wght@300;400;500;600;700',
    },
    // 装饰字体 / Display Fonts
    'playfair-display': {
        name: 'Playfair Display',
        family: '"Playfair Display", Georgia, serif',
        description: 'High-contrast serif for headlines and titles',
        googleFont: 'Playfair+Display:wght@400;500;600;700;800;900',
    },
    'cinzel': {
        name: 'Cinzel',
        family: '"Cinzel", Georgia, serif',
        description: 'Classical Roman-inspired serif font',
        googleFont: 'Cinzel:wght@400;500;600;700;800;900',
    },
    // 现代无衬线 / Modern Sans-Serif
    'raleway': {
        name: 'Raleway',
        family: '"Raleway", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Elegant thin sans-serif with geometric style',
        googleFont: 'Raleway:wght@300;400;500;600;700;800',
    },
    'montserrat': {
        name: 'Montserrat',
        family: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Urban geometric sans-serif inspired by Buenos Aires',
        googleFont: 'Montserrat:wght@300;400;500;600;700;800;900',
    },
    'poppins': {
        name: 'Poppins',
        family: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
        description: 'Geometric sans-serif with Indian Devanagari support',
        googleFont: 'Poppins:wght@300;400;500;600;700;800;900',
    },
};

export default fonts;
