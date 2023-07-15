import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, isWithinInterval, parse, parseISO } from 'date-fns';
import './App.css';
import data from './assets/data.js';
import 'react-datepicker/dist/react-datepicker.css';

const parseDateString = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      drawBorder: false,
    },
    y: {
      stacked: true,
      grid: {
        borderDash: [5, 5],
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

function App() {
  const [dataset, setDataset] = useState([]);
  const [dates, setDates] = useState([]);
  const [count, setCount] = useState([]);
  const [filter, setFilter] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  useEffect(() => {
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setDataset(results.data);
        setDates([...new Set(results.data.map((item) => item.Date))].sort());
      },
    });
  }, []);

  useEffect(() => {
    let resultSet = [...dataset];
    if (filter) {
      resultSet = resultSet.filter((item) => item.App === filter);
    }
    const res = resultSet.reduce((acc, obj) => {
      const category = obj.Date;
      acc.set(category, (acc.get(category) || 0) + 1);
      return acc;
    }, new Map());
    setCount(res);
  }, [dataset, filter]);

  useEffect(() => {
    if (startDate && endDate) {
      setDates(
        [...new Set(dataset.map((item) => item.Date))].sort().filter((date) =>
          isWithinInterval(parseDateString(date), {
            start: startDate,
            end: endDate,
          })
        )
      );
    }
  }, [startDate, endDate]);

  const graphData = {
    labels: dates,
    datasets: [
      {
        maxBarThickness: 112,
        backgroundColor: '#cad9f3',
        data: dates.map((item) => count.get(item)),
      },
    ],
  };

  return (
    <div className='App'>
      <div className='graph-container'>
        <div className='select-container'>
          <Select
            defaultValue={''}
            placeholder={'Select Game'}
            isClearable={true}
            name='color'
            options={[...new Set(dataset.map((item) => item.App))].map(
              (item) => ({ label: item, value: item })
            )}
            onChange={(item) => setFilter(item.value)}
            styles={{
              container: (provided) => ({
                ...provided,
                width: '100%',
                marginBottom: 5,
              }),
            }}
          />
        </div>
        <div className='select-container'>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>

        <Bar options={options} data={graphData} />
      </div>
    </div>
  );
}

export default App;
