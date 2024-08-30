import React, { useState, useEffect, useMemo, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { useTable, useBlockLayout } from 'react-table';
import { FixedSizeList } from 'react-window';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


const generateRandomData = (rows, cols) => {
  return Array.from({ length: rows }, (_, rowIndex) => ({
    id: rowIndex,
    ...Array.from({ length: cols - 1 }, (_, colIndex) => ({
      [`value${colIndex + 1}`]: Math.random() * 100
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  }));
};


const RealTimeTable = ({ data }) => {
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      Header: key.charAt(0).toUpperCase() + key.slice(1),
      accessor: key,
      width: 100, // Set a fixed width for each column
    }));
  }, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useBlockLayout
  );

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div {...row.getRowProps({ style })} className="tr">
          {row.cells.map(cell => (
            <div {...cell.getCellProps()} className="td" key={cell.column.id}>
              {cell.render('Cell')}
            </div>
          ))}
        </div>
      );
    },
    [prepareRow, rows]
  );

  // Calculate the total width of all columns
  const tableWidth = columns.reduce((sum, column) => sum + (column.width || 100), 0);

  return (
    <div {...getTableProps()} className="table" style={{ width: tableWidth }}>
      <div className="thead">
        {headerGroups.map(headerGroup => (
          <div {...headerGroup.getHeaderGroupProps()} className="tr" key={headerGroup.id}>
            {headerGroup.headers.map(column => (
              <div {...column.getHeaderProps()} className="th" key={column.id}>
                {column.render('Header')}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div {...getTableBodyProps()} className="tbody">
        <FixedSizeList
          height={200} // Adjust this value based on how many rows you want to display
          itemCount={rows.length}
          itemSize={35} // Height of each row
          width={tableWidth}
          overscanCount={5} // Render a few extra rows for smoother scrolling
        >
          {RenderRow}
        </FixedSizeList>
      </div>
    </div>
  );
};

const RealTimeChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

function App() {
  const [data, setData] = useState({
    table1: generateRandomData(5, 5),
    table2: generateRandomData(10, 10),
    chartData: Array.from({ length: 20 }, (_, i) => ({ name: i, value: Math.random() * 100 }))
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        table1: generateRandomData(5, 5),
        table2: generateRandomData(10, 10),
        chartData: Array.from({ length: 20 }, (_, i) => ({ name: i, value: Math.random() * 100 }))
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Financial Dashboard</h1>
      </header>
      <main>
        <div className="financial-dashboard">
          <h2>5x5 Table</h2>
          <RealTimeTable data={data.table1} />
          <h2>10x10 Table</h2>
          <RealTimeTable data={data.table2} />
          <h2>Real-time Chart</h2>
          <RealTimeChart data={data.chartData} />
        </div>
      </main>
    </div>
  );
}

export default App;
