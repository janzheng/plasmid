<!-- 

  


 -->



<div class="font-serif">
  <div class="">
    {#if invoice.logoUrl}
      <div class="logo">
        <img src={invoice.logoUrl} width={invoice.logoWidth} alt="Logo Header"/>
      </div>
    {/if}
    
    <div class="invoice-header pt-4">
      <div class="text-sm mt-4 mb-2">Invoice</div>
      <div class="text-lg font-bold">{@html marked(invoice.title)}</div>
        <dl class="grid grid-cols-1-4">
          <dt class="">Invoice #:</dt><dd>{invoice.number}</dd>
          <dt class="">Invoice Date:</dt><dd>{invoice.date}</dd>
          <dt class="">Due Date:</dt><dd>{invoice.dueDate}</dd>
        </dl>
    </div>

    
    <div class="invoice-payee-payer | grid grid-cols-2 | my-8">
      <div class="invoice-payee">{@html marked(payee.details)}</div>
      <div class="invoice-payer">{@html marked(payer.details)}</div>
    </div>
    
    <div class="invoice-main mt-4">
      <div class="invoice-due text-lg font-bold">Total amount due: {invoice.symbol}{invoice.amount} {invoice.currency}</div>
      <div class="invoice-description">{@html marked(invoice.description)}</div>
      <div class="invoice-payment">{@html marked(invoice.payment)}</div>
    </div>


  </div>
</div>

<script>
  import { marked } from 'marked';
  marked.use({
    breaks: true,
  })

  export let invoice = {
    logoUrl: "https://f2.phage.directory/airscripts/-evergreen-2023-live/content/rectaUjlWh18lEZzG/evg23-full-logo.png",
    logoWidth: "120px",
    title: `25<sup>th</sup> Biennial Evergreen International Phage Meeting Invoice`,
    number: `invoice-123`,
    date: `2023-08-06`,
    dueDate: `2023-08-06`,
    amount: "950",
    symbol: "$",
    currency: "USD",
    payment: `Please pay using Transferwise to
Transferwise details here
If the above options are unfeasible, contact us to arrange an alternative method of payment.`,
    description: `This invoice is for [Evergreen ticket name] + ticket details 
    `,
  };
  
  export let payee = {
    details: `Jan Zheng (Phage Directory) 
950 W Peachtree St NW # 1904
Atlanta, GA, 30309, United States 
(443) 280-4381 
https://phage.directory`,
  };

  export let payer = {
    details: `Cathia Falvey 
Mary Ann Liebert, Inc., publishers
140 Huguenot Street, 3rd Floor New Rochelle, 
NY 10801-5215 
cfalvey@liebertpub.com`,
  };

</script>
<!-- 

<div>
  <div class="grid grid-cols-3">
    <h1>Logo</h1>
    <div class="col-span-2">
      <h5>Project</h5>
      <h3>5200 Praire Dr <span class="Card-solid text-sm px-1">2021-293</span></h3>
    </div>
    <div>
      <h5>Bill from</h5>
      <h4>Architects, Inc.</h4>
      <p>
        1000 Market St
        <br />
        San Francisco, CA 94102
      </p>
    </div>
    <div>
      <h5>Bill to</h5>
      <h4>The Client, LLC</h4>
      <p>
        48 California St
        <br />
        San Francisco, CA 94119
      </p>
    </div>

    <div>
      <h5>Issue date</h5>
      <p>Aug 9, 2021</p>
    </div>
    <div>
      <h5>Terms</h5>
      <p>Net 30</p>
    </div>
    <div>
      <h5>Due date</h5>
      <p>Sep 3, 2021</p>
    </div>

    <div>
      <h5>Services through</h5>
      <p>Jul 1, 2021 - Jul 31, 2021</p>
    </div>
    <div>
      <h5>Reference number</h5>
      <p>PA-2381</p>
    </div>
    <div>
      <h5>Invoice number</h5>
      <p>2021-0048</p>
    </div>
  </div>
</div> -->
