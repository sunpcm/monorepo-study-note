import React, { useState } from 'react';
import { Button } from '@niu/ui-lib'; // 直接引入！


const App = () => {
  const [count, setCount] = useState(0);

  console.log('API Address:', process.env.API_URL);

  return (
    <div className="container">
      <h1>Hello Webpack!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Add</button>
      <Button>Click Me</Button>
    </div>
  );
};

export default App;