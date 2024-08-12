import React, { useState, useEffect } from 'react';

const MgnifySourmash = () => {
  // Simulate some dummy data
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generating dummy data
    const fetchData = async () => {
      const dummyData = [
        { id: 1, name: 'Sample 1', value: 'Data 1' },
        { id: 2, name: 'Sample 2', value: 'Data 2' },
        { id: 3, name: 'Sample 3', value: 'Data 3' },
      ];
      setData(dummyData);
    };

    fetchData();
  }, []);

  return (
    <div className="mgnify-sourmash-component">
      <h1>Mgnify Sourmash Component</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MgnifySourmash;
