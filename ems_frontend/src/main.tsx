import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import Provider from './lib/components/ClientProvider/client-provider'
import {ThemeRegistry} from './lib/components/Theme'
import './globals.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <ThemeRegistry>
      <App />
      </ThemeRegistry>
    </Provider>
  </StrictMode>
)
