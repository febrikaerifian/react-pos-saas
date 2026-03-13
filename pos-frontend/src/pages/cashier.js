import React, { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import { useReactToPrint } from 'react-to-print';

const Cashier = () => {

const [products,setProducts]=useState([]);
const [cart,setCart]=useState([]);
const [search,setSearch]=useState('');
const [payment,setPayment]=useState(0);

const [showToast,setShowToast]=useState({visible:false,type:'success'});
const [toastMessage,setToastMessage]=useState('');

const [lastTransaction,setLastTransaction]=useState(null);
const [showPreview,setShowPreview]=useState(false);

const receiptRef=useRef();

const user=JSON.parse(localStorage.getItem('user'));

useEffect(()=>{
fetchProducts();
},[]);

const fetchProducts=async()=>{
try{
const res=await api.get('/api/products');
setProducts(res.data);
}catch(err){
console.error(err);
}
};

const addToCart=(product)=>{

const exist=cart.find(i=>i.id===product.id);

if(exist){

setCart(
cart.map(item=>
item.id===product.id
? {...item,qty:item.qty+1}
: item
)
);

}else{

setCart([...cart,{...product,qty:1}]);

}

};

const updateQty=(id,qty)=>{
setCart(
cart.map(item=>
item.id===id
? {...item,qty:parseInt(qty)}
: item
)
);
};

const removeItem=(id)=>{
setCart(cart.filter(item=>item.id!==id));
};

const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
const change=payment-total;

const handlePrint=useReactToPrint({
content:()=>receiptRef.current,
documentTitle:"Receipt",
onAfterPrint:()=>setShowPreview(false)
});

const handleCheckout=async()=>{

if(cart.length===0)
return showToastMessage('Cart kosong');

if(payment<total)
return showToastMessage('Uang kurang');

try{

const res=await api.post('/api/transactions',{
branch_id:user?.branch_id,
items:cart,
total,
payment
});

const transactionData={
id:res.data.id||Date.now(),
date:new Date().toLocaleString(),
items:cart,
total,
payment,
change
};

setLastTransaction(transactionData);

setCart([]);
setPayment(0);

showToastMessage('Transaksi berhasil','success');

setShowPreview(true);

}catch(err){

console.error(err);

showToastMessage(
err.response?.data?.message || 'Terjadi kesalahan server',
'danger'
);

}

};

const showToastMessage=(message,type='warning')=>{
setToastMessage(message);
setShowToast({visible:true,type});

setTimeout(()=>{
setShowToast({visible:false,type});
},3000);
};

const filteredProducts=products.filter(p=>
p.name.toLowerCase().includes(search.toLowerCase())
);

return(

<div className="container-fluid position-relative">

<style>

{`

/* HEADER */

.header-gradient{
background:linear-gradient(90deg,#36d1dc,#5b86e5);
padding:16px 20px;
border-radius:12px;
color:white;
margin-bottom:20px;
}

/* PRODUCT CARD */

.product-card{
background:#fff;
border-radius:14px;
padding:14px;
cursor:pointer;
height:100%;
display:flex;
flex-direction:column;
justify-content:space-between;
box-shadow:0 3px 10px rgba(0,0,0,0.08);
}

.product-icon{
font-size:26px;
}

.product-name{
font-weight:600;
font-size:13px;
}

.product-price{
margin-top:6px;
background:#e9f7ef;
color:#198754;
padding:5px 8px;
border-radius:8px;
font-weight:700;
font-size:13px;
}

.product-stock{
font-size:11px;
padding:3px 7px;
border-radius:20px;
background:#e7f3ff;
color:#0d6efd;
margin-bottom:4px;
display:inline-block;
}

.product-stock.low{
background:#ffeaea;
color:#dc3545;
}

.product-btn{
margin-top:8px;
border:none;
background:linear-gradient(90deg,#36d1dc,#5b86e5);
color:white;
padding:6px;
border-radius:8px;
font-size:12px;
}

/* CHECKOUT */

.checkout-btn{
background:linear-gradient(90deg,#ff7e5f,#feb47b);
border:none;
font-weight:600;
padding:12px;
border-radius:10px;
color:white;
}

/* RECEIPT */

.receipt{
font-family:monospace;
font-size:12px;
width:100%;
}

.receipt-header{
text-align:center;
}

.receipt-logo{
width:60px;
margin-bottom:4px;
}

.receipt-divider{
border-top:1px dashed #000;
margin:6px 0;
}

.receipt-row{
display:flex;
justify-content:space-between;
}

.receipt-total{
font-weight:bold;
}

.receipt-footer{
text-align:center;
margin-top:10px;
}

/* PRINT */

@media print{

body{
margin:0;
}

.receipt{
width:58mm;
}

}

/* MOBILE GRID */

@media(max-width:600px){

.product-card{
padding:10px;
}

}

`}

</style>


{/* HEADER */}

<div className="header-gradient">

<div className="d-flex justify-content-between align-items-center flex-wrap">

<h4 className="fw-bold m-0">🧾 POS Cashier</h4>

<div>
Branch :
<b className="ms-1">
{user?.branch_name || '-'}
</b>
</div>

</div>

</div>


{/* TOAST */}

{showToast.visible&&(

<div className={`toast text-bg-${showToast.type} position-fixed top-0 end-0 m-3 show`}>

<div className="d-flex">

<div className="toast-body">
{toastMessage}
</div>

<button
className="btn-close btn-close-white me-2 m-auto"
onClick={()=>setShowToast({visible:false,type:'success'})}
/>

</div>

</div>

)}


<div className="row">

{/* CART */}

<div className="col-12 col-md-4 mb-3 order-1 order-md-2">

<div className="card shadow-lg border-0 rounded-4">

<div className="card-body">

<h5 className="fw-bold text-primary mb-3">
Cart 🛒
</h5>

{cart.length===0 && (
<p className="text-muted">Cart kosong</p>
)}

{cart.map(item=>(

<div key={item.id} className="d-flex justify-content-between mb-2">

<span>{item.name} x{item.qty}</span>

<span>
Rp {(item.price*item.qty).toLocaleString()}
</span>

<button
className="btn btn-sm btn-danger"
onClick={()=>removeItem(item.id)}
>
x
</button>

</div>

))}

<hr/>

<h5>Total : Rp {total.toLocaleString()}</h5>

<div className="mb-2">

<label>Bayar</label>

<input
type="number"
className="form-control"
value={payment}
onChange={(e)=>setPayment(parseInt(e.target.value)||0)}
/>

</div>

<h6>

Kembalian :

<span className="text-success ms-2">
Rp {change>0?change.toLocaleString():0}
</span>

</h6>

<button
className="checkout-btn w-100 mt-3"
onClick={handleCheckout}
>
💳 Checkout
</button>

</div>

</div>

</div>


{/* PRODUCTS */}

<div className="col-12 col-md-8 order-2 order-md-1">

<input
type="text"
className="form-control mb-3"
placeholder="Cari produk..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<div className="row g-3">

{filteredProducts.map(product=>(

<div key={product.id} className="col-4 col-md-4 col-lg-3">

<div
className="product-card"
onClick={()=>addToCart(product)}
>

<div>

<div className="product-icon">📦</div>

<div className={`product-stock ${product.stock<=5?'low':''}`}>
Stock {product.stock}
</div>

<div className="product-name">
{product.name}
</div>

<div className="product-price">
Rp {product.price.toLocaleString()}
</div>

</div>

<button className="product-btn">
Tambah
</button>

</div>

</div>

))}

</div>

</div>

</div>


{/* RECEIPT PREVIEW */}

{showPreview && lastTransaction && (

<div className="modal fade show d-block" style={{background:"rgba(0,0,0,0.5)"}}>

<div className="modal-dialog">

<div className="modal-content">

<div className="modal-header">
<h5 className="modal-title">Preview Struk</h5>
</div>

<div className="modal-body">

<div ref={receiptRef} className="receipt">

<div className="receipt-header">

<img src="/logo.png" alt="logo" className="receipt-logo"/>

<div><b>{user?.branch_name || "TOKO"}</b></div>

<div>{lastTransaction.date}</div>

</div>

<div className="receipt-divider"></div>

{lastTransaction.items.map(i=>(

<div key={i.id} className="receipt-row">

<span>{i.name} x{i.qty}</span>

<span>
Rp {(i.price*i.qty).toLocaleString()}
</span>

</div>

))}

<div className="receipt-divider"></div>

<div className="receipt-row receipt-total">
<span>Total</span>
<span>Rp {lastTransaction.total.toLocaleString()}</span>
</div>

<div className="receipt-row">
<span>Bayar</span>
<span>Rp {lastTransaction.payment.toLocaleString()}</span>
</div>

<div className="receipt-row">
<span>Kembali</span>
<span>Rp {lastTransaction.change.toLocaleString()}</span>
</div>

<div className="receipt-divider"></div>

<div className="receipt-footer">
Terima kasih
</div>

</div>

</div>

<div className="modal-footer">

<button
className="btn btn-primary w-100"
onClick={handlePrint}
>
🖨 Print Struk
</button>

</div>

</div>

</div>

</div>

)}

</div>

);

};

export default Cashier;
