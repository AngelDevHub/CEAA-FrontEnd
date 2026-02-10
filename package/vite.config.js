import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['apexcharts', 'react-apexcharts', 'react-chartjs-2', 'chart.js', 'react-sparklines'],
          ui: ['react-bootstrap', 'mdb-react-ui-kit', 'react-select', 'react-datepicker'],
          editor: ['@ckeditor/ckeditor5-build-classic', '@ckeditor/ckeditor5-react'],
          calendar: ['@fullcalendar/daygrid', '@fullcalendar/interaction', '@fullcalendar/react', '@fullcalendar/timegrid']
        }
      }
    }
  }
})
