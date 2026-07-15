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

function generateReceiptNo(studentName: string, paymentDate: string, paymentId: string): string {
  const cleanName = (studentName || '').trim().replace(/[^a-zA-Z\s]/g, '').toUpperCase()
  const parts = cleanName.split(/\s+/)
  let initials = ''
  if (parts.length >= 2) {
    initials = parts[0].slice(0, 2) + parts[parts.length - 1].slice(0, 2)
  } else if (parts.length === 1) {
    initials = parts[0].slice(0, 4)
  }
  initials = initials.padEnd(4, 'X')

  const d = new Date(paymentDate)
  const shortYear = isNaN(d.getTime()) ? '26' : d.getFullYear().toString().slice(-2)

  // Extract numeric characters from paymentId to make a 3-digit serial, or fallback to a hash
  let serial = ''
  if (paymentId) {
    const digits = paymentId.replace(/\D/g, '')
    if (digits.length >= 3) {
      serial = digits.slice(-3)
    } else {
      let hash = 0
      for (let i = 0; i < paymentId.length; i++) {
        hash = paymentId.charCodeAt(i) + ((hash << 5) - hash)
      }
      serial = Math.abs(hash % 1000).toString().padStart(3, '0')
    }
  } else {
    serial = '010'
  }

  return `GTI/${initials}/FRA/${shortYear}${serial}`
}

// ─── Date Formatters ───────────────────────────────────────────────────────────

function formatDDMMYYYY(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '27/04/2026'
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatDDMMYY(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '27/04/26'
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear().toString().slice(-2)
  return `${day}/${month}/${year}`
}

function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  })
  return `${formatter.format(amount)}/-`
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
  const receiptNo = generateReceiptNo(studentName, paymentDate, paymentId)
  const formattedDate = formatDDMMYYYY(paymentDate)
  const paymentDateShort = formatDDMMYY(paymentDate)
  const amountWords = amountInWords(amount).toUpperCase()
  const formattedAmount = formatAmount(amount)

  let descText = 'Towards Providing Internship in France'
  if (description) {
    if (description.toLowerCase().includes('france') && description.toLowerCase().includes('internship')) {
      descText = 'Towards Providing Internship in France'
    } else {
      descText = `Towards Providing ${description}`
    }
  }

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

          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Satisfy&display=swap');

          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #fff;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            position: relative;
            padding: 60px 70px;
            background-color: #FDFBF7;
            overflow: hidden;
            box-sizing: border-box;
          }

          /* Header */
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
          }

          .title-container {
            position: relative;
            margin-top: 10px;
          }

          .internship-text {
            font-family: 'Satisfy', cursive;
            font-size: 56px;
            color: #FCD679;
            line-height: 0.9;
            margin-bottom: -12px;
            margin-left: 2px;
            transform: rotate(-3deg);
            transform-origin: left bottom;
          }

          .receipt-title {
            font-family: 'Inter', sans-serif;
            font-weight: 900;
            font-size: 46px;
            line-height: 1.05;
            color: #000000;
            letter-spacing: 0.5px;
          }

          .logo-container {
            margin-top: 15px;
          }

          .logo-img {
            width: 170px;
            height: auto;
            display: block;
          }

          /* Metadata */
          .meta-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 35px;
            font-family: 'Inter', sans-serif;
            color: #000000;
            font-size: 16px;
            line-height: 1.5;
          }

          .meta-left {
            font-weight: 700;
          }

          .meta-left strong {
            font-weight: 900;
          }

          .meta-right {
            text-align: left;
            font-weight: 500;
          }

          .receipt-no-label {
            margin-top: 8px;
          }

          .receipt-no-val {
            font-weight: 500;
          }

          /* Table */
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 45px;
          }

          .receipt-table th {
            background-color: #FCD679;
            color: #000000;
            font-family: 'Inter', sans-serif;
            font-weight: 900;
            font-size: 15px;
            padding: 14px 20px;
            text-align: left;
            letter-spacing: 0.5px;
          }

          .receipt-table th.col-total {
            text-align: right;
          }

          .content-row td {
            background-color: #FFFFFF;
            color: #000000;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 15px;
            padding: 18px 20px;
            text-align: left;
          }

          .content-row td.amount-val {
            text-align: right;
          }

          .spacer-row td {
            background-color: #F9F5EB; /* light cream */
            height: 35px;
            padding: 0;
          }

          /* Payment Info Box */
          .payment-info-box {
            background-color: #FCD679;
            padding: 24px 20px;
            margin-top: 25px;
            box-sizing: border-box;
          }

          .info-line {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #000000;
          }

          .info-line strong {
            font-weight: 900;
          }

          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; background: #fff; }
            .page {
              width: 210mm;
              height: 297mm;
              margin: 0;
              box-shadow: none;
              background-color: #FDFBF7 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          
          <!-- Top-Right Plane Trail SVG -->
          <svg width="280" height="180" style="position: absolute; top: 125px; right: 0; pointer-events: none;" viewBox="0 0 280 180">
            <path d="M 100,60 C 150,65 210,80 290,120" fill="none" stroke="#5E2729" stroke-width="1.5" stroke-dasharray="4,4" />
            <g transform="translate(100, 60) rotate(-115) scale(1.1)">
              <path d="M12 2C11.5 2 11 3 11 4.5V11L3 13.5V15.5L11 14.5V19.5L8.5 21V22.5L12 21.5L15.5 22.5V21L13 19.5V14.5L21 15.5V13.5L13 11V4.5C13 3 12.5 2 12 2Z" fill="#5E2729" />
            </g>
          </svg>

          <!-- Bottom-Left Plane Trail SVG -->
          <svg width="220" height="180" style="position: absolute; bottom: 220px; left: 0; pointer-events: none;" viewBox="0 0 220 180">
            <path d="M 120,70 C 70,80 20,100 -10,140" fill="none" stroke="#5E2729" stroke-width="1.5" stroke-dasharray="4,4" />
            <g transform="translate(120, 70) rotate(65) scale(1.1)">
              <path d="M12 2C11.5 2 11 3 11 4.5V11L3 13.5V15.5L11 14.5V19.5L8.5 21V22.5L12 21.5L15.5 22.5V21L13 19.5V14.5L21 15.5V13.5L13 11V4.5C13 3 12.5 2 12 2Z" fill="#5E2729" />
            </g>
          </svg>

          <!-- Bottom-Right Paris Skyline & Fireworks SVG -->
          <svg width="320" height="320" style="position: absolute; bottom: 20px; right: 20px; pointer-events: none;" viewBox="140 -30 280 280">
            <!-- Fireworks Sparks -->
            <!-- Radius 20 -->
            <circle cx="290" cy="40" r="2" fill="#2C5282" />
            <circle cx="307" cy="50" r="1.5" fill="#D9383A" />
            <circle cx="300" cy="77" r="2.5" fill="#2C5282" />
            <circle cx="276" cy="74" r="2" fill="#D9383A" />
            <circle cx="273" cy="50" r="1.5" fill="#2C5282" />
            <!-- Radius 40 -->
            <circle cx="290" cy="20" r="2" fill="#D9383A" />
            <circle cx="318" cy="32" r="2.5" fill="#2C5282" />
            <circle cx="330" cy="60" r="2" fill="#D9383A" />
            <circle cx="318" cy="88" r="1.5" fill="#2C5282" />
            <circle cx="292" cy="98" r="2" fill="#D9383A" />
            <circle cx="262" cy="88" r="2.5" fill="#2C5282" />
            <circle cx="250" cy="60" r="1.5" fill="#D9383A" />
            <circle cx="262" cy="32" r="2" fill="#2C5282" />
            <!-- Radius 60 -->
            <circle cx="305" cy="2" r="2" fill="#2C5282" />
            <circle cx="332" cy="18" r="2.5" fill="#D9383A" />
            <circle cx="348" cy="45" r="1.5" fill="#2C5282" />
            <circle cx="348" cy="75" r="2.5" fill="#D9383A" />
            <circle cx="332" cy="102" r="2" fill="#2C5282" />
            <circle cx="275" cy="118" r="2" fill="#D9383A" />
            <circle cx="248" cy="102" r="1.5" fill="#2C5282" />
            <circle cx="232" cy="75" r="2.5" fill="#D9383A" />
            <circle cx="232" cy="45" r="2" fill="#2C5282" />
            <circle cx="248" cy="18" r="1.5" fill="#D9383A" />
            <!-- Radius 80 -->
            <circle cx="290" cy="-20" r="3" fill="#D9383A" />
            <circle cx="346" cy="4" r="2" fill="#2C5282" />
            <circle cx="366" cy="35" r="2.5" fill="#D9383A" />
            <circle cx="370" cy="60" r="3" fill="#2C5282" />
            <circle cx="366" cy="85" r="2" fill="#D9383A" />
            <circle cx="346" cy="116" r="2.5" fill="#2C5282" />
            <circle cx="234" cy="116" r="2" fill="#D9383A" />
            <circle cx="214" cy="85" r="3" fill="#2C5282" />
            <circle cx="210" cy="60" r="2.5" fill="#D9383A" />
            <circle cx="214" cy="35" r="2" fill="#2C5282" />
            <circle cx="234" cy="4" r="2.5" fill="#D9383A" />
            <!-- Organic scattered dots -->
            <circle cx="245" cy="38" r="1" fill="#D9383A" />
            <circle cx="260" cy="48" r="1.5" fill="#2C5282" />
            <circle cx="235" cy="90" r="1.2" fill="#D9383A" />
            <circle cx="220" cy="76" r="2" fill="#2C5282" />
            <circle cx="255" cy="78" r="1.8" fill="#D9383A" />
            <circle cx="265" cy="88" r="1.5" fill="#2C5282" />
            <circle cx="210" cy="60" r="1.2" fill="#D9383A" />
            <circle cx="270" cy="62" r="2.2" fill="#2C5282" />
            <circle cx="230" cy="20" r="1.6" fill="#D9383A" />
            <circle cx="250" cy="20" r="1.8" fill="#2C5282" />
            <circle cx="275" cy="10" r="1.3" fill="#D9383A" />
            <circle cx="290" cy="40" r="1.5" fill="#2C5282" />
            <circle cx="310" cy="80" r="1.7" fill="#D9383A" />
            <circle cx="190" cy="50" r="2" fill="#2C5282" />
            <circle cx="170" cy="75" r="1.5" fill="#D9383A" />
            <circle cx="185" cy="100" r="2.2" fill="#2C5282" />
            <circle cx="200" cy="120" r="1.8" fill="#D9383A" />
            <circle cx="220" cy="110" r="1.4" fill="#2C5282" />
            <circle cx="260" cy="115" r="2" fill="#D9383A" />
            <circle cx="280" cy="100" r="1.6" fill="#2C5282" />
            <circle cx="300" cy="70" r="1.8" fill="#D9383A" />

            <!-- Skyline Outline -->
            <path d="
              M 150,240 
              C 153,235 156,233 159,233 
              C 162,233 165,240 170,240 
              L 180,240 
              C 185,210 205,210 210,240 
              L 220,240 
              L 225,240 L 225,212 L 250,212 L 250,240 
              L 260,240 
              L 265,240 
              C 270,220 280,195 282,195 
              L 298,195 
              C 300,195 310,220 315,240 
              L 325,240 
              C 328,222 342,222 345,240 
              L 355,240 
              C 355,215 375,210 380,210 
              C 385,210 405,215 405,240 
              L 420,240
            " stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Eiffel Tower details -->
            <path d="M 273,240 C 278,215 302,215 307,240" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" />
            <path d="M 284,195 C 286,155 289,130 289,110 L 291,110 C 291,130 294,155 296,195" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 287,145 L 293,145" stroke="#222" stroke-width="1.2" fill="none" />
            <path d="M 290,110 L 290,90" stroke="#222" stroke-width="1.2" fill="none" />
            
            <!-- Arc de Triomphe details -->
            <path d="M 232,240 L 232,225 C 232,220 243,220 243,225 L 243,240" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" />
            <path d="M 223,212 L 252,212" stroke="#222" stroke-width="1.2" fill="none" />

            <!-- Dome Spire details -->
            <path d="M 197.5,210 L 197.5,195" stroke="#222" stroke-width="1.2" fill="none" />
            
            <!-- Birds -->
            <path d="M 295,160 Q 297,157 299,160 Q 301,157 303,160" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" />
            <path d="M 305,170 Q 307,167 309,170 Q 311,167 313,170" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" />
            <path d="M 278,165 Q 280,162 282,165 Q 284,162 286,165" stroke="#222" stroke-width="1.2" fill="none" stroke-linecap="round" />
          </svg>

          <!-- Header Section -->
          <div class="header-section">
            <div class="title-container">
              <div class="internship-text">Internship</div>
              <div class="receipt-title">PAYEMNT</div>
              <div class="receipt-title">RECEIPT</div>
            </div>
            <div class="logo-container">
              <img src="/logo.png" alt="Grand Tour" class="logo-img" />
            </div>
          </div>

          <!-- Metadata Section -->
          <div class="meta-section">
            <div class="meta-left">
              <strong>To : ${studentName}</strong>
            </div>
            <div class="meta-right">
              <div>Date: ${formattedDate}</div>
              <div class="receipt-no-label">Receipt No.:</div>
              <div class="receipt-no-val">${receiptNo}</div>
            </div>
          </div>

          <!-- Table -->
          <table class="receipt-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th class="col-total">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr class="content-row">
                <td>${descText}</td>
                <td class="amount-val">${formattedAmount}</td>
              </tr>
              <tr class="spacer-row">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <!-- Payment Info Box -->
          <div class="payment-info-box">
            <div class="info-line"><strong>PAYMENT RECEIVED ON:</strong> &nbsp;${paymentDateShort}</div>
            <div class="info-line"><strong>IN WORDS:</strong> &nbsp;${amountWords}</div>
          </div>

        </div>
        \x3Cscript\x3E
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        \x3C/script\x3E
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
