'use client'

// ─── Amount → Words ──────────────────────────────────────────────────────────

const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN']
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']

function numToWords(n: number): string {
  if (n === 0) return 'ZERO'
  if (n < 0) return 'MINUS ' + numToWords(-n)
  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
  if (n < 1000) return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' ' + numToWords(n % 100) : '')
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '')
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '')
  return numToWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '')
}

function amountInWords(amount: number): string {
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  let result = numToWords(rupees) + ' RUPEES'
  if (paise > 0) result += ' AND ' + numToWords(paise) + ' PAISE'
  return result + ' ONLY'
}

// ─── Receipt Number Generator ─────────────────────────────────────────────────

function generateReceiptNo(paymentId: string, installmentNum: number): string {
  const short = paymentId?.slice(-6)?.toUpperCase() || 'XXXXXX'
  return `GTI/${short}/FRA/${installmentNum}`
}

// ─── Date Formatter ───────────────────────────────────────────────────────────

function formatReceiptDate(dateStr: string): { display: string; short: string } {
  const d = new Date(dateStr)
  const day = d.getDate().toString().padStart(2, '0')
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  const shortMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const year = d.getFullYear().toString().slice(2)
  return {
    display: `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
    short: `${day} ${shortMonths[d.getMonth()]}. ${year}`,
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PaymentReceiptProps {
  studentName: string
  amount: number
  paymentDate: string       // ISO string
  paymentId: string
  installmentNumber?: number   // 1 | 2 | 3
  description?: string         // e.g. "France Internship"
  utrNumber?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentReceiptPDF({
  studentName,
  amount,
  paymentDate,
  paymentId,
  installmentNumber = 1,
  description = 'France Internship',
  utrNumber,
}: PaymentReceiptProps) {
  const receiptNo = generateReceiptNo(paymentId, installmentNumber)
  const dateInfo = formatReceiptDate(paymentDate)
  const amountWords = amountInWords(amount)
  const formattedAmount = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Payment Receipt – ${studentName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #fff;
            color: #222;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            position: relative;
            padding: 0;
            overflow: hidden;
          }

          /* Left blue sidebar bar */
          .sidebar-bar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 14px;
            background: #1a3a6b;
          }

          /* Bottom blue bar */
          .bottom-bar {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 14px;
            background: #1a3a6b;
          }

          .content {
            padding: 48px 52px 80px 44px;
          }

          /* ── Header ── */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 36px;
          }

          .receipt-heading {
            font-size: 38px;
            font-weight: 900;
            color: #1a3a6b;
            letter-spacing: 6px;
            line-height: 1.15;
          }

          .logo-block {
            text-align: right;
          }

          .logo-text {
            font-size: 28px;
            font-weight: 900;
            line-height: 1;
          }
          .logo-text .grand { color: #1a3a6b; }
          .logo-text .tour  { color: #e63946; }

          .receipt-meta {
            margin-top: 10px;
            font-size: 10px;
            line-height: 1.8;
            color: #555;
            text-align: right;
          }

          .receipt-meta .label {
            font-weight: 700;
            color: #1a3a6b;
            display: inline-block;
            width: 80px;
            text-align: right;
            margin-right: 8px;
          }

          /* ── Student Name ── */
          .student-name {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 4px;
            color: #1a3a6b;
            text-transform: uppercase;
            margin-bottom: 36px;
            padding-bottom: 10px;
          }

          /* ── Table ── */
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .receipt-table thead tr {
            background: #1a3a6b;
            color: #fff;
          }

          .receipt-table thead th {
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            text-align: left;
          }

          .receipt-table thead th:last-child {
            text-align: right;
          }

          .receipt-table tbody td {
            padding: 14px 16px;
            font-size: 13px;
            border-bottom: 1px solid #e9e9e9;
          }

          .receipt-table tbody td:last-child {
            text-align: right;
            font-weight: 700;
          }

          .desc-highlight {
            color: #1a3a6b;
            font-weight: 700;
            text-transform: uppercase;
          }

          .amount-words-row td {
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 700;
            color: #333;
            border-bottom: 1px solid #e9e9e9;
          }

          .received-on-row td {
            padding: 12px 16px;
            font-size: 13px;
            background: #f0f4fb;
          }

          .received-on-row td:last-child {
            font-weight: 900;
            color: #1a3a6b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* ── Divider ── */
          .divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 36px 0 24px;
          }

          /* ── UTR row ── */
          .utr-row {
            font-size: 12px;
            color: #555;
            margin-bottom: 12px;
          }

          .utr-row span {
            font-weight: 700;
            color: #1a3a6b;
            margin-left: 4px;
          }

          /* ── Footer ── */
          .footer-contact {
            margin-top: 40px;
            font-size: 11px;
            color: #444;
            line-height: 1.8;
          }

          .footer-contact a {
            color: #1a3a6b;
            text-decoration: none;
          }

          .footer-address {
            position: absolute;
            bottom: 28px;
            left: 44px;
            right: 44px;
            text-align: center;
            font-size: 10px;
            color: #777;
            border-top: 1px solid #e0e0e0;
            padding-top: 8px;
          }

          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="sidebar-bar"></div>
          <div class="bottom-bar"></div>

          <div class="content">

            <!-- Header -->
            <div class="header">
              <div>
                <div class="receipt-heading">PAYMENT<br/>RECEIPT</div>
              </div>
              <div class="logo-block">
                <div class="logo-text">
                  <span class="grand">Grand</span><br/>
                  <span class="tour">Tour</span>
                </div>
                <div class="receipt-meta">
                  <div><span class="label">DATE:</span>${dateInfo.display}</div>
                  <div><span class="label">RECEIPT NO:</span>${receiptNo}</div>
                  ${utrNumber ? `<div><span class="label">UTR NO:</span>${utrNumber}</div>` : ''}
                </div>
              </div>
            </div>

            <!-- Student Name -->
            <div class="student-name">${studentName.toUpperCase()}</div>

            <!-- Table -->
            <table class="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Towards providing <span class="desc-highlight">${description.toUpperCase()}</span></td>
                  <td>${formattedAmount}</td>
                </tr>
                <tr class="amount-words-row">
                  <td colspan="2">In words &nbsp;<strong>${amountWords}</strong></td>
                </tr>
                <tr class="received-on-row">
                  <td>Payment received on</td>
                  <td>${dateInfo.short}</td>
                </tr>
              </tbody>
            </table>

            ${utrNumber ? `<div class="utr-row">Transaction / UTR Reference:<span>${utrNumber}</span></div>` : ''}

            <hr class="divider" />

            <!-- Footer contact -->
            <div class="footer-contact">
              Questions?<br/>
              Email us at <a href="mailto:contact@grandtour.in">contact@grandtour.in</a><br/>
              or call us at <strong>70 30 750 780</strong>
            </div>

            <!-- Footer address -->
            <div class="footer-address">
              Office No. 55, Amrut Ganga Society, Sinhagad Road, Pune - 411041 &nbsp;|&nbsp; www.grandtour.in
            </div>

          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return { handlePrint }
}

// ─── Hook convenience export ──────────────────────────────────────────────────

export function usePaymentReceipt(props: PaymentReceiptProps) {
  return PaymentReceiptPDF(props)
}
