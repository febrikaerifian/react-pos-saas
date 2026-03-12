import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { motion } from 'framer-motion';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const REFRESH_INTERVAL = 30000;

const Dashboard = () => {

  const token = localStorage.getItem('token');

  const user = useMemo(() => {
    return token ? jwtDecode(token) : null;
  }, [token]);

  const today = new Date();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    user?.role === 'cashier' ? user.branch_id : ''
  );

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [topProducts, setTopProducts] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const formatChartDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get('/api/branches');
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchStats = useCallback(async () => {

    try {

      const res = await api.get('/api/dashboard/stats', {
        params: {
          branch_id: selectedBranch,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });

      setStats(res.data);

    } catch (err) {
      console.error(err);
    }

  }, [selectedBranch, startDate, endDate]);

  const fetchChart = useCallback(async () => {

    try {

      const res = await api.get('/api/dashboard/sales-chart', {
        params: {
          branch_id: selectedBranch,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });

      const labels = res.data.labels.map(d => formatChartDate(d));

      setChartData(prev => ({
        ...prev,
        labels,
        datasets: [{
          label: 'Sales',
          data: res.data.data,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.12)',
          borderWidth: 3,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 3,
          pointBorderColor: '#0d6efd'
        }]
      }));

    } catch (err) {
      console.error(err);
    }

  }, [selectedBranch, startDate, endDate]);

  const fetchTopProducts = useCallback(async () => {

    try {

      const res = await api.get('/api/dashboard/top-products', {
        params: {
          branch_id: selectedBranch,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });

      setTopProducts({
        labels: res.data.map(p => p.name),
        datasets: [{
          label: 'Sold',
          data: res.data.map(p => p.total_sold),
          borderRadius: 8,
          backgroundColor: '#5b86e5'
        }]
      });

    } catch (err) {
      console.error(err);
    }

  }, [selectedBranch, startDate, endDate]);

  const fetchRecentTransactions = useCallback(async () => {

    try {

      const res = await api.get('/api/dashboard/recent-transactions', {
        params: {
          branch_id: selectedBranch,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });

      setRecentTransactions(res.data);

    } catch (err) {
      console.error(err);
    }

  }, [selectedBranch, startDate, endDate]);

  const fetchAll = useCallback(async () => {

    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchChart(),
      fetchTopProducts(),
      fetchRecentTransactions()
    ]);

    setLoading(false);

  }, [fetchStats, fetchChart, fetchTopProducts, fetchRecentTransactions]);

  useEffect(() => {

    if (user?.role !== 'cashier') {
      fetchBranches();
    }

  }, [user?.role, fetchBranches]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {

    const interval = setInterval(() => {
      fetchAll();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);

  }, [fetchAll]);

  const cardShadows = [
    '0 4px 20px rgba(13,110,253,0.2)',
    '0 4px 20px rgba(123,50,255,0.2)',
    '0 4px 20px rgba(255,193,7,0.2)'
  ];

  return (
    <>

<div style={{
background:'linear-gradient(90deg,#36d1dc,#5b86e5)',
padding:20,
borderRadius:12,
color:'#fff',
marginBottom:20
}}>

<div className="d-flex justify-content-between flex-wrap">

<h2>📊 Dashboard Analytics 
<span style={{
background:'#00ff9d',
color:'#000',
padding:'4px 10px',
borderRadius:20,
fontSize:12,
marginLeft:10
}}>
LIVE
</span>
</h2>

<div className="d-flex gap-3">

{user?.role !== 'cashier' && (

<select
className="form-select"
value={selectedBranch}
onChange={(e)=>setSelectedBranch(e.target.value)}
>

<option value="">All Branch</option>

{branches.map(b=>(
<option key={b.id} value={b.id}>{b.name}</option>
))}

</select>

)}

<DatePicker selected={startDate} onChange={(d)=>setStartDate(d)} className="form-control"/>
<DatePicker selected={endDate} onChange={(d)=>setEndDate(d)} className="form-control"/>

</div>
</div>
</div>

<div className="row g-4 mb-4">

{[
{title:'Total Sales',value:stats.totalSales,color:'text-success',currency:true},
{title:'Transactions',value:stats.totalTransactions,color:'text-primary'},
{title:'Products',value:stats.totalProducts,color:'text-warning'}
].map((s,i)=>(

<div className="col-md-4" key={i}>

<motion.div
initial={{ opacity:0, y:40 }}
animate={{ opacity:1, y:0 }}
transition={{ duration:0.5, delay:i*0.1 }}
className="card border-0 rounded-4"
style={{boxShadow:cardShadows[i]}}
>

<div className="card-body text-center">

<h6 className="text-muted">{s.title}</h6>

<h3 className={`fw-bold ${s.color}`}>
{s.currency
? `Rp ${s.value?.toLocaleString() || 0}`
: s.value?.toLocaleString() || 0}
</h3>

</div>

</motion.div>

</div>

))}

</div>

<div className="row g-4 mb-4">

<div className="col-md-6">

<div className="card border-0 rounded-4"
style={{boxShadow:'0 4px 20px rgba(0,123,255,0.2)'}}>

<div className="card-body">

<h5>Sales Trend</h5>

<div style={{height:260}}>

{chartData.labels && (

<Line
data={chartData}
plugins={[ChartDataLabels]}
options={{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
tooltip:{
callbacks:{
label:(ctx)=>`Rp ${ctx.parsed.y.toLocaleString()}`
}
},
datalabels:{
anchor:'end',
align:'top',
color:'#111',
font:{weight:'bold'}
}
},
scales:{
x:{grid:{display:false}},
y:{beginAtZero:true}
}
}}
/>

)}

</div>
</div>
</div>
</div>

<div className="col-md-6">

<div className="card border-0 rounded-4"
style={{boxShadow:'0 4px 20px rgba(123,50,255,0.2)'}}>

<div className="card-body">

<h5>🏆 Top Products</h5>

<div style={{height:260}}>

{topProducts.labels && (

<Bar
data={topProducts}
plugins={[ChartDataLabels]}
options={{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
datalabels:{
anchor:'end',
align:'top',
color:'#333',
font:{weight:'bold'}
}
},
scales:{
x:{grid:{display:false}},
y:{beginAtZero:true}
}
}}
/>

)}

</div>
</div>
</div>
</div>

</div>

<div className="card border-0 rounded-4"
style={{boxShadow:'0 4px 20px rgba(0,123,255,0.2)'}}>

<div className="card-body">

<h5>🕒 Recent Transactions</h5>

<div className="table-responsive" style={{maxHeight:320}}>

<table className="table table-hover align-middle">

<thead style={{position:'sticky',top:0,background:'#f8f9fa'}}>

<tr>
<th>Invoice</th>
<th>Cashier</th>
<th>Branch</th>
<th>Total</th>
<th>Time</th>
</tr>

</thead>

<tbody>

{recentTransactions.length>0 ? (

recentTransactions.map(tx=>(

<tr key={tx.id}>

<td>
<span className="badge bg-primary">
{tx.invoice_number || tx.id}
</span>
</td>

<td>{tx.cashier_name}</td>

<td>
<span className="badge bg-light text-dark">
{tx.branch_id}
</span>
</td>

<td className="fw-semibold text-success">
Rp {tx.total?.toLocaleString()}
</td>

<td className="text-muted">
{new Date(tx.created_at).toLocaleString()}
</td>

</tr>

))

):( 

<tr>
<td colSpan="5" className="text-center text-muted">
No recent transactions
</td>
</tr>

)}

</tbody>

</table>

</div>
</div>
</div>

</>
  );
};

export default Dashboard;

