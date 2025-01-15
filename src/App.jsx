import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import TextInput from './components/TextInput'

function App() {
  const handleTextSubmit = (text) => {
    console.log('User entered:', text); // Placeholder for now
  };

  return (
    <>
      <Header/>
      <TextInput onSubmit={handleTextSubmit}/>

    </>
  )
}

export default App
