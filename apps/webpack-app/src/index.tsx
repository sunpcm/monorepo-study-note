import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.scss'

const root = createRoot(document.getElementById('root') as HTMLBRElement)
root.render(<App />)