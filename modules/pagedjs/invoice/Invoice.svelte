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

  $: if(invoice) {
    console.log('Invoice update:', invoice)
  }

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
    payment: `NOTE: We are currently setting up a different bank transfer platform. Please hold off, as we’re still working on this. Credit Card payments through Stripe are currently available.
If the above options are unfeasible, contact us to arrange an alternative method of payment.`,
    description: `This invoice is for one Evergreen ticket. 
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