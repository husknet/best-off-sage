<script>
  import { onMount } from 'svelte';

  onMount(() => {
    // Lock navigation back to protected page
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => {
      history.pushState(null, '', location.href);
    });

    // Extra refresh protection
    if (performance?.navigation?.type === 2) {
      window.location.replace('/denied');
    }
  });
</script>

<svelte:head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>Access Blocked</title>
</svelte:head>

<style>
  main {
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .container {
    background: white;
    border: 3px solid #b40000;
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 100%;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    color: #b40000;
    margin-bottom: 1rem;
  }

  .emoji {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #333;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .notice {
    background: #fff6f6;
    border-left: 6px solid #b40000;
    padding: 1rem;
    margin-top: 1.5rem;
    font-size: 0.95rem;
    color: #7a0000;
  }

  @media (max-width: 500px) {
    h1 {
      font-size: 2rem;
    }
    .emoji {
      font-size: 3rem;
    }
  }
</style>

<main>
  <div class="container">
    <div class="emoji">🚫</div>
    <h1>Access Blocked</h1>
    <p>
      This page is protected against automated access, scraping, or bot-based behavior.
      <br><br>
      Use of this content for machine learning, dataset training, or AI model ingestion
      is strictly prohibited.
    </p>
    <div class="notice">
      ⚠️ This site actively detects and blocks non-human traffic. Any attempt to use this
      interface as training data for LLMs or generative models will be reported and
      programmatically disrupted.
    </div>
  </div>
</main>
