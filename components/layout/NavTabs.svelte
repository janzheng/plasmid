

<script>
  // import Cytosis from 'cytosis'
  import marked from 'marked'

  // import { onMount, getContext, setContext } from 'svelte';
	import { _content } from "@/stores/sitedata"
  import { scrollToAnchor } from "@/_utils/scrollto.js";

  import CalDate from '@/components/CalDate.svelte'

  export let segment
  let top = _content('top') || ''
  let caldate = _content('_caldate') || '';

</script>

<nav class="Header __antialiased __content-header">
  <div class="Cover _center _margin-top-2">
    <a rel=prefetch href="/">
      <img class="Header-img" src="evg-full-logo.png" alt="Evergreen 2021" style="width: 350px; object-fit: contain">
    </a>
  </div> 
  <div class="Nav Home-content _padding-top-2 _margin-top-2">
    <div class="_section-article _margin-center _padding-xs">
    	<!-- <div class="_center _padding-bottom-2 _margin-top-2">
    		<a rel=prefetch href="/">
    			<img class="Header-img" src="evg-full-logo.png" alt="Evergreen 2021" style="width: 350px;">
    		</a>
    	</div>  -->
    	<div class=" _margin-center _center">
				<nav>
					<ul>
						<li class="_align-vertically"><a rel=prefetch class='{segment === undefined ? "__active" : ""}' aria-current='{segment === undefined ? "page" : undefined}' href='.'>Agenda</a></li>
						<!-- <li class="_align-vertically"><a rel=prefetch class='{segment === "past-events" ? "__active" : ""}' aria-current='{segment === "past-events" ? "page" : undefined}' href='past-events'>Past Events</a></li> -->
						<!-- <li class="_align-vertically"><a rel=prefetch class='{segment === "organizers" ? "__active" : ""}' aria-current='{segment === "organizers" ? "page" : undefined}' href='organizers'>Organizers</a></li> -->
					</ul>
				</nav> 
			</div>
    </div>
  </div>  

</nav>


<style type="text/scss">

	.Header, .Nav {
		// background-color: #FAFAFA; // #E7FBFF;
		// padding-bottom: 1rem;
		background-color: #DBF4E9;
	}

	.Header-img {
		// fix the jankiness of the header to align
		position: relative;
		left: -6px;
	}
  

	ul {
		text-align: center;
		display: flex;
		// justify-content: space-between;

		// @media (max-width: 768px) {
			// padding-left: 16px;
			// padding-right: 16px;
    	justify-content: center;
		// }

		li {
			margin: 0.5rem 1rem;
			text-align: left;


			@media (max-width: 768px) {
				margin: 0.4rem;
				* { 
					text-align: center;
				}
			}

			&:first-child {
				margin-left: 0;
			}

			a {
				font-size: 1.1em;
				text-decoration: none;

				// @media (max-width: 768px) {
				// 	font-size: 0.98em;
				// 	line-height: 1.25rem;
				// }

				&.__active {
					text-decoration: underline;
					// color: #035eb1;
					font-weight: bold;
				}

				&:hover {
					text-decoration: underline;
					// color: #035eb1;
				}

				&:focus {
					// color: #b90236;
				}
			}


		}
	}
</style>


