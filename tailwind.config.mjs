/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        'custom-bg-header': '#E3EBF2',
        btnBlue: '#287DCE', // Replace with your desired color code
        customGreen: '#10B981',
        customPulseColor: '#E3EBF2',
       
          customBlue: '#FFFFFF',
          customPurple: '#f7f9fb',
        
         // Your custom color
      },
      screens: {
        'xsize': { 'max': '639px' },
        'xsmsize':{'max': '767px'} // Custom "xs" breakpoint for screens below 640px
      },
      boxShadow: {
        'custom-shadow': '1px 1px 42px -41px',//'1px 4px 40px -30px',
      },
    },
  },
  plugins: [],
};
