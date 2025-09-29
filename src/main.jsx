// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import './index.css'
// import App from './App.jsx'
// import Home from '@/pages/Home.jsx'
// import Generator from '@/pages/Generator.jsx'
// import About from '@/pages/About.jsx'
// import Contact from '@/pages/Contact.jsx'
// import Dashboard from '@/pages/Dashboard.jsx'

// const root = createRoot(document.getElementById('root'))
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route element={<App />}>
//           <Route index element={<Home />} />
//           <Route path="/generator" element={<Generator />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// )


import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
