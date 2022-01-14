
<div class="CalDate _shadow-2 {classes}" style="{styles} ">
  <!-- <div class="CalDate-month">{@html marked(month||'')}</div> -->
  {#if month&&showMonth}<div class="CalDate-month">{month}</div>{/if}
  {#if day&&showDay}<div class="CalDate-day">{day}</div>{/if}
  {#if dayname&&showDayname}<div class="CalDate-dayname">{@html marked(dayname||'')}</div>{/if}
  <!-- <div class="CalDate-year">2021</div> -->
  {#if time&&showTime}<div class="CalDate-time">{@html marked(time||'')}</div>{/if}
  {#if insert&&showInsert}<div class="CalDate-insert _md-pfix">{@html marked(insert||'')}</div>{/if}
</div>

<script>
  import marked from 'marked';

  export let str = 'AUG; 2; Wednesday; 19:00 ET', classes='', styles='' // example
  let month='', day='', dayname='', time='', insert=''
  export let showMonth=true, showDay=true, showDayname=true, showTime=true, showInsert=true

  $: if(str && str.length>0) {
    let calArr = str.split('; ')

    if(calArr.length >= 1)
      month = calArr[0].trim()

    if(calArr.length >= 2)
      day = calArr[1].trim()

    if(calArr.length >= 3)
      dayname = calArr[2].trim()

    if(calArr.length >= 4)
      time = calArr[3].trim()

    if(calArr.length >= 5)
      insert = calArr[4].trim()
  }

</script>


<style type="text/scss">

  .CalDate {
    text-align: center;
    max-width: 8rem;
    border-radius: 0.3rem;
    border: solid transparent 0px;
    overflow: hidden;
    padding-bottom: 0.25rem;
  }
  .CalDate-month {
    background-color: #D86156;
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 700;
    color: white;
  }
  .CalDate-day {
    text-transform: uppercase;
    font-size: 2.2rem;
    line-height: 2.2rem;
    font-weight: 700;
    padding: 1rem 0.5rem;
    padding-bottom: 0.4rem;
  }

  .CalDate-insert {
    padding: 0.5rem 1rem;
    border: 2px solid #c7f0c9;
    background: #f6fcf6;
    border-radius: 0.5rem;
    margin: 0 0.5rem;
    margin-bottom: 0.5rem;
  }

  .CalDate,
  .CalDate-day,
  .CalDate-dayname,
  .CalDate-time {
    background-color: white;
  }
</style>