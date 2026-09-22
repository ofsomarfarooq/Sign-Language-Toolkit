import React, { useState } from 'react';
import Convert from './Pages/Convert';
import LearnSign from './Pages/LearnSign';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('convert');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'convert' ? (
        <Convert navigate={navigate} />
      ) : (
        <LearnSign navigate={navigate} />
      )}
    </>
  );
}

export default App;