import crypto from 'crypto';
import querystring from 'qs';

// VNPay configuration
const vnpayConfig = {
  vnp_TmnCode: process.env.VNP_TMN_CODE,
  vnp_HashSecret: process.env.VNP_HASH_SECRET,
  vnp_Url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:3000/order/vnpay_return",
};

// Function to create VNPay payment URL
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr) => {
  const date = new Date();
  const createDate = formatDate(date);
  
  const currCode = 'VND';
  const locale = 'vn';
  
  // Build the VNPay payment data
  let vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: amount * 100, // Convert to VND (smallest unit)
    vnp_BankCode: 'NCB',
    vnp_CreateDate: createDate,
    vnp_CurrCode: currCode,
    vnp_IpAddr: ipAddr,
    vnp_Locale: locale,
    vnp_OrderInfo: orderInfo,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_TxnRef: `${orderId}_${createDate}`, // Unique transaction reference
    vnp_OrderType: 'billpayment',
  };
  
  // Sort and create signature
  vnpParams = sortObject(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(signData).digest('hex');
  vnpParams['vnp_SecureHash'] = signed;
  
  const paymentUrl = `${vnpayConfig.vnp_Url}?${querystring.stringify(vnpParams, { encode: false })}`;
  return paymentUrl;
};

// Function to validate VNPay return data
const validateReturnData = (vnpParams) => {
  const secureHash = vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];
  
  // Sort params
  const sortedParams = sortObject(vnpParams);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  return secureHash === signed;
};

// Helper function: Sort object by key
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

// Helper function: Format date to VNPay format
function formatDate(date) {
  const yyyy = date.getFullYear().toString();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

function pad(number) {
  return (number < 10 ? '0' : '') + number;
}

export { createPaymentUrl, validateReturnData };
